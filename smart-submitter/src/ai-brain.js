/**
 * ai-brain.js
 * 
 * The intelligence layer. Takes a page snapshot and business data,
 * sends it to Claude, and gets back structured fill/action instructions.
 * 
 * Claude sees the form fields, labels, page context, and decides:
 * - What value goes in each field
 * - Which dropdowns to select
 * - Which checkboxes to check
 * - Whether to skip the page (login wall, CAPTCHA, etc.)
 * - Which button to click to proceed
 * - Whether this is a multi-step form needing continued interaction
 */

const Anthropic = require('@anthropic-ai/sdk');

class AIBrain {
  constructor(apiKey, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  /**
   * Analyze a page snapshot and return fill instructions
   * @param {object} snapshot - From page-analyzer.js
   * @param {object} business - Business data from config
   * @returns {object} Action plan with field fills, clicks, and status
   */
  async analyzeAndPlan(snapshot, business) {
    const systemPrompt = `You are a form-filling automation assistant. You analyze web page form structures and determine exactly how to fill them with the provided business data.

You MUST respond with ONLY valid JSON. No markdown, no backticks, no explanation.

RULES:
- Map business data to form fields based on labels, names, placeholders, and context
- For select/dropdown fields, pick the BEST matching option from the available choices
- For category fields, pick the most relevant category like "Auto Body Shop" or "Automotive"
- For state dropdowns, match by abbreviation (TX) or full name (Texas)
- For country dropdowns, match "United States", "US", "USA" etc.
- For password fields during registration, generate a random secure password
- For agree/terms checkboxes, check them
- NEVER fill a field with data that doesn't match what the field is asking for
- If a field asks for something we don't have (like a tax ID), leave it empty
- Detect if this is a registration form vs a direct listing form and adapt
- If the page has a CAPTCHA, set needs_human to true
- If the page requires login, set needs_human to true
- Be smart about multi-step forms - only fill what's visible now`;

    const userPrompt = `BUSINESS DATA:
${JSON.stringify(business, null, 2)}

PAGE SNAPSHOT:
URL: ${snapshot.url}
Title: ${snapshot.title}
Page Context: ${snapshot.page_context}
Is Registration: ${snapshot.is_registration}
Is Listing Form: ${snapshot.is_listing_form}
Requires Login: ${snapshot.requires_login}
CAPTCHA Detected: ${snapshot.captcha_detected} (${snapshot.captcha_type || 'none'})
Step Indicators: ${JSON.stringify(snapshot.step_indicators)}
Alerts: ${JSON.stringify(snapshot.alerts)}

FORMS:
${JSON.stringify(snapshot.forms, null, 2)}

BUTTONS:
${JSON.stringify(snapshot.buttons, null, 2)}

Respond with this exact JSON structure:
{
  "assessment": {
    "page_type": "registration|listing_form|login_required|blocked|error|other",
    "confidence": 0.0-1.0,
    "description": "brief description of what this page is",
    "needs_human": false,
    "reason_needs_human": "",
    "should_skip": false,
    "skip_reason": ""
  },
  "fills": [
    {
      "css_selector": "the exact css_selector from the field",
      "action": "type|select|check|uncheck",
      "value": "the value to enter or select",
      "field_name": "what this field is for (for logging)"
    }
  ],
  "click_after_fill": {
    "css_selector": "button to click after filling, or null",
    "description": "what this button does"
  },
  "expect_next": "success_page|next_step|email_verification|captcha|unknown",
  "notes": "any important observations about this form"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt,
      });

      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');

      // Parse JSON - strip any markdown fences if present
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      console.error(`    ❌ AI analysis failed: ${err.message}`);
      return {
        assessment: {
          page_type: 'error',
          confidence: 0,
          description: `AI error: ${err.message}`,
          needs_human: true,
          reason_needs_human: 'AI analysis failed',
          should_skip: false,
          skip_reason: '',
        },
        fills: [],
        click_after_fill: null,
        expect_next: 'unknown',
        notes: err.message,
      };
    }
  }

  /**
   * Analyze a post-submission page to determine result
   * @param {object} snapshot - Page snapshot after form submission
   * @returns {object} Result assessment
   */
  async assessResult(snapshot) {
    const prompt = `You are checking if a directory submission was successful.

PAGE AFTER SUBMISSION:
URL: ${snapshot.url}
Title: ${snapshot.title}
Context: ${snapshot.page_context}
Alerts: ${JSON.stringify(snapshot.alerts)}

Respond with ONLY this JSON:
{
  "status": "success|pending_verification|error|needs_more_steps|unknown",
  "message": "brief description of the result",
  "has_errors": false,
  "error_fields": [],
  "next_action": "none|fill_more|click_verify|manual_needed"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        system: 'Respond with ONLY valid JSON. No markdown, no explanation.',
      });

      const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      return { status: 'unknown', message: err.message, has_errors: false, error_fields: [], next_action: 'manual_needed' };
    }
  }
}

module.exports = { AIBrain };
