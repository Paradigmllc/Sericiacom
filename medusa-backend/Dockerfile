FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ bash

FROM base AS deps
COPY package.json ./
RUN npm install --legacy-peer-deps

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx medusa build

FROM base AS runtime
ENV NODE_ENV=production
# medusa build outputs a self-contained server tree at .medusa/server
# that already includes compiled src/ (API routes, subscribers, jobs,
# workflows, etc). Do NOT also COPY src/ here — duplicate subscriber
# IDs from both the compiled + raw src cause startup crash loops.
COPY --from=build /app/.medusa/server ./
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
EXPOSE 9000
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
