#!/usr/bin/env node
/**
 * Quick health check — tests every directory URL and reports alive/dead/redirect.
 * Usage: node check-urls.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');

const dirs = JSON.parse(fs.readFileSync('directories.json', 'utf8'));

function checkUrl(url, timeout = 8000) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' } }, res => {
      res.resume(); // drain
      resolve({ status: res.statusCode, redirect: res.headers.location || null });
    });
    req.on('error', err => resolve({ status: 0, error: err.code }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'TIMEOUT' }); });
  });
}

(async () => {
  const alive = [];
  const dead = [];

  for (const dir of dirs) {
    const result = await checkUrl(dir.url);
    const ok = result.status >= 200 && result.status < 400;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} ${result.status || result.error} | ${dir.name} | ${dir.url}`);
    if (ok) alive.push(dir);
    else dead.push({ ...dir, reason: `${result.status || result.error}` });
  }

  console.log(`\n===== RESULTS =====`);
  console.log(`Alive: ${alive.length}/${dirs.length}`);
  console.log(`Dead:  ${dead.length}/${dirs.length}`);
  console.log(`\nAlive directories:`);
  alive.forEach(d => console.log(`  ${d.name} (DR ${d.dr}) — ${d.url}`));
})();
