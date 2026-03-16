/* ============================================================
   INVICTA-ONE — NAV.JS
   Active link detection + mobile toggle
   ============================================================ */

(function () {
  // Set active nav link based on current page filename
  var links = document.querySelectorAll('.nav-link');
  var current = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

function toggleNav() {
  var navLinks = document.getElementById('nav-links');
  if (navLinks) {
    navLinks.classList.toggle('open');
  }
}
