/* ============================================================
   INVICTA-ONE — TRY-IT.JS
   Claude API live test modal
   Calls api.anthropic.com directly from the browser using
   anthropic-dangerous-direct-browser-access: true
   API key stored in sessionStorage (cleared on tab close)
   ============================================================ */

(function () {
  var SESSION_KEY = 'invicta_anthropic_key';
  var MODEL = 'claude-sonnet-4-6';

  /* ── Build the modal HTML once and append to body ───────── */
  function buildModal() {
    var el = document.createElement('div');
    el.className = 'try-it-overlay';
    el.id = 'try-it-overlay';
    el.innerHTML = [
      '<div class="try-it-modal" id="try-it-modal">',

        // Header
        '<div class="try-it-header">',
          '<div class="try-it-header-left">',
            '<span class="claude-logo-badge">CLAUDE API</span>',
            '<span class="try-it-title" id="try-it-modal-title">LIVE TEST</span>',
          '</div>',
          '<button class="try-it-close" onclick="TryIt.close()">[ ✕ CLOSE ]</button>',
        '</div>',

        // Body
        '<div class="try-it-body">',

          // API Key
          '<div class="apikey-section" id="apikey-section">',
            '<div class="apikey-row">',
              '<span class="apikey-label" id="apikey-label">API KEY</span>',
              '<input class="apikey-input" id="apikey-input" type="password" placeholder="sk-ant-..." autocomplete="off"/>',
              '<button class="apikey-save-btn" onclick="TryIt.saveKey()">[ SAVE ]</button>',
              '<span class="apikey-status" id="apikey-status" style="display:none">✓ KEY SET</span>',
            '</div>',
            '<div class="apikey-hint">',
              'Your key is stored in <strong>sessionStorage</strong> only — cleared when you close the tab. ',
              'Never committed or sent anywhere except Anthropic\'s API.',
            '</div>',
          '</div>',

          // System prompt
          '<div>',
            '<div class="system-prompt-toggle" id="spt-toggle" onclick="TryIt.togglePrompt()">',
              '<span class="spt-label">▷ SYSTEM PROMPT (click to expand)</span>',
              '<span class="spt-arrow">▶</span>',
            '</div>',
            '<pre class="system-prompt-display" id="system-prompt-display"></pre>',
          '</div>',

          // User input
          '<div class="input-section">',
            '<label id="input-label">YOUR INPUT</label>',
            '<textarea class="try-it-input" id="try-it-input" rows="5"></textarea>',
          '</div>',

          // Send row
          '<div class="send-row">',
            '<button class="send-claude-btn" id="send-claude-btn" onclick="TryIt.send()">',
              '<span class="claude-dot"></span>',
              '[ SEND TO CLAUDE → ]',
            '</button>',
            '<span class="send-note">',
              'Calls Claude API in real time.<br>',
              'Model: ' + MODEL,
            '</span>',
          '</div>',

          // Response
          '<div class="response-section" id="response-section">',
            '<div class="response-header">',
              '<span class="claude-dot"></span>',
              '<span>CLAUDE RESPONSE</span>',
            '</div>',
            '<div class="response-body" id="response-body"></div>',
          '</div>',

        '</div>', // body
      '</div>'   // modal
    ].join('');

    document.body.appendChild(el);

    // Close on overlay click
    el.addEventListener('click', function (e) {
      if (e.target === el) TryIt.close();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') TryIt.close();
    });
  }

  /* ── State ─────────────────────────────────────────────────── */
  var currentConfig = null;

  /* ── Public API ─────────────────────────────────────────────── */
  window.TryIt = {

    open: function (config) {
      currentConfig = config;

      var overlay = document.getElementById('try-it-overlay');
      if (!overlay) { buildModal(); overlay = document.getElementById('try-it-overlay'); }

      // Apply trial color
      var modal = document.getElementById('try-it-modal');
      modal.style.setProperty('--try-color', config.color || '#ff8800');
      modal.style.borderColor = config.color || '#ff8800';

      // Set title
      document.getElementById('try-it-modal-title').textContent = config.name + ' — LIVE TEST';

      // Set system prompt
      document.getElementById('system-prompt-display').textContent = config.systemPrompt;

      // Set input placeholder + label
      document.getElementById('try-it-input').placeholder = config.inputPlaceholder || '';
      document.getElementById('try-it-input').value = config.sampleInput || '';
      document.getElementById('input-label').textContent = config.inputLabel || 'YOUR INPUT';

      // Reset response
      var responseSection = document.getElementById('response-section');
      responseSection.classList.remove('visible');
      document.getElementById('response-body').textContent = '';

      // Check saved key
      this._refreshKeyUI();

      // Open
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Focus input
      setTimeout(function () {
        document.getElementById('try-it-input').focus();
      }, 100);
    },

    close: function () {
      var overlay = document.getElementById('try-it-overlay');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    },

    togglePrompt: function () {
      var toggle = document.getElementById('spt-toggle');
      var display = document.getElementById('system-prompt-display');
      toggle.classList.toggle('open');
      display.classList.toggle('open');
    },

    saveKey: function () {
      var val = document.getElementById('apikey-input').value.trim();
      if (!val) return;
      sessionStorage.setItem(SESSION_KEY, val);
      document.getElementById('apikey-input').value = '';
      this._refreshKeyUI();
    },

    clearKey: function () {
      sessionStorage.removeItem(SESSION_KEY);
      this._refreshKeyUI();
    },

    _refreshKeyUI: function () {
      var key = sessionStorage.getItem(SESSION_KEY);
      var section = document.getElementById('apikey-section');
      var input = document.getElementById('apikey-input');
      var status = document.getElementById('apikey-status');
      var label = document.getElementById('apikey-label');

      if (key) {
        section.classList.add('has-key');
        input.style.display = 'none';
        document.querySelector('.apikey-save-btn').style.display = 'none';
        status.style.display = 'inline';
        label.className = 'apikey-label set';
        label.innerHTML = '✓ API KEY SET &nbsp;<span style="color:#888;cursor:pointer;font-size:0.5rem;" onclick="TryIt.clearKey()">[CHANGE]</span>';
      } else {
        section.classList.remove('has-key');
        input.style.display = '';
        document.querySelector('.apikey-save-btn').style.display = '';
        status.style.display = 'none';
        label.className = 'apikey-label';
        label.textContent = 'ANTHROPIC API KEY';
      }
    },

    send: function () {
      var key = sessionStorage.getItem(SESSION_KEY);
      if (!key) {
        alert('Please enter your Anthropic API key first.');
        return;
      }

      var userInput = document.getElementById('try-it-input').value.trim();
      if (!userInput) {
        alert('Please enter some input to test.');
        return;
      }

      var btn = document.getElementById('send-claude-btn');
      var responseSection = document.getElementById('response-section');
      var responseBody = document.getElementById('response-body');

      // Loading state
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span> &nbsp;CALLING CLAUDE...';
      responseSection.classList.add('visible');
      responseBody.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';

      var systemPrompt = currentConfig.systemPrompt;

      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userInput }]
        })
      })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            throw new Error(err.error ? err.error.message : 'HTTP ' + res.status);
          });
        }
        return res.json();
      })
      .then(function (data) {
        var text = data.content && data.content[0] && data.content[0].text
          ? data.content[0].text
          : JSON.stringify(data, null, 2);
        responseBody.textContent = text;
      })
      .catch(function (err) {
        responseBody.innerHTML = '<div class="response-error">⚠ ERROR: ' + err.message + '</div>';
        if (err.message && err.message.toLowerCase().includes('api key')) {
          sessionStorage.removeItem(SESSION_KEY);
          TryIt._refreshKeyUI();
        }
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = '<span class="claude-dot"></span> [ SEND TO CLAUDE → ]';
      });
    }
  };

})();
