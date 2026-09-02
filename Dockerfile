# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build && pnpm install --prod --frozen-lockfile --ignore-scripts

FROM node:24-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

USER node

CMD ["node", "--enable-source-maps", "dist/main"]
