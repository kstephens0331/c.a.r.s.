/**
 * relevance-checker.js
 * 
 * Validates that a directory is relevant to the business BEFORE submitting.
 * A backlink from an irrelevant directory won't hold — Google may ignore or 
 * even penalize it. This module:
 * 
 * 1. Loads the page and checks for category/industry signals
 * 2. Sends page context to Claude to assess relevance
 * 3. Returns a relevance score and recommendation
 * 
 * Directories pass if they are:
 * - General business directories (accept all industries)
 * - Automotive/repair specific directories
 * - Local/regional directories covering the business area
 * - Veteran-specific directories (for veteran-owned businesses)
 * 
 * Directories FAIL if they are:
 * - Niche directories for unrelated industries (food, tech-only, medical, legal)
 * - Country-specific directories outside the US
 * - Directories that clearly don't accept auto body shops
 */

class RelevanceChecker {
  constructor(brain, business) {
    this.brain = brain;
    this.business = business;
    
    // Keywords that indicate relevance for an auto body shop
    this.positiveSignals = [
      // General business
      'business directory', 'business listing', 'add your business', 'local business',
      'submit your business', 'free listing', 'company directory', 'add company',
      'yellow pages', 'business profile', 'small business',
      // Automotive specific
      'auto', 'automotive', 'car', 'vehicle', 'collision', 'body shop', 'repair',
      'mechanic', 'garage', 'paint', 'dent', 'motor',
      // Local/regional
      'local directory', 'city directory', 'us business', 'usa directory',
      'texas', 'houston', 'spring tx',
      // Veteran
      'veteran', 'military', 'service-disabled', 'vet owned',
      // General categories
      'all categories', 'all industries', 'services', 'home services',
    ];

    // Keywords that indicate the directory is NOT relevant
    this.negativeSignals = [
      // Wrong industry niches
      'restaurant only', 'food directory', 'recipe', 'cooking',
      'medical directory', 'doctor directory', 'healthcare only',
      'lawyer directory', 'legal directory', 'attorney',
      'real estate only', 'property listing',
      'hotel directory', 'travel only', 'tourism directory',
      'tech startup', 'saas directory', 'software only', 'app directory',
      'fashion only', 'clothing directory',
      'education directory', 'school listing',
      'wedding directory', 'event planning only',
      // Wrong geography
      'india only', 'uk only', 'australia only', 'canada only',
      'europe only', 'asia directory',
      // Spam signals
      'buy backlinks', 'guaranteed rankings', 'link farm',
      'adult', 'gambling', 'casino',
    ];
  }

  /**
   * Quick pre-check based on directory metadata (no page load needed)
   * Returns { pass, reason } 
   */
  quickCheck(directory) {
    const name = (directory.name || '').toLowerCase();
    const url = (directory.url || '').toLowerCase();
    const tier = (directory.tier || '').toLowerCase();

    // Auto-pass niche tiers we've pre-vetted
    if (tier.includes('niche-auto') || tier.includes('niche-veteran')) {
      return { pass: true, reason: 'Pre-vetted niche directory', confidence: 0.95 };
    }

    // Auto-pass known major directories
    const majorDirs = [
      'yelp', 'google', 'bing', 'apple', 'facebook', 'linkedin', 'foursquare',
      'mapquest', 'yellowpages', 'manta', 'bbb', 'nextdoor', 'superpages',
      'citysearch', 'thumbtack', 'angi', 'homeadvisor', 'chamberofcommerce',
      'trustpilot', 'crunchbase', 'indeed', 'glassdoor', 'hotfrog',
      'brownbook', 'tupalo', 'merchantcircle', 'alignable',
    ];
    for (const major of majorDirs) {
      if (name.includes(major) || url.includes(major)) {
        return { pass: true, reason: 'Major general directory', confidence: 0.99 };
      }
    }

    // Check for obvious negative signals in name/URL
    for (const neg of this.negativeSignals) {
      if (name.includes(neg) || url.includes(neg)) {
        return { pass: false, reason: `Negative signal: "${neg}"`, confidence: 0.8 };
      }
    }

    // Generic directories without clear signals need deeper check
    return { pass: null, reason: 'Needs page-level check', confidence: 0 };
  }

