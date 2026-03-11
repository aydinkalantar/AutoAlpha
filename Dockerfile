FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client specifically inside the builder
# Ensure DATABASE_URL is somehow provided or use a mock stub if schema doesn't strictly need connected DB to generate
RUN npx prisma generate

# Build Next.js & compile workers
RUN npm run build
RUN npx tsc src/workers/tradeWorker.ts --outDir ./dist/workers --esModuleInterop
RUN npx tsc src/workers/cronJobs.ts --outDir ./dist/workers --esModuleInterop

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV REDIS_HOST redis
ENV REDIS_PORT 6379

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema & client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy Custom Server overriding Next.js default runner
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
