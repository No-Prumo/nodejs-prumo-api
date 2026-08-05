FROM node:24-bookworm-slim AS base

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts/patch-minimatch-brace-expansion.mjs ./scripts/patch-minimatch-brace-expansion.mjs
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
    npm run build && npm prune --omit=dev

FROM base AS runtime

ENV NODE_ENV=production \
    APP_HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
