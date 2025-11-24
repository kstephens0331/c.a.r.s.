import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), asyncCSSPlugin()],
  build: {
    // Generate source maps for debugging production issues (optional)
    sourcemap: false,

    // Target modern browsers to avoid unnecessary transpilation
    target: 'es2015',

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
