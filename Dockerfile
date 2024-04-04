FROM node:alpine AS node-builder

WORKDIR /backend

COPY package*.json .
RUN npm install

COPY rollup.config.js .
COPY babel.config.json .
COPY jest-config.ts .
COPY tsconfig.json .
COPY src/*.ts src/
RUN npm run build

FROM heroiclabs/nakama:3.21.1

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY local.yml /nakama/data/