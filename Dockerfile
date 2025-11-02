# Build stage
# Utiliser Debian au lieu d'Alpine pour générer les bons binaires Prisma
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build the application
RUN pnpm build

# Production stage
# Utiliser Debian au lieu d'Alpine pour compatibilité avec Render et OpenSSL
FROM node:20-slim AS production

WORKDIR /app

# Install OpenSSL libraries (requis pour Prisma)
# Installer libssl3 et libssl1.1 depuis les archives Debian Bullseye
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 && \
    echo "deb http://deb.debian.org/debian bullseye main" >> /etc/apt/sources.list && \
    echo "Package: *\nPin: release a=bullseye\nPin-Priority: 100" > /etc/apt/preferences.d/bullseye && \
    apt-get update -y && \
    apt-get install -y libssl1.1 && \
    sed -i '/deb http:\/\/deb.debian.org\/debian bullseye main/d' /etc/apt/sources.list && \
    rm -f /etc/apt/preferences.d/bullseye && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy Prisma schema first
COPY --from=builder /app/prisma ./prisma

# Install Prisma CLI temporarily to generate client, then remove it
RUN pnpm add -D prisma && pnpm prisma generate && pnpm remove prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
