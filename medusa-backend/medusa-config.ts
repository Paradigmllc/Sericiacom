import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import { readEnvironment } from "./config/environment";

loadEnv(process.env.NODE_ENV ?? "development", process.cwd());
const env = readEnvironment(process.env);

export default defineConfig({
  projectConfig: {
    databaseUrl: env.databaseUrl,
    databaseDriverOptions: { ssl: env.databaseSsl },
    redisUrl: env.redisUrl,
    workerMode: env.mode,
    http: {
      storeCors: env.storeCors, adminCors: env.adminCors, authCors: env.authCors,
      jwtSecret: env.jwtSecret, cookieSecret: env.cookieSecret,
    },
  },
  admin: { disable: env.mode === "worker", path: "/app" },
  modules: [
    { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl: env.redisUrl } },
    { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { redisUrl: env.redisUrl } } },
    { resolve: "@medusajs/medusa/locking", options: { providers: [{
      resolve: "@medusajs/medusa/locking-redis", id: "locking-redis", is_default: true,
      options: { redisUrl: env.redisUrl },
    }] } },
    { resolve: "@medusajs/medusa/caching", options: { providers: [{
      resolve: "@medusajs/caching-redis", id: "caching-redis", is_default: true,
      options: { redisUrl: env.redisUrl },
    }] } },
    ...(env.stripe ? [{ resolve: "@medusajs/medusa/payment", options: { providers: [{
      resolve: "@medusajs/medusa/payment-stripe", id: "stripe", options: env.stripe,
    }] } }] : []),
    ...(env.r2 ? [{ resolve: "@medusajs/medusa/file", options: { providers: [{
      resolve: "@medusajs/medusa/file-s3", id: "s3", options: env.r2,
    }] } }] : []),
  ],
});
