(function () {
  function applyDynamicFooterYear() {
    const footerTextElements = document.querySelectorAll('.site-footer__text');
    if (!footerTextElements.length) return;

    const currentYear = new Date().getFullYear();
    footerTextElements.forEach(function (node) {
      node.textContent = `ZEUS #OneTeam © ${currentYear}`;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDynamicFooterYear);
  } else {
    applyDynamicFooterYear();
  }
})();
