# Isolated Medusa preview

This compose stack has its own PostgreSQL and Redis. Only the Medusa HTTP port
is published, bound to **127.0.0.1:19000**, accessible by SSH tunnel. No public
DNS changes, real payment or customer email sending. This is a preview, not a
production cutover. Resource caps keep the shared host bounded.

On the dedicated volume, keep `postgres`, `redis`, `uploads`, and backups.
`uploads` must be writable by image uid/gid1000. Put compose plus a mode0600
`.env` in a root-only deployment directory; do not commit credentials.
Required values: `MEDUSA_IMAGE` (verified CI artifact), `SERICIA_DATA_ROOT`,
`POSTGRES_PASSWORD`, `REDIS_PASSWORD`, and the backend `.env.example` values.
Use the unique service-container hostnames `sericia-medusa-preview-postgres-1`
and `sericia-medusa-preview-redis-1` in connection URLs. Generic service aliases
can collide when the server also joins the shared operations network.
The runtime image never runs database migrations automatically.

Release order:
1. Verify image digest/commit and mounted volume; check host disk and memory.
2. `docker compose up -d postgres redis`.
3. `docker compose run --rm server npm run predeploy`.
4. Take and verify a DB dump before importing the catalog.
5. Run `src/scripts/import-shopify-catalog.js` with the private snapshot mounted
   read-only and `SERICIA_CATALOG_SNAPSHOT` set. The default is dry-run. Set
   `SERICIA_CATALOG_APPLY=true` only for the approved snapshot. A repeat import
   checks source ID/digest and skips unchanged drafts; conflicts fail explicitly.
6. `docker compose up -d server worker` and verify health, admin authentication,
   draft count, JPY prices, inventory/backorder rules and restart recovery.

Do not run the legacy `seed`/bulk-import scripts: they contain obsolete product
and business assumptions. Public launch needs a separate reviewed storefront
cutover, R2 credentials/public media policy, Stripe tests, shipping/tax settings,
provider access, backup restore test and browser E2E.

Storefront connection preparation:
- Run `npx medusa exec ./src/scripts/prepare-storefront-preview.js` for a read-only
  plan. Apply with `SERICIA_PREVIEW_APPLY=true`. Repeat runs reuse the same channel,
  JPY region and publishable API key, and reject conflicting or revoked settings.
- Retrieve the publishable key in Medusa Admin Settings / Publishable API Keys.
  It is scoped to the preview channel; it is not an admin token.
- The preview region intentionally has no countries or payment providers. No
  product is assigned to this channel and no stock is allocated by this command.
- With the server running, execute `check-storefront-preview.js` with
  `SERICIA_PREVIEW_CHECK_URL=http://server:9000` inside compose. It creates one empty
  test cart and asserts missing-key rejection, hidden drafts, JPY amounts,
  unavailable-item rejection and no payment providers. Do not run this migration
  check after commercial configuration/publication; its empty-catalog assertions
  are specific to this isolated preview.

## Private operations reader

On the approved Coolify host only, install `compose.operations.yaml` alongside
`compose.yaml` as `compose.override.yaml` (mode0600). Default Compose commands then
retain the private operations connection on subsequent recreations. Verify the
external `coolify` network exists before applying. Only the HTTP server joins it;
PostgreSQL, Redis and the worker retain the commerce network. The host HTTP port
remains bound to127.0.0.1; public storefront DNS is unchanged.

The operations app uses runtime-only `SERICIA_MEDUSA_ADMIN_URL` set to
`http://sericia-medusa-private:9000` and `SERICIA_MEDUSA_SECRET_API_KEY` stored in
Coolify. Do not pass these values to builds or previews. The standard Medusa
secret key carries admin privileges; the application exposes only fixed GET
product/inventory paths to identified CMS admins/editors. Keep the key private.

After applying, verify compose's merged network/port configuration, private
`/health`, and the authenticated operations UI's product and inventory views.
Removal requires first disabling the operations connection, removing the override,
and recreating the server; do not disconnect a database network.

## Isolated backup restoration drill

Run `verify-restore.py` on the Docker host with a trusted custom-format Medusa dump,
its independently recorded SHA256, the exact local image ID from the running
Medusa PostgreSQL container, and a new private report path:

```sh
python3 infra/medusa/verify-restore.py \
  --dump /private/medusa.dump --sha256 <recorded-sha256> \
  --image <sha256-image-id> --report /private/restore-report.json
```

The verifier checks the digest before creating a container. It restores all archive
objects/data into a new network-disabled database, without host mounts, published
ports, application workers, or production credentials. It uses 512MiB tmpfs and
768MiB memory limits, a half CPU, finite operation timeouts and cleanup on normal
failure/interruption. Keep at least1GiB available memory before running. This
bounded drill must be reviewed before backups outgrow those limits; it must not
silently expand resource use on the shared host.

The report (mode0600, no overwrite) records aggregate counts for every public table,
required commerce-table presence, index/constraint validity, image/archive hashes,
duration and cleanup. Restoration is single-transaction and stops on any error.
Raw PostgreSQL errors are deliberately not logged because they may contain row
values. Failed reports identify the stage; investigate privately. A failed cleanup
must be handled before retrying: remove only the named `sericia-restore-check-*`
container. SIGKILL/host failure cannot run the cleanup handler; check for remnants.

This proves database schema/data restoration only. Ownership/ACLs are intentionally
not restored into the isolated superuser fixture; production roles/permissions,
external media, Redis state, application startup and real purchase flows require
separate recovery checks. No running database is replaced. The CI workflow tests a
full Medusa migration fixture and a truncated archive, including failure cleanup.

PostgreSQL behavior: https://www.postgresql.org/docs/16/app-pgrestore.html
