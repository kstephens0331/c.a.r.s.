#!/usr/bin/env node

/**
 * cron-runner.js
 * 
 * Designed to be called by cron at 9 PM CST nightly.
 * Runs headless, logs everything to a date-stamped file,
 * and exits cleanly whether there's work to do or not.
 * 
 * Cron entry:
 *   0 21 * * * cd /path/to/smart-submitter && node src/cron-runner.js >> logs/cron.log 2>&1
 * 
 * What it does:
 *   1. Checks scheduler — are we under daily/weekly caps?
 *   2. Gets this week's batch from the 30-week planner
 *   3. Runs headless Puppeteer (no visible browser)
 *   4. Processes up to daily limit (default 3)
 *   5. Pauses for CAPTCHAs? No — in cron mode, CAPTCHAs are auto-skipped
 *   6. Logs everything to logs/YYYY-MM-DD.log
 *   7. Exits with code 0 (success) or 1 (error)
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
// CONFIG
// ============================================================

const CONFIG_PATH = process.argv[2] || path.join(__dirname, '..', 'config.json');
const DIR_PATH = path.join(__dirname, '..', 'directories.json');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const SUBMISSION_LOG_PATH = path.join(__dirname, '..', 'submission-log.json');

// ============================================================
// LOGGING
// ============================================================

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const today = new Date().toISOString().split('T')[0];
const dailyLogPath = path.join(LOG_DIR, `${today}.log`);
const dailyLogStream = fs.createWriteStream(dailyLogPath, { flags: 'a' });

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  dailyLogStream.write(line + '\n');
}

function logError(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ❌ ${msg}`;
  console.error(line);
  dailyLogStream.write(line + '\n');
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  log('═══════════════════════════════════════════════════');
  log('🤖 Smart Submitter — Cron Nightly Run');
  log('═══════════════════════════════════════════════════');

  // Load config
  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    logError(`Cannot load config: ${CONFIG_PATH} — ${err.message}`);
    process.exit(1);
  }

  const biz = config.business;
  const settings = config.settings || {};
  const sched = config.scheduler || {};

  // Resolve API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    logError('ANTHROPIC_API_KEY not found in environment. Add it to smart-submitter/.env');
    process.exit(1);
  }

  log(`📋 Client: ${biz.name}`);

  // Load directories
  let directories;
  try {
    directories = JSON.parse(fs.readFileSync(DIR_PATH, 'utf8'));
  } catch (err) {
    logError(`Cannot load directories: ${DIR_PATH}`);
    process.exit(1);
  }

  // Init submission log
  const submissionLog = new SubmissionLog(SUBMISSION_LOG_PATH);
  submissionLog.setClient(biz.name);

  // Init scheduler
  const scheduler = new Scheduler(submissionLog, {
    weekly_limit: sched.weekly_limit || 15,
    daily_limit: sched.daily_limit || 3,
    start_hour_cst: sched.start_hour_cst || 21,
    min_delay_between_ms: sched.min_delay_between_ms || 180000,
    max_delay_between_ms: sched.max_delay_between_ms || 600000,
  });

  // Check allowance
  const allowance = scheduler.getAllowance();
  log(`📊 Weekly: ${allowance.weeklyUsed}/${allowance.weeklyLimit} | Daily: ${allowance.dailyUsed}/${allowance.dailyLimit}`);

  if (allowance.weeklyRemaining <= 0) {
    log('🛑 Weekly limit reached. Nothing to do. Exiting.');
    process.exit(0);
  }

  if (allowance.dailyRemaining <= 0) {
    log('🛑 Daily limit reached. Nothing to do. Exiting.');
    process.exit(0);
  }

  const maxTonight = allowance.allowed;
  log(`✅ Allowed tonight: ${maxTonight}`);

  // Init weekly planner
  const planner = new WeeklyPlanner(directories, submissionLog, {
    start_date: config.campaign?.start_date || null,
    per_week: 15,
  });

  const weekBatch = planner.getThisWeeksBatch();
  log(`📅 Week ${weekBatch.week} — Phase ${weekBatch.phase.num}: ${weekBatch.phase.name}`);

  if (weekBatch.completed || weekBatch.dirs.length === 0) {
    log('✅ This week\'s batch is complete. Nothing to do. Exiting.');
    process.exit(0);
  }

  // Cap to daily allowance
  const targets = weekBatch.dirs.slice(0, maxTonight);
  log(`🎯 Processing ${targets.length} directories tonight`);

  // Init AI brain
  const brain = new AIBrain(apiKey, settings.model || 'claude-sonnet-4-20250514');
  const relevanceChecker = new RelevanceChecker(brain, biz);

  // Launch headless browser
  log('🚀 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1366, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  let submitted = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < targets.length; i++) {
    const dir = targets[i];
    log(`\n[${i + 1}/${targets.length}] 📁 ${dir.name} (DR ${dir.dr})`);
    log(`    🔗 ${dir.url}`);

    // Quick relevance check
    const quickRel = relevanceChecker.quickCheck(dir);
    if (quickRel.pass === false) {
      log(`    ⏭️  Skipped (irrelevant): ${quickRel.reason}`);
      submissionLog.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: 'skipped', reason: quickRel.reason, mode: 'cron',
      });
      skipped++;
      continue;
    }

    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      ['image', 'media', 'font'].includes(type) ? req.abort() : req.continue();
    });

    try {
      // Navigate
      log(`    ⏳ Loading...`);
      try {
        await page.goto(dir.url, { waitUntil: 'networkidle2', timeout: settings.timeout_ms || 30000 });
      } catch (e) {
        try {
          await page.goto(dir.url, { waitUntil: 'domcontentloaded', timeout: settings.timeout_ms || 30000 });
        } catch (e2) {
          throw new Error(`Page load failed: ${e2.message}`);
        }
      }
      await sleep(1500);

      // Analyze
      log(`    🔍 Analyzing...`);
      const snapshot = await analyzePage(page);
      const fieldCount = snapshot.forms.reduce((s, f) => s + f.fields.length, 0);
      log(`    📝 ${snapshot.forms.length} form(s), ${fieldCount} fields`);

      // Deep relevance check
      if (quickRel.pass !== true) {
        const deepRel = await relevanceChecker.deepCheck(snapshot, dir);
        if (!deepRel.relevant) {
          log(`    ⏭️  Skipped (irrelevant): ${deepRel.reason}`);
          submissionLog.addEntry({
            name: dir.name, url: dir.url, dr: dir.dr,
            status: 'skipped', reason: deepRel.reason, mode: 'cron',
          });
          skipped++;
          await page.close();
          continue;
        }
        log(`    ✅ Relevant: ${deepRel.reason}`);
      }

      // AI plan
      log(`    🧠 AI analyzing...`);
      const plan = await brain.analyzeAndPlan(snapshot, biz);
      log(`    📋 ${plan.assessment.page_type} (confidence: ${plan.assessment.confidence})`);

      // Skip if needs human (CAPTCHA, login) — cron can't interact
      if (plan.assessment.needs_human) {
        log(`    ⏭️  Needs human interaction: ${plan.assessment.reason_needs_human}`);
        submissionLog.addEntry({
          name: dir.name, url: dir.url, dr: dir.dr,
          status: 'skipped', reason: `Cron: ${plan.assessment.reason_needs_human}`, mode: 'cron',
          ai_assessment: plan.assessment,
        });
        skipped++;
        await page.close();
        continue;
      }

      if (plan.assessment.should_skip) {
        log(`    ⏭️  Skipping: ${plan.assessment.skip_reason}`);
        submissionLog.addEntry({
          name: dir.name, url: dir.url, dr: dir.dr,
          status: 'skipped', reason: plan.assessment.skip_reason, mode: 'cron',
        });
        skipped++;
        await page.close();
        continue;
      }

      // Fill
      if (plan.fills.length > 0) {
        log(`    ✏️  Filling ${plan.fills.length} fields...`);
        const filler = new FormFiller(page, settings);
        const results = await filler.executeFills(plan.fills);
        log(`    ✅ Filled: ${results.filled} | ❌ Failed: ${results.failed}`);
      }

      // Submit
      if (plan.click_after_fill?.css_selector) {
        log(`    🖱️  Clicking: ${plan.click_after_fill.description}`);
        await sleep(500);
        const filler = new FormFiller(page, settings);
        await filler.clickButton(plan.click_after_fill.css_selector);

        try {
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        } catch (e) {
          await sleep(2000);
        }
      }

      // Assess result
      log(`    🔍 Checking result...`);
      await sleep(1000);
      const postSnapshot = await analyzePage(page);
      const result = await brain.assessResult(postSnapshot);
      log(`    📋 Result: ${result.status} — ${result.message}`);

      const logStatus = result.status === 'success' ? 'submitted'
        : result.status === 'pending_verification' ? 'pending_verification'
        : 'failed';

      submissionLog.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: logStatus, result, mode: 'cron',
        ai_assessment: plan.assessment,
      });

      if (logStatus === 'submitted' || logStatus === 'pending_verification') {
        log(`    ✅ ${logStatus === 'submitted' ? 'Submitted!' : 'Pending verification'}`);
        submitted++;
      } else {
        log(`    ❌ Failed: ${result.message}`);
        failed++;
      }

    } catch (err) {
      logError(`    Fatal: ${err.message}`);
      submissionLog.addEntry({
        name: dir.name, url: dir.url, dr: dir.dr,
        status: 'failed', error: err.message, mode: 'cron',
      });
      failed++;

      // Screenshot on error
      try {
        const ssDir = path.join(__dirname, '..', 'screenshots');
        if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
        const ssPath = path.join(ssDir, `cron_${dir.name.replace(/\W/g, '_')}_${Date.now()}.png`);
        await page.screenshot({ path: ssPath, fullPage: true });
        log(`    📸 Screenshot: ${ssPath}`);
      } catch (e) {}
    }

    await page.close();

    // Randomized delay between submissions
    if (i < targets.length - 1) {
      const delay = scheduler.getSubmissionDelay();
      const delaySec = Math.round(delay / 1000);
      log(`    ⏳ Waiting ${delaySec}s...`);
      await sleep(delay);
    }
  }

  await browser.close();

  // Summary
  log('\n═══════════════════════════════════════════════════');
  log(`📊 NIGHTLY SUMMARY`);
  log(`   ✅ Submitted: ${submitted}`);
  log(`   ⏭️  Skipped:  ${skipped}`);
  log(`   ❌ Failed:   ${failed}`);
  log(`   📊 All time: ${submissionLog.getSummary()}`);
  log('═══════════════════════════════════════════════════\n');

  dailyLogStream.end();
  process.exit(failed > 0 && submitted === 0 ? 1 : 0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => {
  logError(`Unexpected: ${err.message}\n${err.stack}`);
  dailyLogStream.end();
  process.exit(1);
});
