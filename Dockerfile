# ==== STAGE 1: build ====
FROM oven/bun:1.0.35-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./

RUN bun install

COPY src ./src

RUN bun build ./src/index.ts ./src/infra/db/migrate.ts --target=bun --outdir=dist

# ==== STAGE 2: runtime ====
FROM oven/bun:1.0.35-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]