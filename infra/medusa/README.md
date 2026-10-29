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
Inside the stack use hostnames `postgres` and `redis` in connection URLs.
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
