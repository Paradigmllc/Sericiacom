# Checkout migration — 2026-10-30

Existing storefront/Medusa SDK reused; no new package or paid plugin. API `/api/commerce/checkout` persists a standard Medusa cart, address and shipping selection. Client never sends trusted prices or a cart ID. The cart bearer ID is held in an HttpOnly, SameSite cookie (Secure for HTTPS origin). POST requires matching Origin/Host and strict input validation. Responses are private/no-store and do not expose addresses or cart IDs. Errors log classifications only.

Product options use variant IDs through PDP/cart/drawer/checkout. Browser storage version3 clears ambiguous legacy product-level carts only. Wishlist add goes to option selection, and clear has Undo. The former Supabase/drop checkout page is replaced by guest address and Medusa shipping selection; historical endpoints/data are retained for separate retirement review.

Medusa validates creation/update; a fresh batched Store product inventory query checks each requested variant. Repeated preparation reuses a matching active region cart. Completed or foreign-region carts fail; changed items create a new checkout cart, never an order. Shipping selection checks cart contents and current available methods. Server-generated quote totals are validated as nonnegative finite numbers. Address edits invalidate displayed quotes and require a new delivery selection. Cart contents are not reserved; actual payment completion must recheck stock through Medusa.

Only configured region destinations/options are shown. No destinations means checkout closed without an address form. No shipping method means a visible unavailable state. Payment and order completion are deliberately absent pending payment setup; no purchase, charge, email or warehouse dispatch occurs in this stage.

Validation: seven unit tests cover currency, variant separation, strict schemas/origin, authoritative cart creation/reuse, stale/foreign/completed cart rejection, stock shortage, unavailable shipping and invalid monetary totals. TypeScript and targeted checkout lint pass. Added desktop/mobile tests for authoritative totals, shipping/address reset, unavailable destinations and API boundary checks. CI and deployed verification pending. Browser fixtures are synthetic and do not create real customer orders.

Local build stopped due to low disk (273MiB); removed only generated .next/cache. Remote preflight root15GiB/volume18GiB free. Existing preview73fb662f preserved until successful CI deployment.

Remaining: payment/complete-cart flow, real shipping and provider access, current full brand migration, operations adapter, persistent failure notifications, production routing/capacity and Shopify cancellation. This is not commercial launch readiness.

Reference: https://docs.medusajs.com/resources/storefront-development/checkout/shipping ; installed Medusa2.22.1 Store API implementation confirms calculated shipping amount shape.
