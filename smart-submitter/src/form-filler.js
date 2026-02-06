/**
 * form-filler.js
 * 
 * Executes the AI brain's fill plan on the actual page via Puppeteer.
 * Handles typing, dropdown selection, checkbox toggling, and clicking.
 * Includes human-like delays and error recovery.
 */

class FormFiller {
  constructor(page, settings = {}) {
    this.page = page;
    this.typeDelay = settings.human_like_typing_delay_ms || 30;
  }

  /**
   * Execute a fill plan from the AI brain
   * @param {Array} fills - Array of fill instructions
   * @returns {object} Results of the fill operation
   */
  async executeFills(fills) {
    const results = { filled: 0, failed: 0, skipped: 0, details: [] };

    for (const fill of fills) {
      try {
        const success = await this.executeSingleFill(fill);
        if (success) {
          results.filled++;
          results.details.push({ field: fill.field_name, status: 'ok', selector: fill.css_selector });
        } else {
          results.failed++;
          results.details.push({ field: fill.field_name, status: 'not_found', selector: fill.css_selector });
        }
      } catch (err) {
        results.failed++;
        results.details.push({ field: fill.field_name, status: 'error', error: err.message, selector: fill.css_selector });
      }

      // Small delay between fields to look human
      await this.sleep(100 + Math.random() * 200);
    }

    return results;
  }

  /**
   * Execute a single field fill
   */
  async executeSingleFill(fill) {
    const { css_selector, action, value } = fill;

    // Try to find the element
    const el = await this.findElement(css_selector);
    if (!el) return false;

    switch (action) {
      case 'type':
        return await this.typeInField(el, value, css_selector);

      case 'select':
        return await this.selectOption(el, value, css_selector);

      case 'check':
        return await this.setCheckbox(el, true);

      case 'uncheck':
        return await this.setCheckbox(el, false);

      default:
        console.log(`      ⚠️  Unknown action: ${action}`);
        return false;
    }
  }

  /**
   * Find element with fallback strategies
   */
  async findElement(selector) {
    try {
      // Direct selector
      let el = await this.page.$(selector);
      if (el) return el;

      // If selector has escaped chars, try without escaping
      const unescaped = selector.replace(/\\(.)/g, '$1');
      if (unescaped !== selector) {
        el = await this.page.$(unescaped);
        if (el) return el;
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Type into an input/textarea with human-like behavior
   */
  async typeInField(el, value, selector) {
    try {
      // Scroll into view
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, selector);
      await this.sleep(200);

      // Focus and clear
      await el.click({ clickCount: 3 }); // Select all
      await this.sleep(50);
      await this.page.keyboard.press('Backspace'); // Clear
      await this.sleep(100);

      // Type with human-like delay
      await el.type(value, { delay: this.typeDelay });

      // Trigger events the framework might listen for
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) {
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true }));
          e.dispatchEvent(new Event('blur', { bubbles: true }));
        }
      }, selector);

      return true;
    } catch (err) {
      // Fallback: set value directly
      try {
        await this.page.evaluate((s, v) => {
          const e = document.querySelector(s);
          if (e) {
            e.value = v;
            e.dispatchEvent(new Event('input', { bubbles: true }));
            e.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, selector, value);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Select a dropdown option - tries multiple matching strategies
   */
  async selectOption(el, value, selector) {
    try {
      const selected = await this.page.evaluate((s, v) => {
        const select = document.querySelector(s);
        if (!select || select.tagName.toLowerCase() !== 'select') return false;

        const options = Array.from(select.options);
        const val = v.toLowerCase().trim();

        // Strategy 1: Exact value match
        let match = options.find(o => o.value.toLowerCase() === val);

        // Strategy 2: Exact text match
        if (!match) match = options.find(o => o.text.toLowerCase().trim() === val);

        // Strategy 3: Value contains
        if (!match) match = options.find(o => o.value.toLowerCase().includes(val) || val.includes(o.value.toLowerCase()));

        // Strategy 4: Text contains
        if (!match) match = options.find(o => o.text.toLowerCase().includes(val) || val.includes(o.text.toLowerCase().trim()));

        // Strategy 5: First word match
        if (!match) {
          const firstWord = val.split(/[\s,]+/)[0];
          match = options.find(o => o.text.toLowerCase().startsWith(firstWord));
        }

        if (match) {
          select.value = match.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          select.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      }, selector, value);

      return selected;
    } catch (err) {
      return false;
    }
  }

  /**
   * Set checkbox state
   */
  async setCheckbox(el, checked) {
    try {
      const currentState = await this.page.evaluate(e => e.checked, el);
      if (currentState !== checked) {
        await el.click();
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Click a button by selector
   */
  async clickButton(selector) {
    try {
      // Scroll into view first
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, selector);
      await this.sleep(300);

      const el = await this.findElement(selector);
      if (!el) {
        // Try text-based fallback
        return await this.clickByText(selector);
      }

      await el.click();
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Fallback: click button by visible text
   */
  async clickByText(text) {
    try {
      return await this.page.evaluate(t => {
        const buttons = [...document.querySelectorAll('button, input[type="submit"], a[class*="btn" i]')];
        const match = buttons.find(b => {
          const bText = (b.innerText || b.value || '').trim().toLowerCase();
          return bText.includes(t.toLowerCase());
        });
        if (match) {
          match.click();
          return true;
        }
        return false;
      }, text);
    } catch (err) {
      return false;
    }
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

module.exports = { FormFiller };
