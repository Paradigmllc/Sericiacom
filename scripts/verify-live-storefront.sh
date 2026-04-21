#!/usr/bin/env bash
# Post-deploy verification for sericia.com storefront.
# Run once `d131503r6rf62uub2qk18831` (or any subsequent Coolify deploy) reaches status=finished.
#
# Checks:
#   1. Homepage HTTP 200
#   2. Dify HOTFIX — no 'WnX69' token or 'App with code' error toast string in HTML
#   3. Medusa product facade — /products page shows at least one product handle
#   4. Medusa backend health (api.sericia.com reachable)
#   5. Publishable key still works on store API
#   6. Crossmint webhook endpoint reachable (expects 401 without signature)
#
# Usage:  bash scripts/verify-live-storefront.sh
# Exits 0 if all pass, 1 if any critical check fails.

set -uo pipefail
PASS=0
FAIL=0

check() {
  local name="$1"; shift
  local ok="$1"; shift
  local detail="${1:-}"
  if [ "$ok" = "1" ]; then
    printf "  ✅ %-55s %s\n" "$name" "$detail"
    PASS=$((PASS+1))
  else
    printf "  ❌ %-55s %s\n" "$name" "$detail"
    FAIL=$((FAIL+1))
  fi
}

echo "=== sericia.com post-deploy verification ==="
echo

# 1. Homepage reachable
http_home=$(curl -s --max-time 20 -o /tmp/sericia_home.html -w "%{http_code}" https://sericia.com/ || echo "000")
[ "$http_home" = "200" ] && check "Homepage HTTP 200" 1 "(got $http_home)" || check "Homepage HTTP 200" 0 "(got $http_home — NOT READY)"

# 2. No Dify hardcoded fallback
if grep -qiE "WnX69|App with code" /tmp/sericia_home.html 2>/dev/null; then
  check "M4a-HOTFIX: Dify fallback token removed" 0 "(found WnX69 or 'App with code' in HTML)"
else
  check "M4a-HOTFIX: Dify fallback token removed" 1 "(clean)"
fi

# 3. /products page has at least one Medusa product
curl -s --max-time 20 -o /tmp/sericia_products.html https://sericia.com/products
product_hits=$(grep -oE "prod_01[A-Z0-9]{10,}" /tmp/sericia_products.html 2>/dev/null | sort -u | wc -l | tr -d ' ')
[ "${product_hits:-0}" -ge "1" ] && check "Products page: Medusa product IDs visible" 1 "(found $product_hits unique)" || check "Products page: Medusa product IDs visible" 0 "(found 0)"

# 4. Medusa backend alive
http_api=$(curl -s --max-time 20 -o /dev/null -w "%{http_code}" https://api.sericia.com/health || echo "000")
[ "$http_api" = "200" ] || [ "$http_api" = "404" ] && check "Medusa backend reachable" 1 "(api.sericia.com $http_api)" || check "Medusa backend reachable" 0 "(api.sericia.com $http_api)"

# 5. Publishable key works on store API
pk="pk_3cbe523eed266eb8eead0a6d75841c341ddc63faa31275c37b7e025b1c64798e"
store_http=$(curl -s --max-time 20 -o /tmp/sericia_store_api.json -w "%{http_code}" \
  "https://api.sericia.com/store/products?limit=1&fields=id" \
  -H "x-publishable-api-key: $pk" || echo "000")
[ "$store_http" = "200" ] && check "Medusa Store API + publishable key" 1 "(HTTP 200)" || check "Medusa Store API + publishable key" 0 "(HTTP $store_http)"

# 6. Crossmint webhook endpoint (401 without signature expected if CROSSMINT_WEBHOOK_SECRET set)
wh_http=$(curl -s --max-time 15 -o /dev/null -w "%{http_code}" -X POST https://sericia.com/api/crossmint-webhook \
  -H "Content-Type: application/json" -d '{"event":"test"}' || echo "000")
if [ "$wh_http" = "401" ]; then
  check "Crossmint webhook: rejects unsigned req" 1 "(401 as expected — secret configured)"
elif [ "$wh_http" = "200" ]; then
  check "Crossmint webhook: reachable" 1 "(200 — secret may be unset, graceful mode)"
else
  check "Crossmint webhook: reachable" 0 "(HTTP $wh_http)"
fi

echo
echo "=== Result: $PASS passed / $FAIL failed ==="
[ "$FAIL" = "0" ]
