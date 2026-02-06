/**
 * weekly-planner.js
 * 
 * Implements the 30-week strategic sequencing:
 * 
 *   Phase 1 (Weeks 1-4):   High DR (70+) + niche directories → establish authority
 *   Phase 2 (Weeks 5-12):  Mid DR (40-69) → build momentum
 *   Phase 3 (Weeks 13-20): Low DR (20-39) → expand citation footprint
 *   Phase 4 (Weeks 21-28): Micro DR (0-19) → fill natural profile
 *   Phase 5 (Weeks 29-30): Retries, new directories, gap filling
 * 
 * The planner knows which week we're in (based on log start date),
 * and returns the correct batch of directories for this session.
 */

const fs = require('fs');

class WeeklyPlanner {
  constructor(directories, log, options = {}) {
    this.allDirs = directories;
    this.log = log;
    this.startDate = options.start_date ? new Date(options.start_date) : this._getOrSetStartDate();
    this.perWeek = options.per_week || 15;
  }

  /**
   * Get or initialize the campaign start date from the log
   */
  _getOrSetStartDate() {
    const logData = this.log.data;

    // If we already have a campaign start, use it
    if (logData.campaign_start) {
      return new Date(logData.campaign_start);
    }

    // First run — set campaign start to this Sunday
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    sunday.setHours(0, 0, 0, 0);

    logData.campaign_start = sunday.toISOString();
    this.log.save();

    return sunday;
  }

  /**
   * Calculate the current campaign week (1-indexed)
   */
  getCurrentWeek() {
    const now = new Date();
    const diffMs = now - this.startDate;
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, diffWeeks + 1); // 1-indexed
  }

  /**
   * Get the current phase based on week number
   */
  getPhase(week) {
    if (week <= 4) return { num: 1, name: "Foundation", drRange: "70+", color: "green" };
    if (week <= 12) return { num: 2, name: "Authority Building", drRange: "40-69", color: "blue" };
    if (week <= 20) return { num: 3, name: "Citation Spread", drRange: "20-39", color: "orange" };
    if (week <= 28) return { num: 4, name: "Deep Diversification", drRange: "0-19", color: "yellow" };
    return { num: 5, name: "Retries & New", drRange: "all", color: "gray" };
  }

  /**
   * Build the full 30-week plan (sorted directory sequence)
   */
  buildFullPlan() {
    const dirs = [...this.allDirs];

    // Sort into tiers
    const niche = dirs.filter(d => (d.tier || '').startsWith('niche-'));
    const high = dirs.filter(d => d.dr >= 70 && !(d.tier || '').startsWith('niche-'));
    const mid = dirs.filter(d => d.dr >= 40 && d.dr < 70 && !(d.tier || '').startsWith('niche-'));
    const low = dirs.filter(d => d.dr >= 20 && d.dr < 40 && !(d.tier || '').startsWith('niche-'));
    const micro = dirs.filter(d => d.dr < 20 && !(d.tier || '').startsWith('niche-'));

    // Sort each tier by DR descending
    [niche, high, mid, low, micro].forEach(arr => arr.sort((a, b) => b.dr - a.dr));

    // Strategic sequence: niche first (authority signals), then by DR tiers
    const sequence = [...niche, ...high, ...mid, ...low, ...micro];

    // Split into weeks
    const weeks = [];
    for (let i = 0; i < 30; i++) {
      const start = i * this.perWeek;
      const batch = sequence.slice(start, start + this.perWeek);
      weeks.push({
        week: i + 1,
        phase: this.getPhase(i + 1),
        dirs: batch,
      });
    }

    return weeks;
  }

  /**
   * Get THIS WEEK's directory batch (accounting for already-completed ones)
   */
  getThisWeeksBatch() {
    const week = this.getCurrentWeek();
    const plan = this.buildFullPlan();

    if (week > 30) {
      return {
        week,
        phase: this.getPhase(week),
        dirs: [],
        message: "30-week campaign complete! Add new directories or restart.",
        completed: true,
      };
    }

    const weekPlan = plan[week - 1];
    const completedUrls = this.log.getCompletedUrls();

    // Filter out already-completed directories
    const remaining = weekPlan.dirs.filter(d => !completedUrls.has(d.url));

    return {
      week,
      phase: weekPlan.phase,
      dirs: remaining,
      total_this_week: weekPlan.dirs.length,
      already_done: weekPlan.dirs.length - remaining.length,
      message: remaining.length > 0
        ? `Week ${week}: ${remaining.length} directories remaining`
        : `Week ${week}: All directories submitted! Ahead of schedule.`,
      completed: remaining.length === 0,
    };
  }

  /**
   * Print a visual campaign overview
   */
  printOverview() {
    const week = this.getCurrentWeek();
    const phase = this.getPhase(week);
    const plan = this.buildFullPlan();
    const completedUrls = this.log.getCompletedUrls();

    console.log(`\n🗓️  30-WEEK CAMPAIGN OVERVIEW`);
    console.log(`   Started: ${this.startDate.toLocaleDateString()}`);
    console.log(`   Current: Week ${week} — Phase ${phase.num}: ${phase.name}`);
    console.log(`   Target DR Range: ${phase.drRange}\n`);

    // Show all weeks with progress
    let totalScheduled = 0;
    let totalDone = 0;
    let currentPhase = '';

    plan.forEach(w => {
      const phaseName = `Phase ${w.phase.num}: ${w.phase.name}`;
      if (phaseName !== currentPhase) {
        currentPhase = phaseName;
        console.log(`\n   ${currentPhase}`);
        console.log(`   ${'─'.repeat(55)}`);
      }

      const done = w.dirs.filter(d => completedUrls.has(d.url)).length;
      const total = w.dirs.length;
      totalScheduled += total;
      totalDone += done;

      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const bar = total > 0
        ? '█'.repeat(Math.round(progress / 10)) + '░'.repeat(10 - Math.round(progress / 10))
        : '░'.repeat(10);

      const marker = w.week === week ? ' ← YOU ARE HERE' : '';
      const avgDR = total > 0 ? Math.round(w.dirs.reduce((s, d) => s + d.dr, 0) / total) : 0;

      console.log(`   Week ${String(w.week).padStart(2)} [${bar}] ${String(done).padStart(2)}/${String(total).padStart(2)} (avg DR ${String(avgDR).padStart(2)})${marker}`);
    });

    console.log(`\n   📊 Overall: ${totalDone}/${totalScheduled} (${Math.round(totalDone / Math.max(1, totalScheduled) * 100)}%)`);
    console.log(`   📅 Campaign ends: Week 30 (~${new Date(this.startDate.getTime() + 30 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})\n`);
  }
}

module.exports = { WeeklyPlanner };
