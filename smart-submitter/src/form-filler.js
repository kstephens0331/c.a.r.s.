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

      case 'type_select':
        return await this.typeAndSelect(el, value, css_selector, fill.dropdown_wait_ms);

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

      // Clear the field completely via JS first, then focus
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) {
          e.value = '';
          e.focus();
        }
      }, selector);
      await this.sleep(50);

      // Also Ctrl+A + Delete as belt-and-suspenders
      await el.click();
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await this.page.keyboard.press('Delete');
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
   * Type into a search/autocomplete field and select from the dropdown results.
   * Handles dynamic dropdowns that load options via AJAX on keypress.
   * Tries multiple search terms if the first doesn't match.
   */
  async typeAndSelect(el, value, selector, waitMs = 2000) {
    // Try multiple category search terms — the directory may use different naming
    const searchTerms = [value];
    const val = value.toLowerCase();
    if (val.includes('auto body') || val.includes('collision') || val.includes('auto repair')) {
      searchTerms.push('Auto Body', 'Automotive', 'Auto Repair', 'Car Repair', 'Collision Repair', 'Auto');
    }
    // Deduplicate
    const uniqueTerms = [...new Set(searchTerms)];

    for (const searchTerm of uniqueTerms) {
      const result = await this._tryTypeAndSelect(el, searchTerm, selector, waitMs);
      if (result) return true;

      // Re-find element since it may have been detached
      el = await this.findElement(selector);
      if (!el) return false;
    }

    // Last resort: just type the original value and press Enter
    try {
      el = await this.findElement(selector);
      if (el) {
        await this.page.evaluate(s => {
          const e = document.querySelector(s);
          if (e) { e.value = ''; e.focus(); }
        }, selector);
        await el.type(value, { delay: this.typeDelay });
        await this.sleep(500);
        await this.page.keyboard.press('Enter');
        await this.sleep(300);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Internal: try a single search term for typeAndSelect
   */
  async _tryTypeAndSelect(el, searchTerm, selector, waitMs) {
    try {
      // Scroll into view
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, selector);
      await this.sleep(200);

      // Clear field completely
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) { e.value = ''; e.focus(); }
      }, selector);
      await this.sleep(100);

      await el.click({ clickCount: 3 }); // triple-click to select all
      await this.page.keyboard.press('Delete');
      await this.sleep(100);

      // Type slowly to trigger AJAX
      await el.type(searchTerm, { delay: this.typeDelay + 30 });

      // Fire every event that might trigger the dropdown
      await this.page.evaluate(s => {
        const e = document.querySelector(s);
        if (e) {
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true }));
          e.dispatchEvent(new Event('keyup', { bubbles: true }));
          e.dispatchEvent(new KeyboardEvent('keyup', { key: searchTerm.slice(-1), bubbles: true }));
          e.dispatchEvent(new KeyboardEvent('keydown', { key: searchTerm.slice(-1), bubbles: true }));
        }
      }, selector);

      // Wait for dropdown options to appear
      await this.sleep(waitMs);

      // Count elements that appeared (snapshot before vs after comparison)
      const clicked = await this.page.evaluate((searchVal) => {
        const val = searchVal.toLowerCase().trim();

        // Exhaustive dropdown/autocomplete result selectors
        const selectors = [
          // Specific frameworks
          '.dropdown-menu li a',
          '.dropdown-menu .dropdown-item',
          '.dropdown-menu li',
          '.autocomplete-result',
          '.autocomplete-suggestion',
          '.autocomplete-items div',
          '.suggestions li',
          '.suggestion-item',
          '.pac-item', // Google Places
          '.tt-suggestion', // typeahead.js
          '.tt-dataset .tt-suggestion',
          '.select2-results__option',
          '.select2-results li',
          '.chosen-results li',
          'ul[role="listbox"] li',
          '[role="listbox"] [role="option"]',
          '[role="option"]',
          '.MuiAutocomplete-option',
          '.ant-select-dropdown .ant-select-item',
          '.vs__dropdown-option',
          '.multiselect__element',
          '.awesomplete li',
          '.easy-autocomplete-container li',
          '.ui-autocomplete li', // jQuery UI
          '.ui-menu-item',
          '.ui-menu .ui-menu-item-wrapper',
          '.twitter-typeahead .tt-suggestion',
          '.bloodhound .tt-suggestion',
          // Generic patterns
          '.dropdown li',
          '.dropdown-content a',
          '.list-group-item',
          'ul.results li',
          'ul.search-results li',
          'div[class*="option"]',
          'div[class*="suggestion"]',
          'div[class*="result"]',
          'li[class*="result"]',
          'li[class*="option"]',
          'li[class*="item"]',
          'div[class*="autocomplete"] li',
          'div[class*="autocomplete"] div',
          'ul[class*="dropdown"] li',
          // Catch-all: any listbox or menu
          '[role="menu"] [role="menuitem"]',
          '[role="listbox"] li',
          // Position-based: anything absolutely positioned near the input that appeared
          'div[style*="position: absolute"] li',
          'div[style*="position:absolute"] li',
          'div[style*="display: block"] li',
        ];

        for (const sel of selectors) {
          const items = document.querySelectorAll(sel);
          if (items.length === 0) continue;

          // Filter to only visible items
          const visibleItems = Array.from(items).filter(item => {
            const rect = item.getBoundingClientRect();
            const style = window.getComputedStyle(item);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          });
          if (visibleItems.length === 0) continue;

          // Find best match by text content
          let best = null;
          let bestScore = -1;

          for (const item of visibleItems) {
            const text = (item.textContent || '').trim().toLowerCase();
            if (!text) continue;

            let score = 0;
            if (text === val) score = 100;
            else if (text.startsWith(val)) score = 80;
            else if (text.includes(val)) score = 60;
            else if (val.includes(text)) score = 40;
            else {
              // Check word overlap
              const valWords = val.split(/\s+/);
              const textWords = text.split(/\s+/);
              const overlap = valWords.filter(w => textWords.some(tw => tw.includes(w) || w.includes(tw)));
              if (overlap.length > 0) score = 20 + (overlap.length / valWords.length) * 30;
            }

            if (score > bestScore) {
              bestScore = score;
              best = item;
            }
          }

          if (best && bestScore > 10) {
            // Try to click the item
            best.scrollIntoView({ block: 'nearest' });
            best.click();
            // Also try mousedown+mouseup for stubborn UIs
            best.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            best.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            return { clicked: true, text: best.textContent.trim(), selector: sel };
          }
        }

        // Check if there's ANY visible list/dropdown near the focused element
        const focused = document.activeElement;
        if (focused) {
          const parent = focused.closest('.form-group, .field, .input-group, [class*="field"]') || focused.parentElement;
          if (parent) {
            const anyList = parent.querySelectorAll('li, [role="option"], div[class*="item"]');
            const visibleAny = Array.from(anyList).filter(el => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            });
            if (visibleAny.length > 0) {
              // Click the first visible item
              visibleAny[0].click();
              return { clicked: true, text: visibleAny[0].textContent.trim(), selector: 'parent_search' };
            }
          }
        }

        return { clicked: false };
      }, searchTerm);

      if (clicked && clicked.clicked) {
        await this.sleep(500); // Wait for selection to register
        return true;
      }

      // Try keyboard navigation: ArrowDown to highlight first option, Enter to select
      await this.page.keyboard.press('ArrowDown');
      await this.sleep(200);
      await this.page.keyboard.press('Enter');
      await this.sleep(500);

      // Check if a value was actually selected (field value changed from typed text)
      const fieldValue = await this.page.evaluate(s => {
        const e = document.querySelector(s);
        return e ? e.value : '';
      }, selector);

      // If the field value changed (not just what we typed), selection worked
      if (fieldValue && fieldValue.toLowerCase() !== searchTerm.toLowerCase()) {
        return true;
      }

      return false;
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
