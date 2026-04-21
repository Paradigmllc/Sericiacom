/**
 * Payload CMS bootstrap script.
 *
 * Creates the first admin user if no users exist in the `payload.users`
 * table yet. Safe to re-run — no-op when users already exist.
 *
 * Usage:
 *   npm run payload:bootstrap
 *
 * Required env:
 *   PAYLOAD_SECRET
 *   DATABASE_URL_PAYLOAD
 *   PAYLOAD_ADMIN_EMAIL      (default: admin@sericia.com)
 *   PAYLOAD_ADMIN_PASSWORD   (REQUIRED on first run — no default)
 */
import { getPayload } from "payload";
import config from "../payload.config";

async function bootstrap(): Promise<void> {
  const email = process.env.PAYLOAD_ADMIN_EMAIL || "admin@sericia.com";
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;

  if (!password) {
    console.error(
      "[payload-bootstrap] PAYLOAD_ADMIN_PASSWORD is not set. Refusing to create an unprotected admin.",
    );
    process.exit(1);
  }

  if (!process.env.PAYLOAD_SECRET) {
    console.error("[payload-bootstrap] PAYLOAD_SECRET is required.");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL_PAYLOAD) {
    console.error("[payload-bootstrap] DATABASE_URL_PAYLOAD is required.");
    process.exit(1);
  }

  console.log("[payload-bootstrap] Initialising Payload...");
  const payload = await getPayload({ config });

  // Check if any user exists
  const existing = await payload.find({
    collection: "users",
    limit: 1,
    pagination: false,
  });

  if (existing.totalDocs > 0) {
    console.log(
      `[payload-bootstrap] Found ${existing.totalDocs} existing user(s). Skipping bootstrap.`,
    );
    process.exit(0);
  }

  console.log(`[payload-bootstrap] No users found. Creating admin: ${email}`);

  try {
    const user = await payload.create({
      collection: "users",
      data: {
        email,
        password,
        name: "Sericia Admin",
        role: "admin",
      },
    });
    console.log(
      `[payload-bootstrap] Admin created. Login at /cms/admin with ${user.email}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("[payload-bootstrap] Failed to create admin user:", err);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error("[payload-bootstrap] Unhandled error:", err);
  process.exit(1);
});
