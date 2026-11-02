FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && rm -r .next/cache

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
# Base Next.js runtime artefacts
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/next.config.mjs ./
# Payload CLI requires these at runtime (tsconfig path resolution + config graph):
# `payload migrate` reads tsconfig.json -> payload.config.ts -> every imported collection/global.
# Without them the CLI crashes with "Cannot read properties of null (reading 'config')"
# because getTSConfigPaths() fails before the config is even loaded.
COPY --from=build --chown=node:node /app/tsconfig.json ./
COPY --from=build --chown=node:node /app/payload.config.ts ./
COPY --from=build --chown=node:node /app/payload-types.ts ./
COPY --from=build --chown=node:node /app/collections ./collections
COPY --from=build --chown=node:node /app/globals ./globals
COPY --from=build --chown=node:node /app/blocks ./blocks
COPY --from=build --chown=node:node /app/migrations ./migrations
COPY --from=build --chown=node:node /app/scripts ./scripts
# Entrypoint runs idempotent migrate+bootstrap then hands off to `next start`.
# Both inner steps short-circuit on repeat runs so container restarts are safe.
COPY --from=build --chown=node:node /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
USER node
EXPOSE 8000
CMD ["./docker-entrypoint.sh"]
