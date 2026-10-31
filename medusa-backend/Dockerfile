FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV MEDUSA_DISABLE_TELEMETRY=true

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
# Build-only values cannot connect to real services; runtime uses injected secrets.
RUN NODE_ENV=production DATABASE_URL=postgres://localhost/build_only REDIS_URL=redis://localhost:6379 \
    STORE_CORS=https://sericia.com ADMIN_CORS=https://api.sericia.com AUTH_CORS=https://sericia.com \
    JWT_SECRET=build-only-not-used-at-runtime-000000 COOKIE_SECRET=build-only-not-used-at-runtime-111111 \
    npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/.medusa/server ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/package.json /app/package-lock.json ./
USER node
EXPOSE 9000
# Run npm run predeploy once as a release step, before server/worker startup.
CMD ["npm", "run", "start"]
