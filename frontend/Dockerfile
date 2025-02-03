# Install dependencies only when needed
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

# If using npm with a `package-lock.json` comment out above and use below instead
# COPY package.json package-lock.json ./ 
# RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_PUBLIC_APIKEY="AIzaSyBBvtl_-xTG_P-f92Nwr5bVgSPQp9wV-HQ"
ENV NEXT_PUBLIC_AUTHDOMAIN="synergy-matching.firebaseapp.com"
ENV NEXT_PUBLIC_PROJECTID="synergy-matching"
ENV NEXT_PUBLIC_STORAGEBUCKET="synergy-matching.appspot.com"
ENV NEXT_PUBLIC_MESSAGINGSENDERID="764107284321"
ENV NEXT_PUBLIC_APPID="1:764107284321:web:e2e730d9d6e262b97c2f20"
ENV NEXT_PUBLIC_MEASUREMENTID="G-13847J1LL4"

ARG FIREBASE_SERVICE_ACCOUNT
ENV FIREBASE_SERVICE_ACCOUNT=$FIREBASE_SERVICE_ACCOUNT

ARG STRIPE_SECRET_KEY
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]