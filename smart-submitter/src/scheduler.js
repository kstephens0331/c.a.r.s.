/**
 * scheduler.js
 * 
 * Enforces Google-safe submission velocity:
 * - Hard cap: 15 submissions per week (Sun-Sat)
 * - Daily distribution: ~2/day weekdays, ~2-3 on weekends
 * - Start time: 9:00 PM CST (configurable)
 * - Tracks per-day and per-week counts via the submission log
 * - Prevents over-submission even across multiple sessions
 */

const fs = require('fs');

// CST = UTC-6 (standard), CDT = UTC-5 (daylight saving)
// We'll detect based on date, but default to CST offset
const CST_OFFSET_HOURS = -6;

class Scheduler {
  constructor(log, options = {}) {
    this.log = log;
    this.weeklyLimit = options.weekly_limit || 15;
    this.dailyLimit = options.daily_limit || 3; // soft cap per day
    this.startHourCST = options.start_hour_cst || 21; // 9 PM CST
    this.minDelayBetweenMs = options.min_delay_between_ms || 180000; // 3 min between submissions
    this.maxDelayBetweenMs = options.max_delay_between_ms || 600000; // 10 min max
  }

  /**
   * Get current time in CST
   */
  getNowCST() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cstOffset = this._isCDT(now) ? -5 : -6;
    return new Date(utc + (cstOffset * 3600000));
  }

  /**
   * Rough CDT detection (March 2nd Sun to Nov 1st Sun)
   */
  _isCDT(date) {
    const month = date.getUTCMonth(); // 0-indexed
    if (month > 2 && month < 10) return true; // Apr-Oct
    if (month === 2) { // March - after 2nd Sunday
      const day = date.getUTCDate();
      const dow = date.getUTCDay();
      const secondSunday = 14 - ((new Date(date.getUTCFullYear(), 2, 1).getUTCDay() + 6) % 7);
      return day >= secondSunday;
    }
    if (month === 10) { // November - before 1st Sunday
      const day = date.getUTCDate();
      const firstSunday = 7 - ((new Date(date.getUTCFullYear(), 10, 1).getUTCDay() + 6) % 7);
      return day < firstSunday;
    }
    return false;
  }

  /**
   * Get the start of the current week (Sunday) in CST
   */
  _getWeekStartCST(cstNow) {
    const d = new Date(cstNow);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Back to Sunday
    return d;
  }

  /**
   * Get today's date string in CST (YYYY-MM-DD)
   */
  _getTodayCST(cstNow) {
    return cstNow.toISOString().split('T')[0];
  }

  /**
   * Count submissions for a given date range from the log
   */
  _countSubmissions(afterDate, beforeDate) {
    const entries = this.log.data.entries || [];
    let count = 0;
    for (const entry of entries) {
      if (entry.status !== 'submitted' && entry.status !== 'pending_verification') continue;
      const ts = new Date(entry.timestamp);
      if (ts >= afterDate && ts < beforeDate) count++;
    }
    return count;
  }

  /**
   * Get this week's submission count
   */
  getWeeklyCount() {
    const cstNow = this.getNowCST();
    const weekStart = this._getWeekStartCST(cstNow);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return this._countSubmissions(weekStart, weekEnd);
  }

  /**
   * Get today's submission count
   */
  getDailyCount() {
    const cstNow = this.getNowCST();
    const today = this._getTodayCST(cstNow);
    const dayStart = new Date(today + 'T00:00:00');
    const dayEnd = new Date(today + 'T23:59:59');
    return this._countSubmissions(dayStart, dayEnd);
  }

  /**
   * Calculate how many submissions are allowed right now
   */
  getAllowance() {
    const weeklyUsed = this.getWeeklyCount();
    const dailyUsed = this.getDailyCount();
    const weeklyRemaining = Math.max(0, this.weeklyLimit - weeklyUsed);
    const dailyRemaining = Math.max(0, this.dailyLimit - dailyUsed);

    // The actual allowance is the minimum of daily and weekly remaining
    const allowed = Math.min(weeklyRemaining, dailyRemaining);

    return {
      allowed,
      weeklyUsed,
      weeklyRemaining,
      weeklyLimit: this.weeklyLimit,
      dailyUsed,
      dailyRemaining,
      dailyLimit: this.dailyLimit,
    };
  }

  /**
   * Check if we're within the allowed submission window (after 9 PM CST)
   */
  isInWindow() {
    const cstNow = this.getNowCST();
    const hour = cstNow.getHours();
    return hour >= this.startHourCST || hour < 2; // 9 PM to 2 AM CST window
  }

  /**
   * Get a human-readable wait time until the window opens
   */
  getTimeUntilWindow() {
    const cstNow = this.getNowCST();
    const hour = cstNow.getHours();
    const minute = cstNow.getMinutes();

    if (this.isInWindow()) return 0;

    // Calculate minutes until 9 PM
    const currentMinutes = hour * 60 + minute;
    const targetMinutes = this.startHourCST * 60;
    let waitMinutes = targetMinutes - currentMinutes;
    if (waitMinutes < 0) waitMinutes += 24 * 60;

    return waitMinutes;
  }

  /**
   * Get a randomized delay between submissions (looks human)
   */
  getSubmissionDelay() {
    const min = this.minDelayBetweenMs;
    const max = this.maxDelayBetweenMs;
    return Math.floor(min + Math.random() * (max - min));
  }

  /**
   * Get recommended daily targets for the rest of the week
   * Distributes remaining weekly allowance across remaining days
   */
  getWeeklyPlan() {
    const cstNow = this.getNowCST();
    const dayOfWeek = cstNow.getDay(); // 0=Sun, 6=Sat
    const daysLeft = 7 - dayOfWeek; // Including today
    const weeklyRemaining = this.weeklyLimit - this.getWeeklyCount();

    if (weeklyRemaining <= 0 || daysLeft <= 0) {
      return { message: 'Weekly limit reached. Resume next Sunday.', daily: [] };
    }

    // Distribute evenly with slight randomization
    const basePerDay = Math.floor(weeklyRemaining / daysLeft);
    const extra = weeklyRemaining % daysLeft;
    const plan = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < daysLeft; i++) {
      const dayIdx = (dayOfWeek + i) % 7;
      const target = basePerDay + (i < extra ? 1 : 0);
      plan.push({
        day: dayNames[dayIdx],
        target: Math.min(target, this.dailyLimit),
        isToday: i === 0,
      });
    }

    return {
      message: `${weeklyRemaining} submissions remaining this week across ${daysLeft} days`,
      daily: plan,
    };
  }

  /**
   * Full pre-flight check before running a session
   * Returns { canRun, reason, allowance, plan }
   */
  preflight() {
    const allowance = this.getAllowance();
    const inWindow = this.isInWindow();
    const plan = this.getWeeklyPlan();

    if (allowance.weeklyRemaining <= 0) {
      return {
        canRun: false,
        reason: `Weekly limit reached (${this.weeklyLimit}/${this.weeklyLimit}). Resume next Sunday.`,
        allowance,
        plan,
      };
    }

    if (allowance.dailyRemaining <= 0) {
      return {
        canRun: false,
        reason: `Daily limit reached (${this.dailyLimit}/${this.dailyLimit}). Resume tomorrow at 9 PM CST.`,
        allowance,
        plan,
      };
    }

    if (!inWindow) {
      const waitMin = this.getTimeUntilWindow();
      const hours = Math.floor(waitMin / 60);
      const mins = waitMin % 60;
      return {
        canRun: false,
        reason: `Outside submission window. Starts at 9 PM CST (${hours}h ${mins}m from now). Use --force to override.`,
        allowance,
        plan,
      };
    }

    return {
      canRun: true,
      reason: `Clear to submit. ${allowance.allowed} submissions available today.`,
      allowance,
      plan,
    };
  }

  /**
   * Print a nice status dashboard
   */
  printStatus() {
    const cstNow = this.getNowCST();
    const allowance = this.getAllowance();
    const inWindow = this.isInWindow();
    const plan = this.getWeeklyPlan();

    console.log(`\n📅 SCHEDULER STATUS`);
    console.log(`   🕐 CST Time: ${cstNow.toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
    console.log(`   📊 This week: ${allowance.weeklyUsed}/${allowance.weeklyLimit} used`);
    console.log(`   📊 Today: ${allowance.dailyUsed}/${allowance.dailyLimit} used`);
    console.log(`   ✅ Available now: ${allowance.allowed}`);
    console.log(`   🕘 Window (9PM CST): ${inWindow ? '✅ OPEN' : '❌ CLOSED'}`);

    if (!inWindow) {
      const waitMin = this.getTimeUntilWindow();
      console.log(`   ⏳ Opens in: ${Math.floor(waitMin / 60)}h ${waitMin % 60}m`);
    }

    if (plan.daily.length > 0) {
      console.log(`\n   📋 Weekly Plan:`);
      plan.daily.forEach(d => {
        const marker = d.isToday ? ' ← TODAY' : '';
        console.log(`      ${d.day}: ${d.target} submissions${marker}`);
      });
    }

    console.log('');
  }
}

module.exports = { Scheduler };
