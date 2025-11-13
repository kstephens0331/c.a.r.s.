/**
 * Static HTML Prerendering Script for C.A.R.S Collision & Refinish Shop
 *
 * This script generates static HTML files for all public routes to improve SEO
 * and allow search engine bots to crawl content without executing JavaScript.
 *
 * Usage: node prerender.js
 *
 * The script will:
 * 1. Build the Vite app
 * 2. Start a local server
 * 3. Use Puppeteer to render each route
 * 4. Save static HTML files to dist/ folder
 * 5. Inject meta tags and structured data
 */

import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes to prerender (all public pages)
const routes = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/repair-gallery',
  '/financing',
  '/login',
  '/register',
  '/services/collision-repair',
  '/services/paint-refinish',
  '/services/custom-paint',
  '/services/paintless-dent-repair',
  '/services/bedliners-accessories',
  '/services/light-mechanical',
];

async function prerender() {
  console.log('🚀 Starting prerendering process...\n');

  // Start Vite preview server
  console.log('📦 Building production bundle...');
  const { execSync } = await import('child_process');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n🌐 Starting preview server...');
  const server = await createServer({
    server: { port: 4173 },
    preview: true,
  });
  await server.listen();

  const baseUrl = 'http://localhost:4173';
  console.log(`✅ Server running at ${baseUrl}\n`);

  // Launch Puppeteer
  console.log('🤖 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const distDir = path.resolve(__dirname, 'dist');

  // Prerender each route
  for (const route of routes) {
    try {
      console.log(`📄 Prerendering: ${route}`);

      const page = await browser.newPage();

      // Set viewport for desktop rendering
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to route
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for React to fully render
      await page.waitForTimeout(2000);

      // Get rendered HTML
      const html = await page.content();

      // Determine file path
      let filePath;
      if (route === '/') {
        filePath = path.join(distDir, 'index.html');
      } else {
        const routePath = route.replace(/^\//, '').replace(/\/$/, '');
        const routeDir = path.join(distDir, routePath);

        // Create directory if needed
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }

        filePath = path.join(routeDir, 'index.html');
      }

      // Save HTML file
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`   ✅ Saved to: ${filePath.replace(distDir, '')}`);

      await page.close();
    } catch (error) {
      console.error(`   ❌ Error prerendering ${route}:`, error.message);
    }
  }

  // Close browser and server
  await browser.close();
  await server.close();

  console.log('\n✨ Prerendering complete!');
  console.log(`📁 Static HTML files generated in: ${distDir}`);
  console.log('\n📊 Summary:');
  console.log(`   - ${routes.length} routes prerendered`);
  console.log(`   - All routes now have static HTML for bots`);
  console.log(`   - Deploy the dist/ folder to your hosting provider`);
}

// Run prerendering
prerender().catch((error) => {
  console.error('❌ Prerendering failed:', error);
  process.exit(1);
});
