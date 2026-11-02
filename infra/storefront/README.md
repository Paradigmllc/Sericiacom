# Medusa storefront runtime

Run beside the Medusa preview, using only a verified CI image. It binds to
localhost18000. The production overlay `compose.public.yaml` connects it to the
authenticated origin described in [edge/README.md](edge/README.md). The public
apex/www now serve Medusa; public deployment is not a commercial launch.
`.env` must be mode0600 and outside Git.

Runtime configuration: SERICIA_STOREFRONT_IMAGE, MEDUSA_BACKEND_URL=http://server:9000,
MEDUSA_REGION=preview, MEDUSA_PUBLISHABLE_KEY (the preview channel key, not admin).
Do not inject live Stripe, mail, account or CMS credentials into this initial preview.
The command intentionally skips the legacy entrypoint's automatic CMS seeds.

Check free root disk (>10GiB), available memory (>4GiB), and image checksum before
loading. Preserve previous images and configs. Verify /products, cart browser
flow, retired payment410 and draft count after startup. Keep payment activation
closed until provider credentials, real stock, shipping and purchase tests pass.
See [cutover evidence](../../docs/knowledge/sericia/public-cutover-20261103.md).
