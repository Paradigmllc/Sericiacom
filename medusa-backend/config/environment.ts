type Environment = Record<string, string | undefined>;

export function readEnvironment(env: Environment) {
  const production = env.NODE_ENV === "production";
  const required = (name: string) => {
    const value = env[name]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
  };
  const rawMode = env.MEDUSA_WORKER_MODE ?? "shared";
  if (rawMode !== "shared" && rawMode !== "worker" && rawMode !== "server") {
    throw new Error("MEDUSA_WORKER_MODE must be shared, worker or server");
  }
  const mode: "shared" | "worker" | "server" = rawMode;
  const cors = (name: string) => {
    const value = required(name);
    for (const origin of value.split(",")) {
      let url: URL;
      try { url = new URL(origin); } catch {
        console.error(`[config] Invalid origin in ${name}`);
        throw new Error(`Invalid origin in ${name}`);
      }
      if (url.origin !== origin || url.username || url.password ||
          !["https:", "http:"].includes(url.protocol) ||
          (production && url.protocol !== "https:")) {
        throw new Error(`${name} must contain exact ${production ? "HTTPS " : ""}origins`);
      }
    }
    return value;
  };
  const secret = (name: string) => {
    const value = required(name);
    if (value.length < 32 || /CHANGE_ME|REPLACE_|supersecret/i.test(value)) {
      throw new Error(`${name} must be a random secret of at least 32 characters`);
    }
    return value;
  };
  const stripeEnabled = env.STRIPE_ENABLED === "true";
  if (env.STRIPE_ENABLED && !["true", "false"].includes(env.STRIPE_ENABLED)) {
    throw new Error("STRIPE_ENABLED must be true or false");
  }
  const stripe = stripeEnabled ? {
    apiKey: required("STRIPE_API_KEY"),
    webhookSecret: required("STRIPE_WEBHOOK_SECRET"),
    capture: true,
  } : undefined;
  if (stripe && env.SERICIA_LIVE_PAYMENTS !== "true" && !stripe.apiKey.startsWith("sk_test_")) {
    throw new Error("Live Stripe credentials require SERICIA_LIVE_PAYMENTS=true");
  }
  return {
    mode,
    databaseUrl: required("DATABASE_URL"),
    redisUrl: required("REDIS_URL"),
    databaseSsl: env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : false,
    storeCors: cors("STORE_CORS"), adminCors: cors("ADMIN_CORS"), authCors: cors("AUTH_CORS"),
    jwtSecret: secret("JWT_SECRET"), cookieSecret: secret("COOKIE_SECRET"),
    stripe,
    r2: env.S3_BUCKET ? {
      file_url: required("S3_FILE_URL"),
      access_key_id: required("S3_ACCESS_KEY_ID"),
      secret_access_key: required("S3_SECRET_ACCESS_KEY"),
      region: "auto", bucket: required("S3_BUCKET"), endpoint: required("S3_ENDPOINT"),
      additional_client_config: {
        forcePathStyle: true,
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      },
    } : undefined,
  };
}
