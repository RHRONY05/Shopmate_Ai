# Multi-Stage Production Dockerfile for ShopMate AI Frontend
# -------------------------------------------------------------
# Stage 1: Build Stage
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json tsconfig*.json vite.config.ts ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source assets
COPY index.html ./
COPY src ./src/

# Pass build arguments for Vite
ARG VITE_API_BASE_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}

# Compile production build
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Nginx Web Server
# -------------------------------------------------------------
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
