# Japanese catalog migration — 2026-10-30

## Scope

Replace the former rescued-food/drop homepage with a Japanese everyday-products storefront. Reuse existing Medusa product categories, Store API, common UI and CSS. No new tables, services, plugins or dependencies.

- Home reads only published Store API products. Empty collection and fetch failure are separate visible states; retry performs a fresh document navigation.
- Remove fictional fallback bundle, price, scarcity, countdown, shipping promises and Offer JSON-LD. Remove obsolete drop navigation and generated popularity/newness badges.
- Category mapping uses registered Medusa handles (`tea`, `miso`, `mushroom`, `seasoning`, `pantry`, `tableware`, `home`, `stationery`, `textiles`, `gifts`, `other`). Unknown/unassigned products use `other`; names do not imply categories. Existing Medusa Admin can assign these categories; no real product classification has been fabricated.
- Product cards show actual product images with responsive sizes, and explicit missing/broken image states. Hide unknown zero weights.
- Product detail removes fixed USD, invented shipping/return text and unverified producer/tasting fallback. Show only supplied story/preparation data. Shipping/returns pages now explicitly show prelaunch preparation, not assumed warehouse terms. About page describes Japanese products beyond food. Final policy/legal review is still outstanding.
- Default metadata and share artwork now describe Japanese products beyond food. Existing CMS-managed settings remain supported by header/footer; old marketing data must be reviewed before connecting a populated CMS.

## Evidence

Local TypeScript, targeted lint and eight unit tests passed. Browser home regression joins existing checkout/cart suites on desktop/mobile. Initial runtime 2a104c88 was deployed healthy after CI41014720774/41014720718 passed. An actual synthetic tableware product revealed that Medusa 2.22.1 omits categories for nested category field selectors; direct Store API probes confirmed that `*categories` returns the relation. All three product fetch paths are corrected; final deployment/reverification is pending.

## Boundaries

User confirmed no warehouse contract on 2026-10-30. Locations/OPENLOGI are candidates only. Real receiving/shipping cannot run until a provider is contracted and authorized. Supplier stock/access rights, SNS authorization, payment/order completion, full localization/content migration, operations adapter and public cutover remain separate unfinished work. New home copy is Japanese/English (other locale selections currently use English). Category labels retain the existing English listing convention. This release does not create new sellable inventory or launch commerce.

Public Shopify stays unchanged. All six imported products remain draft. Verification fixtures, if used, are isolated and removed after checks.
