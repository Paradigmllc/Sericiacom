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

Local TypeScript, targeted lint and eight unit tests passed. Browser home regression joins existing checkout/cart suites on desktop/mobile. Initial runtime 2a104c88 was deployed healthy after CI41014720774/41014720718 passed. An actual synthetic tableware product revealed that Medusa 2.22.1 omits categories for nested category field selectors; direct Store API probes confirmed that `*categories` returns the relation. All three product fetch paths are corrected; final deployment/reverification passed as recorded below.

## Boundaries

User confirmed no warehouse contract on 2026-10-30. Locations/OPENLOGI are candidates only. Real receiving/shipping cannot run until a provider is contracted and authorized. Supplier stock/access rights, SNS authorization, payment/order completion, full localization/content migration, operations adapter and public cutover remain separate unfinished work. New home copy is Japanese/English (other locale selections currently use English). Category labels retain the existing English listing convention. This release does not create new sellable inventory or launch commerce.

Public Shopify stays unchanged. All six imported products remain draft. Verification fixtures, if used, are isolated and removed after checks.

Actual-product browser verification also found a legacy `getCurrentDrop()` call in PDP: it initializes unavailable Supabase and triggers the error boundary. Removed this unrelated query/countdown/sample banner from the Medusa product page. This was invisible with an empty draft-only catalog, so actual synthetic product verification remains required.

## Final preview release

- Runtime `f5266075`, CI `41017175479` storefront / `41017175474` backend both successful. Eight unit tests, TypeScript, audit gate, production build and sixteen desktop/mobile browser tests passed in CI.
- Artifact `12959794643`; GitHub ZIP SHA256 `b8ea018fc66d699d999917e3ea21028fcdab0522c4eaa0e1ce09e70d71e61517`; inner image archive SHA256 `7da515daac5b304d644da44bb246678e23f53c0d0b2864c0c9fb5f17336b3cf9`. Archive retained on approved volume. Preview healthy on loopback18000; public Shopify verified HTTP200 and Shopify markup, unchanged.
- Actual standard Admin API created a clearly labelled synthetic tableware product with JPY1200 and managed zero stock. Desktop/mobile browsers verified home category, filtered listing, missing-image state, PDP category/price and no overflow. The initial category omission and PDP Supabase error were fixed and rechecked, not waived.
- Served PDP chunk `/_next/static/chunks/app/(frontend)/products/%5Bslug%5D/page-90e0c7f4994b6885.js` SHA256 `3f6de004cbb5a27354d615acaf98b407507bb0e0b88b09beb2d3d5eba7fe859c` matches the container file.
- Fixture product and its temporary category deleted. Admin API confirms six products, all six draft. No stock location, shipping option, charge, order, customer message or dispatch was created by the catalog verification.
- Earlier deployed full suite on 545bd78e had 15 passes and one ECONNRESET against a retired crypto endpoint; runtime inspection showed healthy, zero restarts, no OOM. After replacing the independent SSH path (loopback18001), all sixteen final-runtime browser checks passed in 2.0m. The old tunnel also caused a later navigation timeout, so the interrupted run was retained in the local log. Server-local home response was HTTP200 in 0.028614s. This connection failure is distinct from the detected PDP application error.
- Candidate2a104c88 image removed only after no container references and verified archive checksum. Its release archive and older9b5e0592 rollback image remain. No broad Docker prune or unrelated cleanup.

- Final container image ID `6e73a5a462666b17608c517d056d9c4890377d95c3f0e18ef431d6943f32ebcd`, healthy. Candidate545bd78e also removed after archive checksum/no-reference checks; root free10.79GiB. Archive and prior9b5e0592 rollback image retained.
- Post-cleanup browser confirms empty live collection and no fixture title. Mobile capture `/tmp/sericia-brand-preview-mobile.png`; actual-fixture captures `/tmp/sericia-catalog-{desktop,mobile}.png`. Final regression log `/tmp/sericia-catalog-fresh-tunnel-tests.log`. These are private verification artifacts, not commercial-launch evidence.
