# StephensCode Smart Submitter

AI-powered directory submission tool. Uses Claude to dynamically analyze each directory page, understand what the form wants, map business data to fields, and fill everything correctly the first time.

## How It Works

```
Directory URL → Quick relevance check → Puppeteer loads page → Page Analyzer extracts form
→ Deep relevance check (is this industry-appropriate?) → Claude AI maps business data
→ Form Filler executes → Claude verifies result → Scheduler logs + enforces velocity
→ 3-10 min randomized delay → Next directory
```

### Google-Safe Velocity Control

The scheduler enforces a hard cap of **15 submissions per week** spread across days:

- **Weekly limit**: 15 (hard cap, cannot be overridden)
- **Daily limit**: 3 (soft cap, distributes load evenly)
- **Submission window**: 9 PM CST onward (configurable)
- **Inter-submission delay**: 3-10 minutes (randomized to look human)
- Tracks all submissions in the log — safe across multiple sessions

### Industry Relevance Validation

Before submitting to any directory, the tool validates relevance:

1. **Quick check**: Known major directories auto-pass. Obvious mismatches auto-fail.
2. **Deep check**: Claude analyzes the page for automotive/business categories.
3. **Category verification**: Checks dropdown menus for auto-related options.

Irrelevant directories (food-only, legal-only, wrong country, etc.) are automatically skipped. This ensures backlinks hold and don't get devalued by Google.

## Setup

```bash
# Clone/download the repo
cd smart-submitter

# One-command setup: installs deps, creates dirs, installs cron
chmod +x setup.sh && ./setup.sh
```

The setup script:
1. Installs npm dependencies
2. Creates `logs/` and `screenshots/` directories
3. Detects your server timezone and calculates the correct cron time for 9 PM CST
4. Installs the cron job automatically
5. Verifies all modules work

### Cron Schedule (Automatic Nightly Runs)

The cron job runs `src/cron-runner.js` every night at 9 PM CST. It:
- Checks daily/weekly caps (exits immediately if limits are hit)
- Gets this week's batch from the 30-week planner
- Runs fully headless (no visible browser)
- Auto-skips any directory requiring CAPTCHA or login (logs it for manual retry)
- Fills and submits everything it can
- Logs to `logs/YYYY-MM-DD.log` with full detail
- Exits cleanly

To install cron manually (if setup.sh didn't work):
```bash
# 3 AM UTC = 9 PM CST (adjust for your server's timezone)
crontab -e
0 3 * * * cd /path/to/smart-submitter && /usr/bin/node src/cron-runner.js >> logs/cron.log 2>&1
```

### Required Config Changes in `config.json`

1. **`settings.anthropic_api_key`** — Your Anthropic API key
2. **`business.email`** — The business email for listings
3. **`business.owner_last`** — Owner's last name

Update any other business fields as needed.

## Usage

### Run submissions (default)
```bash
node src/index.js
```
Opens a browser, processes each directory with AI analysis, fills forms, submits.

### Process specific range
```bash
# Start at directory #10, do 15 submissions
node src/index.js --start 10 --count 15
```

### Dry run (analyze but don't submit)
```bash
node src/index.js --dry-run
```
Shows what Claude would fill in each form without actually submitting.

### List directory status
```bash
node src/index.js --mode list
```

### View the 30-week campaign plan
```bash
node src/index.js --mode plan
```
Shows the full campaign with progress bars per week, current phase, and completion %.

### Check schedule status
```bash
node src/index.js --mode status
```
Shows weekly/daily counts, time window, and remaining allowance.

### Manual run (interactive, with visible browser)
```bash
node src/index.js --force
```
Opens a visible browser. You handle CAPTCHAs when they pop up. Overrides the 9 PM window but weekly/daily caps still enforced.

### Skip relevance checking
```bash
node src/index.js --skip-relevance
```
Submit to all directories without checking industry match.

### Different client config
```bash
node src/index.js --config config-otherclient.json
```

### Headless mode (no visible browser)
Set `"headless": true` in config.json settings.

## CLI Options

| Flag | Default | Description |
|------|---------|-------------|
| `--config` | `config.json` | Client config file |
| `--directories` | `directories.json` | Directory list |
| `--log` | `submission-log.json` | Submission log file |
| `--mode` | `run` | `run`, `list`, or `status` |
| `--start` | `0` | Start index in directory list |
| `--count` | `9999` | Max directories this session |
| `--dry-run` | — | Analyze without submitting |
| `--force` | — | Override 9 PM CST window (caps still enforced) |
| `--skip-relevance` | — | Skip industry relevance checks |

## What Happens on Each Directory

1. **Load** — Puppeteer navigates to the submission URL
2. **Analyze** — `page-analyzer.js` extracts all forms, fields, labels, buttons, CAPTCHAs
3. **AI Plan** — Sends the snapshot to Claude, which returns a fill plan:
   - What value goes in each field
   - Which dropdown options to select
   - Which checkboxes to check
   - What button to click
   - Whether to skip (CAPTCHA, login wall, etc.)
4. **Fill** — `form-filler.js` executes the plan with human-like typing
5. **Submit** — Clicks the submit button
6. **Verify** — Claude analyzes the result page to confirm success
7. **Log** — Records everything to `submission-log.json`
8. **Multi-step** — If Claude detects a multi-step form, it loops back to step 2

### CAPTCHA & Login Handling

When Claude detects a CAPTCHA or login requirement:
- The browser stays open
- You get a prompt to handle it manually
- Press Enter after you've dealt with it, or 's' to skip
- The tool continues automatically after your input

## Architecture

```
src/
├── index.js              # Interactive CLI orchestrator
├── cron-runner.js        # Headless nightly runner (called by cron)
├── ai-brain.js           # Claude API integration — the intelligence layer
├── page-analyzer.js      # DOM analysis — extracts form structure in-browser
├── form-filler.js        # Puppeteer actions — types, selects, clicks
├── relevance-checker.js  # Industry relevance validation
├── scheduler.js          # Velocity control (15/wk, 3/day, 9PM CST)
├── weekly-planner.js     # 30-week strategic sequencing
└── logger.js             # Persistent submission log

setup.sh                  # One-command install + cron setup
config.json               # Client business data + settings
directories.json          # 399 target directories (sorted by DR)
submission-log.json       # Auto-generated submission tracking
logs/                     # Daily run logs (YYYY-MM-DD.log)
screenshots/              # Auto-generated on errors (if enabled)
```

## Multi-Client Usage

Copy the config for each client:
```bash
cp config.json config-newclient.json
# Edit business details
node src/index.js --config config-newclient.json --log newclient-log.json
```

The directory list stays the same — only the config and log change per client.

## Adding More Directories

Edit `directories.json`:
```json
{ "name": "Directory Name", "url": "https://example.com/add-business", "dr": 10 }
```

The tool auto-skips any directory already in the submission log.

## Cost

- **Puppeteer**: Free
- **Claude API**: ~$0.003–0.01 per directory (2 API calls per site: analyze + verify)
- **50 directories**: ~$0.15–0.50 total API cost

## Tips

- Run 20–30 per session to keep API costs low
- Use `--dry-run` first to verify Claude's analysis looks right
- Check `submission-log.json` for any failed entries to retry
- The `screenshots/` folder captures errors for debugging
- Some directories have email verification — check the inbox afterward

---

Built by StephensCode LLC | kyle@stephenscode.dev | (936) 323-4527
