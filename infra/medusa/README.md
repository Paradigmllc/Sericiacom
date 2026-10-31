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
