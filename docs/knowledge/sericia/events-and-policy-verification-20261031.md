# Medusa events and storefront policy verification — 2026-10-31

Runtime backend/storefront7a5cc041, DraftPR4. BackendCI41183686501 and storefrontCI41183686506 passed:16backend tests,8storefront unit tests,20desktop/mobile browser tests, type checks, builds and artifact/runtime checks.

Backend artifact ZIP8daa5141ca60cffd005560b403b0e0b556edeacd3f3a3f33e4520c35d584e551, tar1b143fee79221b286514ad441f5a7ea0066072c867c3fc547478cdb7bbd93d81; imagef9ff410d8659b02b39da81e2d7307a91df8c4784a1599670409ae51e94afd893. Storefront ZIP54a016ae7e95f9d3802b1113614be2cda87e9b643dce61cfd1bc02176b73358a, tare51f3237046c23f1d3bb57e5f4c93131668ce37f054325525cad05aebc45e9a6. Both healthy after private deployment. No public DNS change.

The event sender uses existing Medusa Redis jobs, stable occurrence identity, signed bounded minimal messages and five exponential retries. Priority100 avoids the Medusa2.22.1/BullMQ5.81.5 internal priority boundary. Unique DB/Redis container hostnames avoid shared-network aliases: sericia-medusa-preview-postgres-1 and sericia-medusa-preview-redis-1. Do not revert to generic postgres/redis hosts when the server joins the operations network.

The operations receiver/UI live at Paradigm appfa736a08. PR765/766 and runtime repairPR767. Production-only shared event key, private Realtime key and WS_NO_BUFFER_UTIL=1 are configured outside git/builds. Realtime key requires rotation before2027-10-31. Missing wal2json and system subscription objects were repaired with exact-version isolated decoding and rollback SQL tests; no DB data reset. The shared DB was not restarted: verified library installed in its running container, derived image pinned for future recreation. A full DB restore/recreation drill remains unperformed.

At18:00:19 JST, normal Admin API draft title change appeared in the open operations browser without reload;18:00:39 restoration did the same. Ten diagnostic events remain as audit history,0notification errors. Duplicate delivery returns ignored=true; tampered/expired signatures401. Failed/waiting/delayed sender jobs0 at verification. Sender terminal-failure and notification replay remain manual.

Policies/privacy/FAQ/thank-you/footer and uses/comparison pages remove retired crypto, unverified company/jurisdiction/delivery claims and fabricated product scores. Preview explicitly does not accept orders. Desktop/mobile screenshots are in /Users/apple/.codex/sericia-release-evidence/migration/20261031; verification.json records checks. These are preparation notices, not final approved commercial policies.

All6real products remain draft, inventory levels0, orders0. Warehouse still uncontracted; supplier stock authorization/BASE OAuth, SNS credentials, payment/order E2E and commercial terms outstanding. Public ShopifyHTTP200 retained. No real payment, shipment or social post. Shared Manual Work V4 HTTP207 and18moderate minimatch audit findings remain; separate postdoctor passed.

最終容量確認: root 87% / 空き20GiB、承認済20GB volume 68% / 空き6.1GiB。DB backup全世代と検証済rollback archiveを保持。追加課金なし。
