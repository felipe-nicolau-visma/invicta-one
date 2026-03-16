/* ============================================================
   INVICTA-ONE — STARS.JS
   Procedural SVG starfield (Kessel Run) + particles (Holocron)
   ============================================================ */

(function () {

  /* ── Starfield for Kessel Run ─────────────────────────── */
  var starfield = document.getElementById('starfield');

  if (starfield) {
    buildStarfield(starfield);
    buildHyperspaceStreaks(starfield);
  }

  /* ── Particles for Holocron ──────────────────────────── */
  var particleContainer = document.getElementById('holocron-particles');

  if (particleContainer) {
    buildParticles(particleContainer);
  }

  /* ================================================================
     STARFIELD
  ================================================================ */
  function buildStarfield(svg) {
    var NS = 'http://www.w3.org/2000/svg';
    var W = svg.clientWidth || 1200;
    var H = svg.clientHeight || 380;
    var starCount = 200;
    var colors = ['#ffffff', '#c0e8ff', '#ffee44', '#aaddff', '#ffffff', '#ffffff'];

    for (var i = 0; i < starCount; i++) {
      var x = Math.random() * W;
      var y = Math.random() * H;
      var r = Math.random() < 0.85 ? 1 : (Math.random() < 0.5 ? 1.5 : 2);
      var color = colors[Math.floor(Math.random() * colors.length)];
      var twinkleDur = (2 + Math.random() * 4).toFixed(1) + 's';
      var twinkleDelay = (Math.random() * 5).toFixed(1) + 's';

      var circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', x.toFixed(1));
      circle.setAttribute('cy', y.toFixed(1));
      circle.setAttribute('r', r);
      circle.setAttribute('fill', color);
      circle.setAttribute('opacity', (0.4 + Math.random() * 0.6).toFixed(2));

      // Add twinkle animation
      var animate = document.createElementNS(NS, 'animate');
      animate.setAttribute('attributeName', 'opacity');
      animate.setAttribute('values', '1;0.1;1');
      animate.setAttribute('dur', twinkleDur);
      animate.setAttribute('begin', twinkleDelay);
      animate.setAttribute('repeatCount', 'indefinite');
      circle.appendChild(animate);

      svg.appendChild(circle);
    }

    // Add a few larger "bright" stars with glow effect
    var brightStars = [
      { x: 0.1, y: 0.15, r: 3, color: '#ffee44' },
      { x: 0.85, y: 0.25, r: 2.5, color: '#c0e8ff' },
      { x: 0.45, y: 0.7, r: 3, color: '#ffffff' },
      { x: 0.7, y: 0.1, r: 2, color: '#ffee44' },
      { x: 0.25, y: 0.8, r: 2.5, color: '#aaeeff' },
    ];

    brightStars.forEach(function (star) {
      var circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', (star.x * W).toFixed(0));
      circle.setAttribute('cy', (star.y * H).toFixed(0));
      circle.setAttribute('r', star.r);
      circle.setAttribute('fill', star.color);
      circle.setAttribute('filter', 'url(#star-glow)');
      svg.appendChild(circle);
    });

    // SVG filter for glow
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>';
    svg.insertBefore(defs, svg.firstChild);
  }

  /* ================================================================
     HYPERSPACE STREAKS
  ================================================================ */
  function buildHyperspaceStreaks(svg) {
    var NS = 'http://www.w3.org/2000/svg';
    var W = svg.clientWidth || 1200;
    var H = svg.clientHeight || 380;
    var streakCount = 12;

    for (var i = 0; i < streakCount; i++) {
      var x1 = Math.random() * W;
      var y1 = Math.random() * H;
      var angle = -5 + Math.random() * 10; // mostly horizontal
      var len = 80 + Math.random() * 200;
      var rad = angle * Math.PI / 180;
      var x2 = x1 + Math.cos(rad) * len;
      var y2 = y1 + Math.sin(rad) * len;

      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', x1.toFixed(0));
      line.setAttribute('y1', y1.toFixed(0));
      line.setAttribute('x2', x2.toFixed(0));
      line.setAttribute('y2', y2.toFixed(0));
      line.setAttribute('stroke', 'rgba(0,220,255,0.8)');
      line.setAttribute('stroke-width', (0.5 + Math.random() * 1.5).toFixed(1));
      line.setAttribute('stroke-linecap', 'round');

      var totalLen = len;
      var delay = (i * 0.18).toFixed(2) + 's';
      var dur = (0.6 + Math.random() * 0.6).toFixed(2) + 's';

      // Animate stroke-dasharray for draw-in effect
      var animate = document.createElementNS(NS, 'animate');
      animate.setAttribute('attributeName', 'stroke-dasharray');
      animate.setAttribute('values', '0 ' + totalLen + ';' + totalLen + ' 0;0 ' + totalLen);
      animate.setAttribute('dur', dur);
      animate.setAttribute('begin', delay);
      animate.setAttribute('repeatCount', '1');
      animate.setAttribute('fill', 'freeze');
      line.appendChild(animate);

      var animateOpacity = document.createElementNS(NS, 'animate');
      animateOpacity.setAttribute('attributeName', 'opacity');
      animateOpacity.setAttribute('values', '0;1;1;0');
      animateOpacity.setAttribute('dur', dur);
      animateOpacity.setAttribute('begin', delay);
      animateOpacity.setAttribute('repeatCount', '1');
      animateOpacity.setAttribute('fill', 'freeze');
      line.appendChild(animateOpacity);

      line.setAttribute('opacity', '0');
      svg.appendChild(line);
    }
  }

  /* ================================================================
     HOLOCRON PARTICLES
  ================================================================ */
  function buildParticles(container) {
    var particleCount = 24;
    var colors = ['#ffaa00', '#ffcc44', '#ff8800', '#ffdd88', '#8866ff'];

    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement('div');
      particle.className = 'holocron-particle';

      var x = 10 + Math.random() * 80; // % from left
      var size = 2 + Math.random() * 4;
      var drift = (-20 + Math.random() * 40).toFixed(0) + 'px';
      var delay = (Math.random() * 8).toFixed(2) + 's';
      var dur = (4 + Math.random() * 6).toFixed(2) + 's';
      var color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = [
        'left: ' + x.toFixed(1) + '%',
        'width: ' + size.toFixed(1) + 'px',
        'height: ' + size.toFixed(1) + 'px',
        'background: ' + color,
        '--drift-x: ' + drift,
        'animation-duration: ' + dur,
        'animation-delay: ' + delay,
      ].join(';');

      container.appendChild(particle);
    }
  }

})();
