ARG NODE_VERSION=22-alpine

# ─── base ──────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS base
RUN corepack enable pnpm
WORKDIR /app

# ─── deps ──────────────────────────────────────────────────────────────────────
# NOTE: pnpm-lock.yaml が存在しない初期状態では --frozen-lockfile を外している。
#       lock ファイルをコミットした後に --frozen-lockfile へ変更する。
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# ─── dev ───────────────────────────────────────────────────────────────────────
# ソースコードは compose.yml でバインドマウントする。
# node_modules は deps ステージから引き継ぎ、匿名ボリュームでマウントを上書きさせない。
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 4000
CMD ["pnpm", "dev"]

# ─── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build && pnpm exec prisma generate

# ─── runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nodejs
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist         ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma       ./prisma
USER nodejs
EXPOSE 4000
CMD ["node", "dist/server.js"]
