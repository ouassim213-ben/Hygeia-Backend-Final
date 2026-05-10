/**
 * theme.js — HYGEIA Global Dark/Light Mode switcher
 * - Reads preference from localStorage on page load
 * - Applies [data-theme="light"] to <html> for Light Mode
 * - Default state (no attribute) = Dark Mode
 * - Toggles the navbar moon/sun icon accordingly
 */

(function initTheme() {
  const saved = localStorage.getItem('hygeia-theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function syncIcon() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.innerHTML = isLight
      ? '<i class="fas fa-sun" style="color: #f59e0b;"></i>'
      : '<i class="fas fa-moon"></i>';
    btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  }

  syncIcon();

  btn.addEventListener('click', function () {
    const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isCurrentlyLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('hygeia-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('hygeia-theme', 'light');
    }
    syncIcon();
  });
});
