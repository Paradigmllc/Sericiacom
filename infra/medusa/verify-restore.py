#!/usr/bin/env python3
"""Restore a trusted Medusa custom-format dump into a disposable offline database."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import time
import uuid

REQUIRED_TABLES = {'product', 'product_variant', 'inventory_item', 'inventory_level', 'order'}
SUMMARY_SQL = """
CREATE TEMP TABLE restore_counts (name text, rows bigint);
DO $$ DECLARE t record; n bigint; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename LOOP
  EXECUTE format('SELECT count(*) FROM public.%I', t.tablename) INTO n;
  INSERT INTO restore_counts VALUES(t.tablename,n);
 END LOOP;
END $$;
SELECT json_build_object(
 'tables',(SELECT json_object_agg(name,rows) FROM restore_counts),
 'active_commerce_rows',json_build_object(
   'product',(SELECT count(*) FROM product WHERE deleted_at IS NULL),
   'product_variant',(SELECT count(*) FROM product_variant WHERE deleted_at IS NULL),
   'inventory_item',(SELECT count(*) FROM inventory_item WHERE deleted_at IS NULL),
   'inventory_level',(SELECT count(*) FROM inventory_level WHERE deleted_at IS NULL),
   'order',(SELECT count(*) FROM public."order" WHERE deleted_at IS NULL)),
 'invalid_indexes',(SELECT count(*) FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid
   JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT i.indisvalid),
 'unvalidated_constraints',(SELECT count(*) FROM pg_constraint c
   JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND NOT c.convalidated)
);
"""


def run(*args, stdin=None, timeout=120):
    result = subprocess.run(args, stdin=stdin, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, timeout=timeout)
    if result.returncode:
        # Restore errors can contain row values or credentials; never emit stderr.
        raise RuntimeError(f'{args[0]} operation failed (exit {result.returncode}); inspect privately')
    return result.stdout.decode().strip()


def validate_dump(handle, expected):
    if not re.fullmatch(r'[0-9a-f]{64}', expected):
        raise ValueError('Expected SHA256 must be 64 lowercase hex characters')
    if handle.read(5) != b'PGDMP':
        raise ValueError('Expected a PostgreSQL custom-format dump')
    handle.seek(0)
    hasher = hashlib.sha256()
    for chunk in iter(lambda: handle.read(1024 * 1024), b''):
        hasher.update(chunk)
    digest = hasher.hexdigest()
    if digest != expected:
        raise ValueError('Archive SHA256 mismatch; restore was not started')
    handle.seek(0)
    return digest


def validate_summary(summary):
    if not REQUIRED_TABLES.issubset(summary['tables']):
        raise ValueError('Restored archive is missing required Medusa tables')
    if summary['invalid_indexes'] or summary['unvalidated_constraints']:
        raise ValueError('Restored database has invalid indexes or unvalidated constraints')
    return summary


def verify(args):
    if not re.fullmatch(r'sha256:[0-9a-f]{64}', args.image):
        raise ValueError('Use the exact local image ID from the running PostgreSQL container')
    name = 'sericia-restore-check-' + uuid.uuid4().hex
    report = {'status': 'failed', 'image': args.image, 'container': name,
              'checked_at': datetime.now(timezone.utc).isoformat(), 'stage': 'archive'}
    started = time.monotonic()
    created = False
    try:
        with open(args.dump, 'rb') as archive:
            report['archive_sha256'] = validate_dump(archive, args.sha256)
            report['stage'] = 'create'
            # No host mounts, published ports, external network, credentials, or app workers.
            run('docker', 'create', '--name', name, '--network', 'none', '--pull', 'never',
                '--memory', '768m', '--memory-swap', '768m', '--cpus', '0.5', '--pids-limit', '128',
                '--security-opt', 'no-new-privileges:true', '--read-only',
                '--tmpfs', '/var/lib/postgresql/data:rw,size=512m',
                '--tmpfs', '/var/run/postgresql:rw,size=8m', '--tmpfs', '/tmp:rw,size=8m',
                '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_DB=restore_check',
                args.image, 'postgres', '-c', 'shared_buffers=32MB', '-c', 'max_connections=10')
            created = True
            run('docker', 'start', name)
            report['stage'] = 'ready'
            for _ in range(40):
                check = subprocess.run(['docker', 'exec', name, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres',
                                        '-d', 'restore_check'], stdout=subprocess.DEVNULL,
                                       stderr=subprocess.DEVNULL, timeout=10)
                if check.returncode == 0:
                    break
                time.sleep(1)
            else:
                raise RuntimeError('Isolated PostgreSQL did not become ready')
            report['stage'] = 'restore'
            run('docker', 'exec', '-i', name, 'pg_restore', '-U', 'postgres', '-d', 'restore_check',
                '--exit-on-error', '--single-transaction', '--no-owner', '--no-acl',
                '--no-subscriptions', stdin=archive, timeout=180)
            report['stage'] = 'validate'
            summary = json.loads(run('docker', 'exec', name, 'psql', '-X', '-qAt', '-U', 'postgres',
                                     '-d', 'restore_check', '-v', 'ON_ERROR_STOP=1', '-c', SUMMARY_SQL))
            report.update(validate_summary(summary))
            report['status'] = 'passed'
            report['stage'] = 'complete'
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired, KeyboardInterrupt) as error:
        report['error'] = str(error) if not isinstance(error, subprocess.TimeoutExpired) else 'Operation timed out'
        if isinstance(error, KeyboardInterrupt):
            report['error'] = 'Interrupted; isolated container cleanup requested'
    finally:
        if created:
            try:
                run('docker', 'rm', '-f', '-v', name)
                report['container_removed'] = True
            except (OSError, RuntimeError, subprocess.TimeoutExpired):
                report.update(status='failed', container_removed=False,
                              cleanup_error='Remove the named isolated test container before retrying')
        else:
            report['container_removed'] = None
        report['duration_seconds'] = round(time.monotonic() - started, 2)
    return report


def interrupted(*_):
    raise KeyboardInterrupt()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dump', required=True, type=Path)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--image', required=True)
    parser.add_argument('--report', required=True, type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    signal.signal(signal.SIGTERM, interrupted)
    # Refuse overwrites, including symlinks; reserve the evidence file before touching Docker.
    with args.report.open('x') as output:
        report = verify(args)
        json.dump(report, output, indent=2)
        output.write('\n')
    print(json.dumps({key: report[key] for key in
                      ('status', 'stage', 'container', 'container_removed', 'duration_seconds')}))
    return 0 if report['status'] == 'passed' else 1


if __name__ == '__main__':
    sys.exit(main())
