# Isolated storefront preview

Run beside the Medusa preview, using only a verified CI image. It binds to
localhost18000 and has no public DNS route. This is not a commercial launch.
Use an SSH tunnel to view it. `.env` must be mode0600 and outside Git.

Runtime configuration: SERICIA_STOREFRONT_IMAGE, MEDUSA_BACKEND_URL=http://server:9000,
MEDUSA_REGION=preview, MEDUSA_PUBLISHABLE_KEY (the preview channel key, not admin).
Do not inject live Stripe, mail, account or CMS credentials into this initial preview.
The command intentionally skips the legacy entrypoint's automatic CMS seeds.

Check free root disk (>10GiB), available memory (>4GiB), and image checksum before
loading. Preserve previous images and configs. Verify /products, cart browser
flow, retired payment410 and draft count after startup. Existing Shopify remains
public until all migration requirements and external providers are verified.
