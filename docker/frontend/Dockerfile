ARG NODE_VERSION=20-alpine

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
EXPOSE 3000
CMD ["pnpm", "dev"]

# ─── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ─── runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
