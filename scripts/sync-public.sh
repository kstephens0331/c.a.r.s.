#!/bin/bash
# After scripts/prerender.mjs writes per-route HTML to dist/<route>/index.html
# (and the root snapshot to dist/_prerendered_root.html), copy those files into
# source public/ so they get committed to git and Vercel serves them as static
# assets on next deploy.
#
# Vercel's build container cannot run Puppeteer, so prerendering must happen
# locally before push. This script promotes the local artifacts.
#
# Usage:
#   npm run prerender:local
#
# Then `git add public/ && git commit && git push` to deploy the snapshot.
#
# Committed HTML files contain per-chunk placeholders (__VITE_BUNDLE_<name>_<ext>__).
# The Vite plugin in vite.config.js substitutes them with the current build's
# hashes at every closeBundle, so snapshots stay deployment-agnostic.

set -u

DIST=dist
PUBLIC=public

ROUTES=(
  about
  contact
  financing
  insurance-claim
  privacy-policy
  repair-care
  repair-gallery
  services
  services/bedliners-accessories
  services/collision-repair
  services/custom-paint
  services/light-mechanical
  services/paint-refinish
  services/paintless-dent-repair
  terms-of-service
  trusted-partners
)

count=0
for r in "${ROUTES[@]}"; do
  r="${r%$'\r'}"  # strip CR if the file got CRLF line endings (Windows/git autocrlf)
  src="$DIST/$r/index.html"
  if [ -f "$src" ]; then
    rm -rf "$PUBLIC/$r"
    mkdir -p "$PUBLIC/$r"
    cp "$src" "$PUBLIC/$r/index.html"
    count=$((count + 1))
  fi
done

if [ -f "$DIST/_prerendered_root.html" ]; then
  cp "$DIST/_prerendered_root.html" "$PUBLIC/_prerendered_root.html"
  echo "sync-public.sh: copied root snapshot ($(wc -c < "$PUBLIC/_prerendered_root.html") bytes)"
fi

echo "sync-public.sh: copied $count prerendered route files from $DIST to $PUBLIC"
