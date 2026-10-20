# Multi-Stage Production Dockerfile for ShopMate AI Backend
# -------------------------------------------------------------
# Stage 1: Build Stage
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install system utilities needed for building node-gyp / native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package manifests
COPY package*.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for build
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build TypeScript
COPY src ./src/
RUN npm run build

# Prune devDependencies for minimal runtime image
RUN npm prune --production

# -------------------------------------------------------------
# Stage 2: Production Runtime Image
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Security: Run as non-root user
ENV NODE_ENV=production
ENV PORT=5000

# Copy runtime artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
