import hashlib
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch
import tempfile
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location('restore', Path(__file__).parents[1] / 'verify-restore.py')
restore = importlib.util.module_from_spec(spec)
spec.loader.exec_module(restore)


class RestoreValidation(unittest.TestCase):
    def test_checksum_and_format_before_docker(self):
        data = b'PGDMPtrusted fixture'
        digest = hashlib.sha256(data).hexdigest()
        archive = io.BytesIO(data)
        self.assertEqual(restore.validate_dump(archive, digest), digest)
        self.assertEqual(archive.tell(), 0)
        for content, expected in [(data, '0' * 64), (b'not a dump', digest), (data, 'invalid')]:
            with self.assertRaises(ValueError):
                restore.validate_dump(io.BytesIO(content), expected)

    def test_all_required_tables_and_integrity(self):
        summary = {'tables': {name: 0 for name in restore.REQUIRED_TABLES},
                   'invalid_indexes': 0, 'unvalidated_constraints': 0}
        self.assertEqual(restore.validate_summary(summary), summary)
        for change in [{'tables': {'product': 6}}, {'invalid_indexes': 1},
                       {'unvalidated_constraints': 1}]:
            with self.assertRaises(ValueError):
                restore.validate_summary({**summary, **change})

    def test_restore_failure_removes_only_isolated_container(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / 'test.dump'
            archive.write_bytes(b'PGDMPbroken fixture')
            args = SimpleNamespace(dump=archive, sha256=hashlib.sha256(archive.read_bytes()).hexdigest(),
                                   image='sha256:' + '1' * 64)
            calls = []
            def command(*command, **kwargs):
                calls.append(command)
                if 'pg_restore' in command:
                    raise RuntimeError('Restore failed')
                return ''
            with patch.object(restore, 'run', side_effect=command), patch.object(
                    restore.subprocess, 'run', return_value=SimpleNamespace(returncode=0)):
                report = restore.verify(args)
            self.assertEqual(report['status'], 'failed')
            self.assertEqual(report['stage'], 'restore')
            self.assertTrue(report['container_removed'])
            self.assertEqual(calls[-1], ('docker', 'rm', '-f', '-v', report['container']))
            create = calls[0]
            self.assertIn('--network', create)
            self.assertEqual(create[create.index('--network') + 1], 'none')
            self.assertNotIn('--volume', create)
            self.assertNotIn('--publish', create)


if __name__ == '__main__':
    unittest.main()
