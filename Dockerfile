FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
# Install openssl compatibility for Prisma Client on Alpine
RUN apk add --no-cache openssl libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client specifically inside the builder
# Ensure DATABASE_URL is somehow provided or use a mock stub if schema doesn't strictly need connected DB to generate
RUN npx prisma generate

# Build Next.js & compile workers
# Set a dummy DATABASE_URL and REDIS_HOST so Next.js static prerendering doesn't crash if it evaluates imports during build
ARG DATABASE_URL="postgresql://mock:mock@localhost:5432/mock"
ARG REDIS_HOST="localhost"
RUN DATABASE_URL=${DATABASE_URL} REDIS_HOST=${REDIS_HOST} npm run build
RUN npx --yes esbuild src/workers/tradeWorker.ts --bundle --platform=node --target=node20 --outdir=dist/workers --packages=external
RUN npx --yes esbuild src/workers/cronJobs.ts --bundle --platform=node --target=node20 --outdir=dist/workers --packages=external

FROM node:20-alpine AS runner
WORKDIR /app
# Also install OpenSSL in the runner image so the runtime can execute Prisma queries
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV production


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Explicitly copy complete node_modules to restore external worker dependencies (ccxt, bullmq)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Next.js standalone outputs its own hyper-optimized server.js
# Boot the background workers concurrently in the same container.
CMD ["sh", "-c", "node dist/workers/tradeWorker.js & node dist/workers/cronJobs.js & node server.js"]
