/* ============================================================
   INVICTA-ONE — ANIMATIONS.JS
   IntersectionObserver scroll reveals, counter animations,
   staggered table rows, copy-to-clipboard
   ============================================================ */

(function () {

  /* ── Scroll-reveal via IntersectionObserver ─────────────── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        // Counter animation
        if (entry.target.hasAttribute('data-counter')) {
          animateCounter(entry.target);
        }

        // Staggered table rows
        if (entry.target.id && entry.target.id.indexOf('table') !== -1) {
          staggerTableRows(entry.target);
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // Observe all data-animate elements
  document.querySelectorAll('[data-animate]').forEach(function (el) {
    observer.observe(el);
  });

  // Observe tables for stagger
  document.querySelectorAll('.pixel-table').forEach(function (table) {
    var tableObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          staggerTableRows(entry.target);
          tableObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    tableObserver.observe(table);
  });

  /* ── Staggered table rows ────────────────────────────────── */
  function staggerTableRows(table) {
    var rows = table.querySelectorAll('tbody tr');
    rows.forEach(function (row, idx) {
      setTimeout(function () {
        row.classList.add('is-visible');
      }, idx * 80);
    });
  }

  /* ── Counter animation ───────────────────────────────────── */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = null;
    var startVal = 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // Ease out
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // Observe counter elements
  document.querySelectorAll('[data-counter]').forEach(function (el) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterObserver.observe(el);
  });

  /* ── Progress bar trigger ────────────────────────────────── */
  document.querySelectorAll('.progress-fill').forEach(function (bar) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Re-trigger the CSS transition
          var target = bar.style.getPropertyValue('--progress') || '100%';
          bar.style.setProperty('--progress', '0%');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              bar.style.setProperty('--progress', target);
            });
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    barObserver.observe(bar);
  });

  /* ── Banned words strike-through animation ──────────────── */
  var bannedWords = document.querySelectorAll('.banned-word');
  if (bannedWords.length > 0) {
    var bannedObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var words = entry.target.querySelectorAll('.banned-word');
          words.forEach(function (word, idx) {
            setTimeout(function () {
              word.classList.add('struck');
            }, idx * 300);
          });
          bannedObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    var bannedContainer = document.querySelector('.banned-words-container');
    if (bannedContainer) {
      bannedObserver.observe(bannedContainer);
    }
  }

  /* ── Panel tabs (Holocron dual audience) ─────────────────── */
  window.switchPanel = function (tabEl, panelId) {
    var group = tabEl.closest('.panel-group');
    if (!group) return;

    group.querySelectorAll('.panel-tab').forEach(function (t) {
      t.classList.remove('active');
    });
    group.querySelectorAll('.panel-content').forEach(function (p) {
      p.classList.remove('active');
    });

    tabEl.classList.add('active');
    var panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
  };

  /* ── Copy to clipboard ───────────────────────────────────── */
  window.copyCode = function (elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;

    var text = el.textContent || el.innerText;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        flashCopyBtn(elementId);
      });
    } else {
      // Fallback
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      flashCopyBtn(elementId);
    }
  };

  function flashCopyBtn(elementId) {
    // Find the copy button associated with this code block
    var btn = document.querySelector('[onclick="copyCode(\'' + elementId + '\')"]');
    if (!btn) return;
    var original = btn.textContent;
    btn.textContent = '[ COPIED! ]';
    btn.style.background = '#44cc44';
    btn.style.color = '#000';
    setTimeout(function () {
      btn.textContent = original;
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  }

})();
