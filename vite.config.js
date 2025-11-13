import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePluginPrerender } from 'vite-plugin-prerender'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginPrerender({
      // List of routes to prerender as static HTML
      staticDir: path.resolve(__dirname, 'dist'),
      routes: [
        '/',                                          // Home page
        '/about',                                     // About page
        '/services',                                  // All services overview
        '/contact',                                   // Contact page
        '/repair-gallery',                            // Repair gallery
        '/financing',                                 // Financing options
        '/login',                                     // Customer login
        '/register',                                  // Customer registration
        '/services/collision-repair',                 // Collision repair service
        '/services/paint-refinish',                   // Paint & refinish service
        '/services/custom-paint',                     // Custom paint service
        '/services/paintless-dent-repair',            // PDR service
        '/services/bedliners-accessories',            // Bedliners service
        '/services/light-mechanical',                 // Light mechanical service
      ],
      // Puppeteer options for rendering
      rendererOptions: {
        maxConcurrentRoutes: 4,
        renderAfterDocumentEvent: 'render-event',
      },
    }),
  ],
  build: {
    // Generate source maps for debugging production issues (optional)
    sourcemap: false,

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
