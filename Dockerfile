FROM oven/bun:1.1.25

WORKDIR /app

COPY package.json bunfig.toml tsconfig.json drizzle.config.ts ./
COPY .env ./.env
RUN bun install --frozen-lockfile

COPY src ./src
COPY tests ./tests

ENV NODE_ENV=production

CMD ["bun", "run", "start"]
