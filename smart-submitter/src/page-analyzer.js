/**
 * page-analyzer.js
 * 
 * Extracts a structured snapshot of the current page state:
 * - All visible form fields with labels, types, options, placeholders
 * - Visible buttons and links
 * - Page text context (headings, paragraphs near forms)
 * - CAPTCHA detection
 * - Multi-step form detection
 * 
 * This runs inside the browser via page.evaluate() and returns
 * a clean JSON object that gets passed to Claude for analysis.
 */

async function analyzePage(page) {
  return await page.evaluate(() => {
    const snapshot = {
      url: window.location.href,
      title: document.title,
      forms: [],
      buttons: [],
      captcha_detected: false,
      captcha_type: null,
      page_context: '',
      step_indicators: [],
      alerts: [],
      is_registration: false,
      is_listing_form: false,
      requires_login: false,
    };

    // --- Detect CAPTCHAs ---
    const captchaSignals = [
      { sel: 'iframe[src*="recaptcha"]', type: 'reCAPTCHA' },
      { sel: 'iframe[src*="hcaptcha"]', type: 'hCaptcha' },
      { sel: '.g-recaptcha', type: 'reCAPTCHA' },
      { sel: '.h-captcha', type: 'hCaptcha' },
      { sel: '[data-sitekey]', type: 'reCAPTCHA/hCaptcha' },
      { sel: 'img[src*="captcha" i]', type: 'image CAPTCHA' },
      { sel: 'input[name*="captcha" i]', type: 'text CAPTCHA' },
      { sel: '#cf-turnstile', type: 'Cloudflare Turnstile' },
    ];
    for (const sig of captchaSignals) {
      if (document.querySelector(sig.sel)) {
        snapshot.captcha_detected = true;
        snapshot.captcha_type = sig.type;
        break;
      }
    }

    // --- Detect login requirement ---
    const loginSignals = [
      'a[href*="login"]', 'a[href*="signin"]', 'a[href*="sign-in"]',
      'button:has(> span)', // generic, but combined with other signals
    ];
    const pageText = document.body?.innerText?.toLowerCase() || '';
    if (
      (pageText.includes('log in to') || pageText.includes('sign in to') || pageText.includes('please login')) &&
      !pageText.includes('add your business') && !pageText.includes('submit your listing')
    ) {
      snapshot.requires_login = true;
    }

    // --- Detect form type ---
    if (pageText.includes('register') || pageText.includes('create account') || pageText.includes('sign up')) {
      snapshot.is_registration = true;
    }
    if (pageText.includes('add your business') || pageText.includes('add listing') || pageText.includes('submit your business') || pageText.includes('add company')) {
      snapshot.is_listing_form = true;
    }

    // --- Step indicators ---
    const stepEls = document.querySelectorAll('[class*="step" i], [class*="progress" i], [class*="wizard" i], .breadcrumb, [role="progressbar"]');
    stepEls.forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 200) snapshot.step_indicators.push(text);
    });

    // --- Alerts / error messages ---
    const alertEls = document.querySelectorAll('[class*="alert" i], [class*="error" i], [class*="warning" i], [class*="notice" i], [role="alert"]');
    alertEls.forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 300 && text.length > 3) snapshot.alerts.push(text);
    });

    // --- Page context (headings + first few paragraphs) ---
    const contextParts = [];
    document.querySelectorAll('h1, h2, h3').forEach(h => {
      const t = h.innerText?.trim();
      if (t && t.length < 150) contextParts.push(t);
    });
    document.querySelectorAll('p').forEach((p, i) => {
      if (i < 5) {
        const t = p.innerText?.trim();
        if (t && t.length > 10 && t.length < 300) contextParts.push(t);
      }
    });
    snapshot.page_context = contextParts.join(' | ');

    // --- Helper: get label for a field ---
    function getLabel(el) {
      // 1. Explicit <label for="...">
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) return label.innerText?.trim();
      }
      // 2. Parent label
      const parentLabel = el.closest('label');
      if (parentLabel) {
        const clone = parentLabel.cloneNode(true);
        clone.querySelectorAll('input, select, textarea').forEach(c => c.remove());
        return clone.innerText?.trim();
      }
      // 3. Previous sibling or nearby text
      const prev = el.previousElementSibling;
      if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
        const t = prev.innerText?.trim();
        if (t && t.length < 80) return t;
      }
      // 4. aria-label
      if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
      // 5. Parent div label
      const parentDiv = el.closest('.form-group, .field, .input-group, [class*="field" i]');
      if (parentDiv) {
        const lbl = parentDiv.querySelector('label, .label, [class*="label" i]');
        if (lbl) return lbl.innerText?.trim();
      }
      return '';
    }

    // --- Helper: is element visible ---
    function isVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    // --- Extract forms ---
    const formEls = document.querySelectorAll('form');
    const forms = formEls.length > 0 ? formEls : [document.body]; // fallback: scan whole body

    forms.forEach((form, fi) => {
      if (form !== document.body && !isVisible(form)) return;

      const formData = {
        id: form.id || `form_${fi}`,
        action: form.action || '',
        method: form.method || '',
        fields: [],
      };

      // Inputs
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((input, idx) => {
        if (!isVisible(input)) return;
        const type = input.tagName.toLowerCase() === 'select' ? 'select'
          : input.tagName.toLowerCase() === 'textarea' ? 'textarea'
          : (input.type || 'text').toLowerCase();

        // Skip hidden, submit, button, file types
        if (['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) return;

        const field = {
          index: idx,
          tag: input.tagName.toLowerCase(),
          type: type,
          name: input.name || '',
          id: input.id || '',
          placeholder: input.placeholder || '',
          label: getLabel(input),
          required: input.required || input.getAttribute('aria-required') === 'true',
          value: input.value || '',
          maxlength: input.maxLength > 0 ? input.maxLength : null,
          css_selector: buildSelector(input),
        };

        // Select options
        if (type === 'select') {
          field.options = Array.from(input.options).map(o => ({
            value: o.value,
            text: o.text.trim(),
            selected: o.selected,
          })).filter(o => o.value !== '' || o.text !== ''); // skip empty placeholder options
        }

        // Checkbox/radio
        if (type === 'checkbox' || type === 'radio') {
          field.checked = input.checked;
          field.label_text = getLabel(input) || input.parentElement?.innerText?.trim() || '';
        }

        formData.fields.push(field);
      });

      if (formData.fields.length > 0) {
        snapshot.forms.push(formData);
      }
    });

    // --- Buttons ---
    const btns = document.querySelectorAll('button, input[type="submit"], input[type="button"], a[class*="btn" i], a[class*="button" i]');
    btns.forEach(btn => {
      if (!isVisible(btn)) return;
      const text = (btn.innerText || btn.value || '').trim();
      if (!text || text.length > 50) return;
      snapshot.buttons.push({
        text: text,
        type: btn.type || btn.tagName.toLowerCase(),
        css_selector: buildSelector(btn),
        is_submit: btn.type === 'submit' || text.toLowerCase().match(/submit|add|register|create|list|save|sign up|next|continue/),
      });
    });

    // --- Build unique CSS selector ---
    function buildSelector(el) {
      if (el.id) return `#${CSS.escape(el.id)}`;
      if (el.name) return `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;

      // Build path-based selector
      const parts = [];
      let current = el;
      while (current && current !== document.body && parts.length < 4) {
        let sel = current.tagName.toLowerCase();
        if (current.id) {
          sel = `#${CSS.escape(current.id)}`;
          parts.unshift(sel);
          break;
        }
        if (current.className && typeof current.className === 'string') {
          const cls = current.className.trim().split(/\s+/).filter(c => !c.match(/^(active|focus|hover|selected)/i))[0];
          if (cls) sel += `.${CSS.escape(cls)}`;
        }
        // nth-child for disambiguation
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
          if (siblings.length > 1) {
            const idx = siblings.indexOf(current) + 1;
            sel += `:nth-of-type(${idx})`;
          }
        }
        parts.unshift(sel);
        current = current.parentElement;
      }
      return parts.join(' > ');
    }

    return snapshot;
  });
}

module.exports = { analyzePage };
