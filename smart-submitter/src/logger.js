/**
 * logger.js
 * 
 * Persistent submission log. Tracks every directory attempt with
 * timestamps, status, AI analysis notes, and field-level results.
 * Prevents duplicate submissions and enables resume.
 */

const fs = require('fs');
const path = require('path');

class SubmissionLog {
  constructor(logPath = 'submission-log.json') {
    this.logPath = logPath;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.logPath)) {
        return JSON.parse(fs.readFileSync(this.logPath, 'utf8'));
      }
    } catch (err) {
      console.error(`⚠️  Error loading log: ${err.message}. Starting fresh.`);
    }
    return {
      created: new Date().toISOString(),
      client: '',
      stats: { submitted: 0, failed: 0, skipped: 0, pending: 0 },
      entries: [],
    };
  }

  save() {
    // Recalculate stats
    this.data.stats = {
      submitted: this.data.entries.filter(e => e.status === 'submitted').length,
      failed: this.data.entries.filter(e => e.status === 'failed').length,
      skipped: this.data.entries.filter(e => e.status === 'skipped').length,
      pending: this.data.entries.filter(e => e.status === 'pending_verification').length,
    };
    fs.writeFileSync(this.logPath, JSON.stringify(this.data, null, 2));
  }

  setClient(name) {
    this.data.client = name;
  }

  isAlreadyDone(url) {
    return this.data.entries.some(e =>
      e.url === url && (e.status === 'submitted' || e.status === 'pending_verification')
    );
  }

  addEntry(entry) {
    this.data.entries.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    this.save();
  }

  getStats() {
    return this.data.stats;
  }

  getSummary() {
    const s = this.data.stats;
    return `Submitted: ${s.submitted} | Pending: ${s.pending} | Failed: ${s.failed} | Skipped: ${s.skipped} | Total: ${this.data.entries.length}`;
  }

  getCompletedUrls() {
    return new Set(
      this.data.entries
        .filter(e => e.status === 'submitted' || e.status === 'pending_verification')
        .map(e => e.url)
    );
  }
}

module.exports = { SubmissionLog };
