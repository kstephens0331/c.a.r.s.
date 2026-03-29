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
  /**
   * Analyze a page using both HTML structure AND a screenshot
   * @param {object} snapshot - From page-analyzer.js
   * @param {object} business - Business data from config
   * @param {Buffer|null} screenshotBuffer - Optional screenshot for vision analysis
   * @returns {object} Action plan
   */
  async analyzeAndPlan(snapshot, business, screenshotBuffer = null) {
    const systemPrompt = `You are a form-filling automation assistant. You analyze web page form structures and determine exactly how to fill them with the provided business data.

You MUST respond with ONLY valid JSON. No markdown, no backticks, no explanation.

DUAL EMAIL SYSTEM:
- The business has TWO emails. Use "registration_email" for REGISTRATION/ACCOUNT CREATION forms. Use "email" for LISTING/PROFILE forms that display the business publicly.
- For password fields during registration, use the "registration_password" from the business data.

RULES:
- Map business data to form fields based on labels, names, placeholders, and context
- For standard <select> dropdown fields with pre-defined options, use action "select" and pick the BEST matching option
- For DYNAMIC/AUTOCOMPLETE/SEARCH dropdowns (text input that triggers a dropdown of suggestions, typeahead fields, combo boxes), use action "type_select" — this types the search term and clicks the best matching dropdown result. You can tell it's dynamic if: the field is an <input> not a <select>, the field has is_dynamic_dropdown: true, or the field has autocomplete/typeahead/combobox attributes, or the screenshot shows a search-style dropdown
- IMPORTANT: If a field's label says "Category", "Industry", "Business Type", or "Primary Category" and it is an <input> (not a <select>), it is ALMOST CERTAINLY a dynamic search dropdown. Use action "type_select" with value "Auto Body Shop" for these fields.
- For standard <select> category fields, look at the available options and pick the BEST match. Try "Auto Body Shop", "Auto Body Repair", "Auto Repair", "Automotive", "Collision Repair", "Car Repair" in that order of preference. If none of those exist, try "Other Services", "General Services", or the broadest matching category available.
- For state dropdowns, match by abbreviation (TX) or full name (Texas)
- For country dropdowns, match "United States", "US", "USA" etc.
- For agree/terms checkboxes, check them
- NEVER fill a field with data that doesn't match what the field is asking for
- If a field asks for something we don't have (like a tax ID), leave it empty
- Detect if this is a REGISTRATION form vs a LISTING form and use the appropriate email
- If the page has a login form (not registration), set page_type to "login_required" and fill the login fields using registration_email and registration_password. If login fails (error messages visible), look for a "Sign Up" or "Register" link and include it in click_after_fill.
- If the page has a registration/sign-up form, set page_type to "registration" and fill it using registration_email and registration_password
- If the page has BOTH login and registration forms visible, prefer "registration" and fill the registration form
- CAPTCHAs are handled automatically — do NOT set needs_human for CAPTCHAs
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
      "action": "type|select|type_select|check|uncheck",
      "value": "the value to enter or select",
      "field_name": "what this field is for (for logging)",
      "dropdown_wait_ms": 1500
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
      // Build message content — include screenshot if available (vision)
      const content = [];
      if (screenshotBuffer) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: typeof screenshotBuffer === 'string' ? screenshotBuffer : screenshotBuffer.toString('base64'),
          },
        });
        content.push({
          type: 'text',
          text: 'Above is a screenshot of the current page. Use this to identify any validation errors, modals, CAPTCHAs, or visual issues that the HTML structure might miss.\n\n' + userPrompt,
        });
      } else {
        content.push({ type: 'text', text: userPrompt });
      }

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          { role: 'user', content }
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
   * Diagnose why we're stuck on a page and get recovery instructions.
   * Uses screenshot + page state to figure out what's wrong.
   * @param {Buffer} screenshotBuffer - Screenshot of the stuck page
   * @param {object} snapshot - Page snapshot
   * @param {object} business - Business data
   * @returns {object} Recovery actions
   */
  async diagnoseStuck(screenshotBuffer, snapshot, business) {
    const prompt = `You are debugging a stuck form submission. The automation filled some fields but the form won't advance.

BUSINESS: ${business.name} - ${business.categories[0]}
PAGE URL: ${snapshot.url}
PAGE TITLE: ${snapshot.title}
ALERTS/ERRORS: ${JSON.stringify(snapshot.alerts)}

FORM FIELDS (current state):
${JSON.stringify(snapshot.forms.flatMap(f => f.fields.map(field => ({
  label: field.label, name: field.name, type: field.type, value: field.value,
  required: field.required, is_dynamic_dropdown: field.is_dynamic_dropdown,
  css_selector: field.css_selector,
  options: field.options ? field.options.slice(0, 15).map(o => o.text) : undefined,
}))), null, 2)}

BUTTONS: ${JSON.stringify(snapshot.buttons.map(b => ({ text: b.text, selector: b.css_selector })))}

Look at the screenshot and form state. What is blocking submission? Common issues:
1. Required field not filled (especially category/industry dropdowns)
2. Validation error on a specific field
3. CAPTCHA not solved
4. Wrong button being clicked

Respond with ONLY this JSON:
{
  "diagnosis": "brief description of the problem",
  "recovery_actions": [
    {
      "type": "fill|select|type_select|click|js_eval",
      "css_selector": "selector to target",
      "value": "value to use",
      "description": "what this does"
    }
  ],
  "submit_button_selector": "the correct submit button CSS selector, or null",
  "can_recover": true
}`;

    try {
      const content = [];
      if (screenshotBuffer) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: typeof screenshotBuffer === 'string' ? screenshotBuffer : screenshotBuffer.toString('base64'),
          },
        });
      }
      content.push({ type: 'text', text: prompt });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: 'user', content }],
        system: 'Respond with ONLY valid JSON. No markdown, no explanation.',
      });

      const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      return { diagnosis: `AI diagnosis failed: ${err.message}`, recovery_actions: [], can_recover: false };
    }
  }

  /**
   * Analyze a post-submission page to determine result
   * @param {object} snapshot - Page snapshot after form submission
   * @returns {object} Result assessment
   */
  async assessResult(snapshot, screenshotBuffer = null) {
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
      const resultContent = [];
      if (screenshotBuffer) {
        resultContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: typeof screenshotBuffer === 'string' ? screenshotBuffer : screenshotBuffer.toString('base64'),
          },
        });
        resultContent.push({ type: 'text', text: 'Above is a screenshot of the page after submission. Check for success messages, error messages, modals, redirects, etc.\n\n' + prompt });
      } else {
        resultContent.push({ type: 'text', text: prompt });
      }

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: resultContent }],
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
