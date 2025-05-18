# ---------- Build stage ----------
FROM node:20 AS builder

WORKDIR /usr/src/app

# ⬇ accessing monorepo root
COPY ../../package*.json ./
COPY ../../tsconfig*.json ./
COPY ../../nest-cli.json ./
COPY ../../libs ./libs
COPY . . 

RUN npm install
RUN npx nest build compressor-service

# ---------- Runtime stage ----------
FROM node:20 AS runner

WORKDIR /usr/src/app

COPY ../../package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist/apps/compressor-service ./dist

ENV NODE_ENV=production
CMD ["node", "dist/apps/compressor-service/src/main"]
