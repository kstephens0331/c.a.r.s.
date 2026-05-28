// Post-build prerender: spins up vite preview, navigates Puppeteer to each
// public marketing route, waits for React + Helmet to render, captures the
// post-hydration HTML, replaces ALL hashed bundle/style paths with placeholder
// markers (one per logical chunk: index, vendor, supabase, lazy-loaded), strips
// duplicate static Helmet twins, and writes back to dist/<route>/index.html.
// The root goes to dist/_prerendered_root.html so the Vite plugin can swap it
// in for Vite's own generic index.html at closeBundle.
//
// Crawlers (Ahrefs Basic, Googlebot in non-JS mode) get per-route titles + H1
// + meta + canonical + content. The placeholder dance exists because Vite's
// content hash is NOT deterministic across build environments (verified
// 2026-05-27 when sister SACVPN repo shipped a 404 from a captured-hash
// snapshot). The rewrite-prerendered-assets Vite plugin (vite.config.js)
// re-resolves placeholders at every build.

import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer';

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist/ not found. Run `vite build` first.');
  process.exit(1);
}

// Public marketing routes. Auth-gated routes (/login, /register, /admin/*,
// /portal/*) excluded because they need login state and have no public
// content for crawlers.
const ROUTES = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/repair-gallery',
  '/services/collision-repair',
  '/services/paint-refinish',
  '/services/custom-paint',
  '/services/paintless-dent-repair',
  '/services/bedliners-accessories',
  '/services/light-mechanical',
  '/financing',
  '/trusted-partners',
  '/privacy-policy',
  '/terms-of-service',
  '/insurance-claim',
  '/repair-care',
];

const PORT = 5175;
const BASE = `http://localhost:${PORT}`;
const CANONICAL_ORIGIN = 'https://www.carscollisionandrefinishshop.com';

console.log(`[prerender] Starting vite preview on port ${PORT}...`);
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  shell: true,
  stdio: ['ignore', 'pipe', 'inherit'],
});

let previewReady = false;
preview.stdout.on('data', (data) => {
  const s = data.toString();
  process.stdout.write(`[preview] ${s}`);
  const clean = s.replace(/\[[0-9;]*m/g, '');
  if (clean.includes(String(PORT)) || clean.includes('ready in') || clean.toLowerCase().includes('local:')) {
    previewReady = true;
  }
});

const waitForPreview = async () => {
  for (let i = 0; i < 30; i++) {
    if (previewReady) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const ok = await waitForPreview();
if (!ok) {
  console.error('[prerender] vite preview never became ready');
  preview.kill();
  process.exit(1);
}
await new Promise((r) => setTimeout(r, 1000));

console.log('[prerender] Launching headless browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// React-helmet-async usually REPLACES static tags. When both exist
// (data-rh="true" Helmet version + a plain static one), strip the static
// version so the prerendered HTML has exactly one of each.
function stripStaticHelmetTwins(html) {
  const count = (re) => (html.match(re) || []).length;
  const descRh = /<meta[^>]*name="description"[^>]*data-rh="true"[^>]*>/i;
  const descPlain = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
  if (descRh.test(html) && descPlain.test(html)) html = html.replace(descPlain, '');
  const kwRh = /<meta[^>]*name="keywords"[^>]*data-rh="true"[^>]*>/i;
  const kwPlain = /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i;
  if (kwRh.test(html) && kwPlain.test(html)) html = html.replace(kwPlain, '');
  const canonRh = /<link[^>]*rel="canonical"[^>]*data-rh="true"[^>]*>/i;
  const canonPlain = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  if (canonRh.test(html) && canonPlain.test(html)) html = html.replace(canonPlain, '');
  if (count(/<title[^>]*>[^<]*<\/title>/gi) >= 2) {
    html = html.replace(/<title>[^<]*<\/title>/, '');
  }
  return html;
}

// Replace EVERY hashed asset path with a per-logical-name placeholder. The
// vite plugin reinserts current paths at closeBundle, so the committed
// snapshot stays valid across Windows local + Vercel Linux builds.
function placeholderizeBundlePaths(html) {
  return html.replace(/\/assets\/(.+?)-[A-Za-z0-9_-]{8}\.(js|css)/g, (match, prefix, ext) => {
    return `__VITE_BUNDLE_${prefix}_${ext}__`;
  });
}

// The page components don't set a per-route canonical via Helmet, so every
// page inherits the static root canonical from index.html. Ahrefs flagged all
// 11 sitemap URLs as "non-canonical page in sitemap" for this reason. Inject
// the correct self-referential canonical based on the route being prerendered;
// guaranteed correct regardless of page-level Helmet config.
function fixCanonical(html, route) {
  const url = route === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${route}`;
  if (/<link[^>]*rel="canonical"[^>]*>/i.test(html)) {
    return html.replace(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}">`);
  }
  // No canonical present: inject one right after <head>
  return html.replace(/<head[^>]*>/i, (m) => `${m}<link rel="canonical" href="${url}">`);
}

let okCount = 0;
let failCount = 0;
const errors = [];

try {
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30_000 });
      // Wait for react-helmet-async to flush its tags (marked data-rh="true").
      // HomePage in particular flushed AFTER networkidle0 on first load, so a
      // fixed delay was unreliable; wait for the marker, then a short settle.
      await page.waitForFunction(() => !!document.querySelector('[data-rh="true"]'), { timeout: 10_000 })
        .catch(() => console.warn(`[prerender] no data-rh marker on ${route}, capturing anyway`));
      await new Promise((r) => setTimeout(r, 500));
      let rendered = await page.content();
      await page.close();

      rendered = stripStaticHelmetTwins(rendered);
      rendered = fixCanonical(rendered, route);
      rendered = placeholderizeBundlePaths(rendered);

      const outPath = route === '/'
        ? join(distDir, '_prerendered_root.html')
        : join(distDir, route.slice(1), 'index.html');
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, rendered, 'utf-8');
      console.log(`[prerender] OK  ${route} -> ${outPath} (${rendered.length} bytes)`);
      okCount++;
    } catch (err) {
      console.error(`[prerender] FAIL ${route}: ${err.message}`);
      errors.push({ route, error: err.message });
      failCount++;
    }
  }
} finally {
  await browser.close();
  // preview.kill() does not terminate the shell-spawned child tree on Windows
  // (vite preview keeps the port + an open stdio pipe, hanging node after the
  // loop). Kill the whole tree, then force-exit below.
  try {
    if (process.platform === 'win32' && preview.pid) {
      execSync(`taskkill /pid ${preview.pid} /f /t`, { stdio: 'ignore' });
    } else {
      preview.kill();
    }
  } catch {
    /* already gone */
  }
}

console.log(`\n[prerender] Done. ${okCount} ok, ${failCount} failed.`);
if (errors.length > 0) {
  console.error('[prerender] Errors:');
  for (const e of errors) console.error(`  ${e.route}: ${e.error}`);
  process.exit(failCount === ROUTES.length ? 1 : 0);
}

// Force exit: any orphaned child handle would otherwise keep node alive.
process.exit(0);
