# Medusa restore drill — 2026-11-01

## Implemented and exercised

`infra/medusa/verify-restore.py` checks a trusted custom-format dump against its
recorded SHA256 and restores it into a new offline PostgreSQL container using the
exact local image ID. Python standard library and existing Docker/PostgreSQL only.
No production DB write, new service, schedule, paid plugin or public cutover.

The container has no network, published ports or host mounts. Its root filesystem
is read-only; data uses512MiB tmpfs, memory768MiB, CPU0.5, PID128. Operations time
out. SIGTERM/normal errors run cleanup; SIGKILL/host failure require checking for
remnants. No application/worker starts, so no order/mail/payment/warehouse calls.

The restore is transactional, stops on an error, restores schema/data/indexes and
constraints, and checks all public-table counts plus required Medusa commerce
objects. Reports include active commerce counts separately from soft-deleted rows.
Raw DB errors/data and credentials are excluded from console output. Reports are
mode0600 and cannot overwrite prior evidence.

## Actual host evidence

- Source backup: `pre-events-7a5cc041.dump` (2026-10-31 release backup).
- Archive SHA256: `e1f8a4fce0a24f9c49a9c10c7ae394d31d5840a883a5de5fd365573c95dc1863`.
- PostgreSQL image: `sha256:d845e7f0ac8517b9d9868b6d20379f9688ba3676595e50ca7c0b664964b2a760`.
- Final valid-archive run:147public tables,0invalid indexes,0unvalidated constraints.
- Active rows:6products,13variants,13inventory items,0inventory levels,0orders.
  Total counts include soft-deleted historical test rows; they are not live stock.
- Restore/verification/cleanup duration5.09seconds. Temporary container removed.
- Deliberately truncated archive with its own valid checksum:restore rejected,
  nonzero exit, temporary container removed (2.94seconds). No source backup altered.
- Deployed tool: `/opt/sericia-medusa-preview/ops/verify-restore.py`, mode0700.
  SHA256 `3627534ac3f417123a1e004dd7fee745eed7c6a11f27f210d3bc7fe65144851b`
  matches the committed source. Runtime app images remain7a5cc041.
- Backend private healthOK, private storefrontHTTP200, public sericia.comHTTP200.
  No test-container remnants. root87%/20GiBfree, volume68%/6.1GiBfree.
- Full evidence is private: `/mnt/sericia-medusa-data/backups/restore-check-20261101-final.json`
  and `restore-negative-20261101.json`; local copies in Codex release-evidence/migration/20261101.

Three Python unit tests and backend TypeScript passed. CI now runs a full migrated
Medusa fixture restore and a deliberately truncated archive, asserts failure
cleanup, and retains aggregate JSON evidence for14days. No production backups are
sent to CI. [CI41253052710](https://github.com/Paradigmllc/Sericiacom/actions/runs/41253052710)
passed all checks on7b40f11c, including16backend tests, TypeScript, audit, release
image, migrations/runtime, valid restore and rejected truncated archive. Its
aggregate success/failure reports were downloaded and checked locally.

## Scope and remaining work

This is a database schema/data restore drill, not an application failover or a
commercial launch. Original roles/ACLs are intentionally omitted in the isolated
superuser fixture; Redis, external media, secrets, application startup and actual
purchase/dispatch need independent recovery checks. The shared Supabase database
was not restored/recreated in this task. Backups over the bounded limits must fail
and be reviewed before increasing resources.

Notification terminal-failure recovery UI, supplier stock authorization/BASE OAuth,
warehouse contract/API, SNS credentials and payment/order E2E remain outstanding.
Shared operations dependency audit was rechecked:18moderate/0high/0critical in the
installed dependency tree; minimatch GHSA-g3hv-75wg-m249 remains unresolved. This is
not a claim that every repository Dependabot alert is resolved. No audit gate was
weakened and no incompatible major dependency override was installed.

PostgreSQL restore behavior follows the
[official pg_restore documentation](https://www.postgresql.org/docs/16/app-pgrestore.html).
