#!/usr/bin/env node

/**
 * StephensCode Smart Submitter
 * ==============================
 * AI-powered directory submission tool.
 * 
 * Uses Claude to dynamically analyze each directory page, understand
 * what the form is asking for, map business data to fields, and
 * drive Puppeteer to fill and submit — adapting on the fly.
 * 
 * Usage:
 *   node src/index.js                          # Run with defaults
 *   node src/index.js --config other.json      # Different client
 *   node src/index.js --start 10 --count 5     # Start at #10, do 5
 *   node src/index.js --mode list              # Show directory status
 *   node src/index.js --dry-run                # Analyze pages but don't submit
 *   node src/index.js --resume                 # Skip already-completed
 * 
 * Author: Kyle Stephens, StephensCode LLC
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { AIBrain } = require('./ai-brain');
const { analyzePage } = require('./page-analyzer');
const { FormFiller } = require('./form-filler');
const { SubmissionLog } = require('./logger');
const { Scheduler } = require('./scheduler');
const { RelevanceChecker } = require('./relevance-checker');
const { WeeklyPlanner } = require('./weekly-planner');

// ============================================================
// CLI ARGS
// ============================================================

const args = parseArgs(process.argv.slice(2));
const CONFIG_PATH = args.config || 'config.json';
const DIR_PATH = args.directories || 'directories.json';
const LOG_PATH = args.log || 'submission-log.json';
const MODE = args.mode || 'run';
const START = parseInt(args.start || '0');
const COUNT = parseInt(args.count || '9999');
const DRY_RUN = args['dry-run'] !== undefined;
const RESUME = args.resume !== undefined || true; // always resume by default
const FORCE = args.force !== undefined;
const SKIP_RELEVANCE = args['skip-relevance'] !== undefined;

// ============================================================
// MAIN
// ============================================================

async function main() {
  printBanner();

  // Load config
  const config = loadJSON(CONFIG_PATH);
  if (!config) fatal(`Cannot load config: ${CONFIG_PATH}`);
  
  const biz = config.business;
  const settings = config.settings || {};
  
  // Resolve API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    fatal('ANTHROPIC_API_KEY not found in environment. Add it to smart-submitter/.env');
  }

  console.log(`📋 Client: ${biz.name}`);
  console.log(`📍 Location: ${biz.city}, ${biz.state} ${biz.zip}`);
  console.log(`🌐 Website: ${biz.website}`);
  console.log(`🤖 Model: ${settings.model || 'claude-sonnet-4-20250514'}`);
  if (DRY_RUN) console.log(`⚠️  DRY RUN - will analyze but not submit\n`);

  // Load directories
  const directories = loadJSON(DIR_PATH);
  if (!directories) fatal(`Cannot load directories: ${DIR_PATH}`);

  // Init log
  const log = new SubmissionLog(LOG_PATH);
  log.setClient(biz.name);
  const completedUrls = log.getCompletedUrls();

  // Filter directories
  let targets = directories;
  if (RESUME) {
    targets = targets.filter(d => !completedUrls.has(d.url));
  }
  targets = targets.slice(START, START + COUNT);

  console.log(`\n📊 Total directories: ${directories.length}`);
  console.log(`✅ Already completed: ${completedUrls.size}`);

  // ---- WEEKLY PLANNER: 30-week strategic sequencing ----
  const planner = new WeeklyPlanner(directories, log, {
    start_date: config.campaign?.start_date || null,
    per_week: 15,
  });

  // PLAN mode - show full 30-week overview
  if (MODE === 'plan') {
    planner.printOverview();
    return;
  }

  // Unless --start is explicitly set, use the planner to get this week's batch
  if (!args.start) {
    const weekBatch = planner.getThisWeeksBatch();
    const phase = weekBatch.phase;
    console.log(`📅 Week ${weekBatch.week} — Phase ${phase.num}: ${phase.name} (DR ${phase.drRange})`);
    if (weekBatch.already_done > 0) {
      console.log(`   Already done this week: ${weekBatch.already_done}/${weekBatch.total_this_week}`);
    }
    targets = weekBatch.dirs;
  }

  console.log(`🎯 This session: ${targets.length}`);
  console.log(`📝 Log: ${LOG_PATH}\n`);

  // LIST mode
  if (MODE === 'list') {
    printList(directories, completedUrls);
    return;
  }

  // ---- SCHEDULER: Enforce 15/week, ~2-3/day, 9 PM CST window ----
  const sched = config.scheduler || {};
  const scheduler = new Scheduler(log, {
    weekly_limit: sched.weekly_limit || 15,
    daily_limit: sched.daily_limit || 3,
    start_hour_cst: sched.start_hour_cst || 21,
    min_delay_between_ms: sched.min_delay_between_ms || 180000,
    max_delay_between_ms: sched.max_delay_between_ms || 600000,
  });

  scheduler.printStatus();

  // STATUS mode - just show the schedule and exit
  if (MODE === 'status') {
    return;
  }

  const preflight = scheduler.preflight();

  if (!preflight.canRun && !FORCE) {
    console.log(`🚫 ${preflight.reason}`);
    console.log(`   Use --force to override time window (weekly/daily limits still enforced)`);
    return;
  }

  if (FORCE && !preflight.canRun) {
    // Force overrides time window but NOT weekly/daily caps
    if (preflight.allowance.weeklyRemaining <= 0) {
      console.log(`🚫 Weekly limit hit (${scheduler.weeklyLimit}). Cannot override with --force.`);
      return;
    }
    if (preflight.allowance.dailyRemaining <= 0) {
      console.log(`🚫 Daily limit hit (${scheduler.dailyLimit}). Cannot override with --force.`);
      return;
    }
    console.log(`⚠️  --force: Overriding time window. Limits still enforced.`);
  }

  // Cap targets to today's allowance
  const maxToday = preflight.allowance.allowed;
  if (targets.length > maxToday) {
    console.log(`📊 Capping to ${maxToday} submissions (scheduler limit)`);
    targets = targets.slice(0, maxToday);
  }

  if (targets.length === 0) {
    console.log('🎉 All directories have been submitted! Add more to directories.json or clear the log.');
    return;
  }

  // Init AI brain
  const brain = new AIBrain(
    apiKey,
    settings.model || 'claude-sonnet-4-20250514'
  );

  // Init relevance checker
  const relevanceChecker = new RelevanceChecker(brain, biz);

  // Launch browser
  console.log('🚀 Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: settings.headless === true ? 'new' : false,
    defaultViewport: { width: 1366, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled', // Reduce bot detection
    ],
  });

  // Set realistic user agent on all new pages
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  let sessionStats = { submitted: 0, failed: 0, skipped: 0 };

  // Process each directory
  for (let i = 0; i < targets.length; i++) {
    const dir = targets[i];
    const num = `[${i + 1}/${targets.length}]`;

    console.log(`${'═'.repeat(60)}`);
    console.log(`${num} 📁 ${dir.name} (DR ~${dir.dr})`);
    console.log(`    🔗 ${dir.url}`);

    const page = await browser.newPage();
    await page.setUserAgent(UA);

    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      if (['image', 'media', 'font'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
      await processDirectory(page, dir, biz, brain, settings, log, DRY_RUN, sessionStats, relevanceChecker, SKIP_RELEVANCE);
    } catch (err) {
      console.log(`    ❌ Fatal error: ${err.message}`);
      log.addEntry({
        name: dir.name,
        url: dir.url,
        dr: dir.dr,
        status: 'failed',
        error: err.message,
        ai_assessment: null,
      });
      sessionStats.failed++;

      // Screenshot on error
      if (settings.screenshot_on_error) {
        try {
          const ssPath = `screenshots/error_${dir.name.replace(/\W/g, '_')}_${Date.now()}.png`;
          if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
          await page.screenshot({ path: ssPath, fullPage: true });
          console.log(`    📸 Error screenshot: ${ssPath}`);
        } catch (e) {}
      }
    }

    await page.close();

    // Delay between sites (scheduler-controlled for natural pacing)
    if (i < targets.length - 1) {
      const delay = scheduler.getSubmissionDelay();
      const delaySec = Math.round(delay / 1000);
      console.log(`    ⏳ Waiting ${delaySec}s before next submission (natural pacing)...`);
      await sleep(delay);
    }
  }

  await browser.close();

  // Final summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`\n📊 SESSION COMPLETE`);
  console.log(`   ✅ Submitted: ${sessionStats.submitted}`);
  console.log(`   ⏭️  Skipped:  ${sessionStats.skipped}`);
  console.log(`   ❌ Failed:   ${sessionStats.failed}`);
  console.log(`\n📊 ALL TIME: ${log.getSummary()}`);
  console.log(`\n💾 Log saved to: ${LOG_PATH}\n`);
}

// ============================================================
// DIRECTORY PROCESSING - THE CORE LOOP
// ============================================================

async function processDirectory(page, dir, biz, brain, settings, log, dryRun, stats, relevanceChecker, skipRelevance) {
  const timeout = settings.timeout_ms || 30000;
  const maxSteps = 5; // Max pages/steps for multi-step forms

  // ---- RELEVANCE PRE-CHECK (no page load needed) ----
  if (!skipRelevance) {
    const quickResult = relevanceChecker.quickCheck(dir);
    if (quickResult.pass === false) {
      console.log(`    ⏭️  Skipped (irrelevant): ${quickResult.reason}`);
      log.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: 'skipped',
        reason: `Irrelevant: ${quickResult.reason}`,
        relevance: quickResult,
      });
      stats.skipped++;
      return;
    }
    if (quickResult.pass === true) {
      console.log(`    ✅ Relevance: ${quickResult.reason} (${(quickResult.confidence * 100).toFixed(0)}%)`);
    }
  }

  // Navigate
  console.log(`    ⏳ Loading page...`);
  try {
    await page.goto(dir.url, { waitUntil: 'networkidle2', timeout });
  } catch (err) {
    // Try domcontentloaded as fallback
    try {
      await page.goto(dir.url, { waitUntil: 'domcontentloaded', timeout });
    } catch (err2) {
      throw new Error(`Page load failed: ${err2.message}`);
    }
  }
  await sleep(1500); // Let JS frameworks render

  // Multi-step loop
  for (let step = 0; step < maxSteps; step++) {
    if (step > 0) console.log(`\n    📄 Step ${step + 1}:`);

    // 1. Analyze page
    console.log(`    🔍 Analyzing page...`);
    const snapshot = await analyzePage(page);

    // Quick stats
    const fieldCount = snapshot.forms.reduce((sum, f) => sum + f.fields.length, 0);
    console.log(`    📝 Found ${snapshot.forms.length} form(s), ${fieldCount} field(s), ${snapshot.buttons.length} button(s)`);
    if (snapshot.captcha_detected) console.log(`    ⚠️  CAPTCHA detected: ${snapshot.captcha_type}`);

    // ---- DEEP RELEVANCE CHECK (first step only) ----
    if (step === 0 && !skipRelevance) {
      const quickResult = relevanceChecker.quickCheck(dir);
      if (quickResult.pass !== true) { // Only deep-check if not already confirmed
        console.log(`    🔍 Checking industry relevance...`);
        const relevance = await relevanceChecker.deepCheck(snapshot, dir);
        if (!relevance.relevant) {
          console.log(`    ⏭️  Skipped (irrelevant): ${relevance.reason} (score: ${relevance.score.toFixed(2)})`);
          log.addEntry({
            name: dir.name, url: dir.url, dr: dir.dr,
            status: 'skipped',
            reason: `Irrelevant: ${relevance.reason}`,
            relevance: relevance,
          });
          stats.skipped++;
          return;
        }
        console.log(`    ✅ Relevant: ${relevance.reason} (score: ${relevance.score.toFixed(2)})`);
      }
    }

    // 2. Send to AI brain
    console.log(`    🧠 AI analyzing form structure...`);
    const plan = await brain.analyzeAndPlan(snapshot, biz);

    // Log the assessment
    console.log(`    📋 Assessment: ${plan.assessment.page_type} (confidence: ${plan.assessment.confidence})`);
    if (plan.assessment.description) console.log(`    📝 ${plan.assessment.description}`);

    // 3. Handle skip/human-needed cases
    if (plan.assessment.should_skip) {
      console.log(`    ⏭️  Skipping: ${plan.assessment.skip_reason}`);
      log.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: 'skipped',
        reason: plan.assessment.skip_reason,
        ai_assessment: plan.assessment,
      });
      stats.skipped++;
      return;
    }

    if (plan.assessment.needs_human) {
      console.log(`    👤 Needs human: ${plan.assessment.reason_needs_human}`);
      console.log(`    👆 Handle manually in the browser, then press Enter to continue (or 's' to skip)...`);

      const input = await waitForInput();
      if (input.trim().toLowerCase() === 's') {
        log.addEntry({
          name: dir.name, url: dir.url, dr: dir.dr,
          status: 'skipped',
          reason: 'User skipped (human intervention needed)',
          ai_assessment: plan.assessment,
        });
        stats.skipped++;
        return;
      }
      // User handled it manually - check if we need to continue to next step
      if (plan.expect_next === 'next_step') continue;
      
      log.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: 'submitted',
        method: 'manual',
        ai_assessment: plan.assessment,
      });
      stats.submitted++;
      return;
    }

    if (dryRun) {
      console.log(`    🏜️  DRY RUN - Would fill ${plan.fills.length} fields`);
      plan.fills.forEach(f => console.log(`       ${f.field_name}: "${f.value?.substring(0, 40)}..."`));
      log.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: 'dry_run',
        fills_planned: plan.fills.length,
        ai_assessment: plan.assessment,
      });
      return;
    }

    // 4. Execute fills
    if (plan.fills.length > 0) {
      console.log(`    ✏️  Filling ${plan.fills.length} fields...`);
      const filler = new FormFiller(page, settings);
      const results = await filler.executeFills(plan.fills);
      
      console.log(`    ✅ Filled: ${results.filled} | ❌ Failed: ${results.failed}`);
      
      // Log failed fields for debugging
      results.details
        .filter(d => d.status !== 'ok')
        .forEach(d => console.log(`       ⚠️  ${d.field}: ${d.status} ${d.error || ''}`));
    }

    // 5. Click submit/next button
    if (plan.click_after_fill?.css_selector) {
      console.log(`    🖱️  Clicking: ${plan.click_after_fill.description}`);
      await sleep(500);

      const filler = new FormFiller(page, settings);
      const clicked = await filler.clickButton(plan.click_after_fill.css_selector);

      if (!clicked) {
        console.log(`    ⚠️  Could not click button. Trying fallback...`);
        // Try clicking by text from the description
        const textClicked = await filler.clickByText(plan.click_after_fill.description);
        if (!textClicked) {
          console.log(`    ❌ Button click failed`);
        }
      }

      // Wait for navigation/response
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      } catch (e) {
        // Page might not navigate (AJAX form)
        await sleep(2000);
      }
    }

    // 6. Check if multi-step - continue loop
    if (plan.expect_next === 'next_step') {
      console.log(`    ➡️  Multi-step form detected, continuing...`);
      await sleep(1500);
      continue;
    }

    // 7. Assess result
    console.log(`    🔍 Checking result...`);
    await sleep(1000);
    const postSnapshot = await analyzePage(page);
    const result = await brain.assessResult(postSnapshot);

    console.log(`    📋 Result: ${result.status} - ${result.message}`);

    if (result.has_errors && result.error_fields?.length > 0) {
      console.log(`    ⚠️  Errors on: ${result.error_fields.join(', ')}`);
    }

    // Map result to log status
    let logStatus;
    switch (result.status) {
      case 'success': logStatus = 'submitted'; break;
      case 'pending_verification': logStatus = 'pending_verification'; break;
      case 'needs_more_steps':
        if (step < maxSteps - 1) {
          console.log(`    ➡️  More steps needed, continuing...`);
          await sleep(1500);
          continue;
        }
        logStatus = 'failed';
        break;
      default: logStatus = 'failed';
    }

    log.addEntry({
      name: dir.name, url: dir.url, dr: dir.dr,
      status: logStatus,
      method: 'automated',
      result: result,
      ai_assessment: plan.assessment,
    });

    if (logStatus === 'submitted' || logStatus === 'pending_verification') {
      console.log(`    ✅ ${logStatus === 'submitted' ? 'Submitted!' : 'Pending email verification'}`);
      stats.submitted++;
    } else {
      console.log(`    ❌ Failed: ${result.message}`);
      stats.failed++;
    }

    return; // Done with this directory
  }
}

// ============================================================
// UTILITIES
// ============================================================

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function waitForInput() {
  return new Promise(resolve => {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('    > ', answer => { rl.close(); resolve(answer); });
  });
}

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        result[key] = args[i + 1];
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

function printBanner() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🤖  StephensCode Smart Submitter v1.0                      ║
║   AI-Powered Directory Submission Tool                       ║
║                                                              ║
║   Claude analyzes each page → maps business data → fills     ║
║   forms dynamically → submits → verifies result              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

function printList(dirs, completedUrls) {
  console.log('\n📋 DIRECTORY STATUS\n');
  console.log(`${'Status'.padEnd(8)} ${'DR'.padStart(4)} ${'Name'.padEnd(25)} URL`);
  console.log('─'.repeat(80));

  dirs.forEach(d => {
    const status = completedUrls.has(d.url) ? '  ✅  ' : '  ⏳  ';
    const dr = String(d.dr).padStart(4);
    const name = d.name.padEnd(25);
    console.log(`${status} ${dr}  ${name} ${d.url}`);
  });

  const done = dirs.filter(d => completedUrls.has(d.url)).length;
  console.log(`\n📊 ${done}/${dirs.length} completed\n`);
}

function fatal(msg) {
  console.error(`\n❌ FATAL: ${msg}\n`);
  process.exit(1);
}

// ============================================================
// RUN
// ============================================================

main().catch(err => {
  console.error(`\n💥 Unexpected error: ${err.message}\n${err.stack}`);
  process.exit(1);
});
