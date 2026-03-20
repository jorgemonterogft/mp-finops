(function () {
  const AUTH_KEY = 'mp_finops_auth';
  const PASSWORD_HASH = 'e6069d7fa184caeaf2a55561b29404522af12a64bb44b09614f40ae20221fa5c';
  const LOGIN_PAGE = 'login.html';

  function currentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page || 'index.html';
  }

  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === '1';
  }

  function protectPage() {
    const page = currentPage();
    if (page === LOGIN_PAGE) return;
    if (isAuthenticated()) return;
    const next = encodeURIComponent(page);
    window.location.replace(`${LOGIN_PAGE}?next=${next}`);
  }

  function initLogin() {
    const page = currentPage();
    if (page !== LOGIN_PAGE) return;

    const form = document.getElementById('login-form');
    const input = document.getElementById('password');
    const error = document.getElementById('login-error');

    if (!form || !input || !error) {
      if (isAuthenticated()) {
        const nextFromQuery = new URLSearchParams(window.location.search).get('next') || 'index.html';
        window.location.replace(nextFromQuery);
      }
      return;
    }

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      error.textContent = '';
      const entered = input.value.trim();
      const enteredHash = await sha256(entered);

      if (enteredHash === PASSWORD_HASH) {
        localStorage.setItem(AUTH_KEY, '1');
        const nextFromQuery = new URLSearchParams(window.location.search).get('next') || 'index.html';
        window.location.replace(nextFromQuery);
        return;
      }

      error.textContent = 'Contraseña incorrecta';
    });
  }

  window.mpLogout = function mpLogout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.replace(LOGIN_PAGE);
  };

  protectPage();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
  } else {
    initLogin();
  }
})();