  /**
   * Deep relevance check - loads and analyzes the actual page
   * Uses Claude to assess whether this directory accepts auto body shops
   * 
   * @param {object} snapshot - Page snapshot from page-analyzer.js
   * @param {object} directory - Directory metadata
   * @returns {object} { relevant, score, reason, categories_found }
   */
  async deepCheck(snapshot, directory) {
    const pageText = (snapshot.page_context || '').toLowerCase();
    const url = (snapshot.url || '').toLowerCase();
    const title = (snapshot.title || '').toLowerCase();
    const allText = `${pageText} ${url} ${title}`;

    // Score based on signal matching
    let positiveScore = 0;
    let negativeScore = 0;
    const posMatches = [];
    const negMatches = [];

    for (const pos of this.positiveSignals) {
      if (allText.includes(pos)) {
        positiveScore++;
        posMatches.push(pos);
      }
    }

    for (const neg of this.negativeSignals) {
      if (allText.includes(neg)) {
        negativeScore++;
        negMatches.push(neg);
      }
    }

    // Check if the page has category dropdowns that include automotive
    let hasAutoCategory = false;
    for (const form of (snapshot.forms || [])) {
      for (const field of (form.fields || [])) {
        if (field.type === 'select' && field.options) {
          const optionTexts = field.options.map(o => o.text.toLowerCase()).join(' ');
          if (optionTexts.match(/auto|car|vehicle|repair|motor|body shop|garage|mechanic/)) {
            hasAutoCategory = true;
            posMatches.push('category dropdown has automotive option');
            positiveScore += 3; // Heavy weight
          }
        }
      }
    }

    // Quick decision if signals are strong
    if (positiveScore >= 3 && negativeScore === 0) {
      return {
        relevant: true,
        score: Math.min(0.95, 0.5 + positiveScore * 0.1),
        reason: `Strong positive signals: ${posMatches.slice(0, 5).join(', ')}`,
        categories_found: hasAutoCategory,
        method: 'signal_match',
      };
    }

    if (negativeScore >= 2 && positiveScore < 2) {
      return {
        relevant: false,
        score: Math.max(0.1, 0.5 - negativeScore * 0.15),
        reason: `Negative signals: ${negMatches.join(', ')}`,
        categories_found: false,
        method: 'signal_match',
      };
    }

    // Ambiguous — ask Claude
    return await this._aiRelevanceCheck(snapshot, directory);
  }

  /**
   * Use Claude to assess relevance when signals are ambiguous
   */
  async _aiRelevanceCheck(snapshot, directory) {
    const prompt = `You are checking if a web directory is relevant for listing an auto body/collision repair shop.

BUSINESS: ${this.business.name} - ${this.business.categories.join(', ')}
LOCATION: ${this.business.city}, ${this.business.state}
BUSINESS TYPE: Veteran-owned collision repair, custom paint, paintless dent repair, spray-in bedliners

DIRECTORY: ${directory.name}
URL: ${snapshot.url}
PAGE TITLE: ${snapshot.title}
PAGE CONTEXT: ${snapshot.page_context}

FORM CATEGORIES/OPTIONS FOUND:
${JSON.stringify(
  (snapshot.forms || []).flatMap(f => 
    (f.fields || []).filter(field => field.type === 'select').map(field => ({
      label: field.label,
      options: (field.options || []).slice(0, 20).map(o => o.text)
    }))
  ), null, 2
)}

QUESTION: Is this directory relevant for listing an auto body shop? A backlink from an irrelevant directory won't hold.

Respond with ONLY this JSON:
{
  "relevant": true/false,
  "score": 0.0-1.0,
  "reason": "brief explanation",
  "industry_match": "general|automotive|local|veteran|unrelated",
  "has_auto_category": true/false
}`;

    try {
      const response = await this.brain.client.messages.create({
        model: this.brain.model,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
        system: 'Respond with ONLY valid JSON. No markdown, no explanation.',
      });

      const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(clean);

      return {
        relevant: result.relevant,
        score: result.score,
        reason: result.reason,
        categories_found: result.has_auto_category,
        industry_match: result.industry_match,
        method: 'ai_check',
      };
    } catch (err) {
      // On AI error, default to allowing if DR > 20 (likely a general directory)
      const fallback = (directory.dr || 0) > 20;
      return {
        relevant: fallback,
        score: 0.5,
        reason: `AI check failed (${err.message}), defaulting to ${fallback ? 'allow' : 'skip'} based on DR`,
        categories_found: false,
        method: 'fallback',
      };
    }
  }
}

module.exports = { RelevanceChecker };
