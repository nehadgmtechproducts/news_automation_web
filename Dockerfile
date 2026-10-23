# Production image for the website (Next.js, `next start`).
#
# The article text and pictures are NOT baked in: they come from folders mounted at run time
# (see deploy/docker-compose.yml), because the backend adds a story every time one is approved.
# .dockerignore keeps the repo's sample content out of the build for the same reason.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# SITE_URL is baked into pages at build time (canonical links, link previews, sitemap).
ARG SITE_URL
ENV SITE_URL=${SITE_URL} NEXT_TELEMETRY_DISABLED=1
# The folders the site reads must exist, even empty, for the build to succeed.
RUN mkdir -p content/articles public/media .data && npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app /app
COPY --chown=node:node deploy/entrypoint.sh /app/entrypoint.sh
# .data holds read counts and subscriber emails (a volume); .next/cache holds regenerated pages.
RUN chmod +x /app/entrypoint.sh && mkdir -p /app/.data && chown -R node:node /app/.data /app/.next
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/app/entrypoint.sh"]
