FROM oven/bun:1 AS base


FROM base AS build

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun build

FROM base AS runtime

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY .next/standalone ./
COPY .next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["bun", "start"]