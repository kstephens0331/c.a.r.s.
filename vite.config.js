import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

// Plugin to load CSS asynchronously
function asyncCSSPlugin() {
  return {
    name: 'async-css',
    transformIndexHtml(html) {
      // Replace blocking CSS link with async loading
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
        (match, href) => {
          return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${href}"></noscript>`
        }
      )
    },
  }
}

// Substitute bundle-path placeholders left by scripts/prerender.mjs with the
// CURRENT hashed asset paths Vite just generated. Prerendered HTML lives in
// public/<route>/index.html and gets copied to dist/<route>/index.html by
// Vite's static asset step; this plugin walks dist/ and rewrites the markers.
//
// Vite's content hash is not deterministic across build environments (Windows
// local vs Vercel Linux container produced different JS hashes for identical
// source on the sister SACVPN repo on 2026-05-27, shipping a 404 to prod). The
// placeholder + rewrite pattern keeps prerendered snapshots deployment-
// agnostic. Multi-chunk aware so vendor/supabase/index/lazy chunks each
// resolve to their own current hash.
function rewritePrerenderedAssets() {
  return {
    name: 'rewrite-prerendered-assets',
    apply: 'build',
    closeBundle() {
      const distDir = 'dist'
      const entryPath = join(distDir, 'index.html')
      const assetsDir = join(distDir, 'assets')
      if (!existsSync(assetsDir)) return

      // Build logical-name -> current-hashed-path map.
      // Vite output format: <name>-<8charHash>.<ext>
      const assetByLogical = new Map()
      for (const f of readdirSync(assetsDir)) {
        const m = f.match(/^(.+)-[A-Za-z0-9_-]{8}\.(js|css)$/)
        if (m) assetByLogical.set(`${m[1]}.${m[2]}`, `/assets/${f}`)
      }

      const placeholderRe = /__VITE_BUNDLE_([A-Za-z0-9_-]+)_(js|css)__/g
      function substitute(html) {
        return html.replace(placeholderRe, (match, name, ext) => {
          const current = assetByLogical.get(`${name}.${ext}`)
          if (!current) {
            console.warn(`[rewrite-prerendered-assets] no current path for ${name}.${ext}, leaving placeholder`)
            return match
          }
          return current
        })
      }

      let rewroteRoutes = 0
      function walk(dir) {
        for (const entry of readdirSync(dir)) {
          const p = join(dir, entry)
          const s = statSync(p)
          if (s.isDirectory()) walk(p)
          else if (entry === 'index.html' && p !== entryPath) {
            const before = readFileSync(p, 'utf-8')
            if (!placeholderRe.test(before)) { placeholderRe.lastIndex = 0; continue }
            placeholderRe.lastIndex = 0
            writeFileSync(p, substitute(before), 'utf-8')
            rewroteRoutes++
          }
        }
      }
      walk(distDir)

      const rootSnapshot = join(distDir, '_prerendered_root.html')
      if (existsSync(rootSnapshot)) {
        const html = substitute(readFileSync(rootSnapshot, 'utf-8'))
        writeFileSync(entryPath, html, 'utf-8')
        unlinkSync(rootSnapshot)
        console.log(`[rewrite-prerendered-assets] root replaced with prerendered snapshot (${html.length} bytes)`)
      }
      console.log(`[rewrite-prerendered-assets] rewrote ${rewroteRoutes} prerendered route files, ${assetByLogical.size} assets indexed`)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), asyncCSSPlugin(), rewritePrerenderedAssets()],
  build: {
    // Generate source maps for debugging production issues (optional)
    sourcemap: false,

    // Target modern browsers to avoid unnecessary transpilation (ES2020 eliminates more polyfills)
    target: 'es2020',

    // Optimize build output
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
