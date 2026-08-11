# Local development image.
#
# The point of this is not deployment — the site ships as a Cloudflare Worker
# built by `wrangler deploy`, not as a container. It exists so `npm run dev` and
# `npm run preview` work without the host needing the right Node on PATH.
# wrangler 4 refuses to start on Node 20, which is easy to trip over when nvm
# has not been sourced in the current shell.
FROM node:22-bookworm-slim

# workerd, the runtime Miniflare uses for `preview`, is a native binary that
# wants libstdc++ and CA certificates present.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates libstdc++6 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so `npm ci` is cached and only re-runs when deps change.
COPY package.json package-lock.json ./
RUN npm ci

# Source is bind-mounted at runtime (see compose.yaml), so nothing else is
# copied here — the image is dependencies plus a pinned Node, nothing more.

EXPOSE 3000 4173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
