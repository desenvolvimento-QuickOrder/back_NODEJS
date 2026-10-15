# syntax=docker/dockerfile:1

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# Registry corporativo (opcional): docker build --secret id=npmrc,src=$HOME/.npmrc .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
