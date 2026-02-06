#!/bin/bash

# ============================================================
# Smart Submitter — Setup & Cron Installer
# 
# Run this once after cloning the repo:
#   chmod +x setup.sh && ./setup.sh
#
# What it does:
#   1. Installs Node.js dependencies
#   2. Creates required directories
#   3. Installs the cron job (9 PM CST nightly)
#   4. Verifies everything works
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  🤖 Smart Submitter — Setup                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# --- 1. Check Node.js ---
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 18+ first:"
    echo "   https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# --- 2. Install dependencies ---
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# --- 3. Create directories ---
mkdir -p logs screenshots
echo "✅ Created logs/ and screenshots/ directories"

# --- 4. Validate config ---
echo ""
if grep -q "REPLACE" config.json; then
    echo "⚠️  config.json needs updating:"
    grep -n "REPLACE" config.json | while read line; do
        echo "   $line"
    done
    echo ""
    echo "   Edit config.json and replace all REPLACE_WITH_* values before running."
    echo ""
else
    echo "✅ config.json looks configured"
fi

# --- 5. Test modules ---
echo ""
echo "🧪 Testing modules..."
node -e "
const { SubmissionLog } = require('./src/logger');
const { Scheduler } = require('./src/scheduler');
const { WeeklyPlanner } = require('./src/weekly-planner');
const { RelevanceChecker } = require('./src/relevance-checker');
const dirs = require('./directories.json');
const log = new SubmissionLog('./submission-log.json');
const planner = new WeeklyPlanner(dirs, log);
const batch = planner.getThisWeeksBatch();
console.log('   Week ' + batch.week + ' — Phase ' + batch.phase.num + ': ' + batch.phase.name);
console.log('   Directories this week: ' + batch.dirs.length);
console.log('   Total directories: ' + dirs.length);
console.log('   ✅ All modules OK');
"

# --- 6. Detect timezone ---
echo ""

# Determine the correct cron time
# We want 9 PM CST (21:00 CST = UTC-6 = 03:00 UTC next day)
# During CDT (UTC-5), 9 PM CDT = 02:00 UTC next day
# We'll use the system timezone if it's America/Chicago, otherwise UTC offset

SYSTEM_TZ=$(timedatectl show --property=Timezone --value 2>/dev/null || cat /etc/timezone 2>/dev/null || echo "unknown")

if [[ "$SYSTEM_TZ" == "America/Chicago" || "$SYSTEM_TZ" == "US/Central" ]]; then
    CRON_HOUR=21
    CRON_MIN=0
    TZ_NOTE="(System is CST/CDT — cron runs at local 9 PM)"
elif [[ "$SYSTEM_TZ" == "America/New_York" || "$SYSTEM_TZ" == "US/Eastern" ]]; then
    CRON_HOUR=22
    CRON_MIN=0
    TZ_NOTE="(System is EST/EDT — 10 PM ET = 9 PM CT)"
elif [[ "$SYSTEM_TZ" == "America/Denver" || "$SYSTEM_TZ" == "US/Mountain" ]]; then
    CRON_HOUR=20
    CRON_MIN=0
    TZ_NOTE="(System is MST/MDT — 8 PM MT = 9 PM CT)"
elif [[ "$SYSTEM_TZ" == "America/Los_Angeles" || "$SYSTEM_TZ" == "US/Pacific" ]]; then
    CRON_HOUR=19
    CRON_MIN=0
    TZ_NOTE="(System is PST/PDT — 7 PM PT = 9 PM CT)"
elif [[ "$SYSTEM_TZ" == "Etc/UTC" || "$SYSTEM_TZ" == "UTC" ]]; then
    CRON_HOUR=3
    CRON_MIN=0
    TZ_NOTE="(System is UTC — 3 AM UTC = 9 PM CST)"
else
    CRON_HOUR=3
    CRON_MIN=0
    TZ_NOTE="(Defaulting to UTC — 3 AM UTC ≈ 9 PM CST. Adjust if needed.)"
fi

echo "🕐 System timezone: $SYSTEM_TZ"
echo "   Cron will run at: ${CRON_HOUR}:$(printf '%02d' $CRON_MIN) $TZ_NOTE"

# --- 7. Install cron job ---
echo ""
CRON_CMD="${CRON_MIN} ${CRON_HOUR} * * * cd ${SCRIPT_DIR} && /usr/bin/node src/cron-runner.js >> logs/cron.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "smart-submitter\|cron-runner"; then
    echo "⚠️  Existing cron job found. Replacing..."
    crontab -l 2>/dev/null | grep -v "smart-submitter\|cron-runner" | crontab -
fi

# Add the cron job
(crontab -l 2>/dev/null; echo "# Smart Submitter — 9 PM CST nightly backlink submissions"; echo "$CRON_CMD") | crontab -

echo "✅ Cron job installed:"
echo "   $CRON_CMD"

# --- 8. Verify cron ---
echo ""
echo "📋 Current crontab:"
crontab -l 2>/dev/null | grep -A1 "Smart Submitter" || echo "   (no entries found — cron may need to be enabled)"

# --- 9. Summary ---
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                              ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Cron runs nightly at 9 PM CST.                 ║"
echo "║  It auto-selects this week's directories,       ║"
echo "║  checks relevance, fills forms, and logs        ║"
echo "║  everything to logs/YYYY-MM-DD.log              ║"
echo "║                                                  ║"
echo "║  Manual commands:                                ║"
echo "║    node src/index.js --mode plan    # 30-wk plan ║"
echo "║    node src/index.js --mode status  # Scheduler  ║"
echo "║    node src/index.js --mode list    # Dir list   ║"
echo "║    node src/index.js --force        # Run now    ║"
echo "║                                                  ║"
echo "║  Logs:                                           ║"
echo "║    logs/YYYY-MM-DD.log    Daily run details     ║"
echo "║    logs/cron.log          Cron stdout/stderr     ║"
echo "║    submission-log.json    All submissions        ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Remind about config if needed
if grep -q "REPLACE" config.json; then
    echo "⚠️  REMINDER: Update config.json before the first run!"
    echo "   - settings.anthropic_api_key"
    echo "   - business.email"
    echo "   - business.owner_last"
    echo ""
fi
