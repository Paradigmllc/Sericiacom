#!/bin/sh
# ------------------------------------------------------------------------------
# sericia storefront — container entrypoint
#
# Responsibilities (in order, fail-stop on the critical phase):
#   1. Apply pending Payload CMS migrations (fail-fast — schema integrity
#      matters more than serving traffic against a corrupted DB).
#   2. Seed the admin user once (fail-open — idempotent, recoverable manually).
#   2b. Seed PaymentSettings global (F55 — fail-open, idempotent).
#   3. Hand off to `next start` as PID 1 via `exec` so signals propagate.
#
# Both inner steps are already idempotent:
#   - `payload migrate` checks the `payload_migrations` table and skips applied ones.
#   - `payload-bootstrap.ts` calls payload.find({collection:"users",limit:1}) and
#     returns early when any user exists.
#
# Rule E / Rule V:
#   - No silent failures — everything is echoed with a clear prefix.
#   - Migration errors crash the container; Coolify + Slack hooks pick it up.
#   - Bootstrap errors degrade gracefully — admin seed is a seed, not a runtime
#     dependency of the storefront itself.
# ------------------------------------------------------------------------------
set -e

echo "[entrypoint] sericia storefront starting..."

# ---- Phase 1: Payload migrations (fail-fast) --------------------------------
if [ -n "$DATABASE_URL_PAYLOAD" ]; then
  echo "[entrypoint] running payload migrations..."
  if ! npm run payload:migrate; then
    echo "[entrypoint] ERROR: payload migrations failed — aborting startup" >&2
    echo "[entrypoint] fix DB schema state before restarting the container" >&2
    exit 1
  fi
  echo "[entrypoint] payload migrations ok"
else
  echo "[entrypoint] WARN: DATABASE_URL_PAYLOAD unset — skipping payload migrations"
fi

# ---- Phase 2: admin bootstrap (fail-open) -----------------------------------
if [ -n "$DATABASE_URL_PAYLOAD" ] && [ -n "$PAYLOAD_ADMIN_PASSWORD" ]; then
  echo "[entrypoint] ensuring payload admin user..."
  if npm run payload:bootstrap; then
    echo "[entrypoint] payload admin bootstrap ok"
  else
    echo "[entrypoint] WARN: payload bootstrap failed — continuing without admin seed" >&2
    echo "[entrypoint] run 'npm run payload:bootstrap' manually once DB is reachable" >&2
  fi
else
  echo "[entrypoint] WARN: admin bootstrap skipped (missing env)"
fi

# ---- Phase 2b: PaymentSettings seed (F55 — fail-open, idempotent) -----------
# Populates the paymentSettings global with the hardcoded fallback matrix on
# first deploy (or any deploy where the global has no rows yet). Re-running
# is a no-op — the script checks countryMethods.length and exits early.
# Pass SEED_PAYMENT_SETTINGS_RESET=1 to force overwrite editor changes.
if [ -n "$DATABASE_URL_PAYLOAD" ]; then
  echo "[entrypoint] seeding paymentSettings global (idempotent)..."
  if [ "${SEED_PAYMENT_SETTINGS_RESET:-0}" = "1" ]; then
    SEED_ARGS="-- --reset"
  else
    SEED_ARGS=""
  fi
  if npm run seed:payment-settings $SEED_ARGS; then
    echo "[entrypoint] paymentSettings seed ok"
  else
    echo "[entrypoint] WARN: paymentSettings seed failed — checkout will use hardcoded fallback" >&2
    echo "[entrypoint] run 'npm run seed:payment-settings' manually once DB is reachable" >&2
  fi
fi

# ---- Phase 2c: FAQ entries seed (F57 — fail-open, idempotent) ---------------
# Populates the faqEntries collection from SEED_ENTRIES embedded in the
# script. Re-running is a no-op (skips existing rows by (section, question)
# uniqueness check). Pass SEED_FAQ_RESET=1 to wipe + reseed.
if [ -n "$DATABASE_URL_PAYLOAD" ]; then
  echo "[entrypoint] seeding faqEntries collection (idempotent)..."
  if [ "${SEED_FAQ_RESET:-0}" = "1" ]; then
    SEED_ARGS="-- --reset"
  else
    SEED_ARGS=""
  fi
  if npm run seed:faq-entries $SEED_ARGS; then
    echo "[entrypoint] faqEntries seed ok"
  else
    echo "[entrypoint] WARN: faqEntries seed failed — /faq will use hardcoded fallback" >&2
    echo "[entrypoint] run 'npm run seed:faq-entries' manually once DB is reachable" >&2
  fi
fi

# ---- Phase 3: Next.js handoff ------------------------------------------------
echo "[entrypoint] handing off to next start on port ${PORT:-8000}"
exec npm run start
