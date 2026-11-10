# AI삼국지: 게임 페이지 + 온라인 대전 중계 서버
FROM node:20-alpine AS build
WORKDIR /src
COPY build.sh ./
COPY src ./src
COPY vendor ./vendor
COPY icons ./icons
RUN sh build.sh

FROM node:20-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force
COPY server/*.js ./server/
COPY --from=build /src/dist/index.html ./dist/index.html
COPY --from=build /src/dist/vendor ./dist/vendor
COPY --from=build /src/dist/icons ./dist/icons
ENV PORT=8080 NODE_ENV=production
EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server/server.js"]
