(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalizePath(value) {
    try {
      const url = new URL(value, window.location.origin);
      return url.pathname.replace(/\/+$/, '') || '/';
    } catch (error) {
      return String(value || '').replace(/\/+$/, '') || '/';
    }
  }

  function openSearchFallback() {
    const triggers = [
      '[data-search-open]',
      '[data-open-search]',
      '.s-search-input',
      '.s-search-modal-trigger',
      '.s-header-search',
      'button[aria-label*="بحث"]',
      'button[aria-label*="search"]'
    ];

    for (const selector of triggers) {
      const el = document.querySelector(selector);

      if (el) {
        el.click();
        return true;
      }
    }

    return false;
  }

  ready(function () {
    const menu = document.querySelector('.veloura-mobile-floating-menu');

    if (!menu) {
      return;
    }

    const currentPath = normalizePath(window.location.href);
    const items = menu.querySelectorAll('.veloura-mobile-floating-menu__item');

    items.forEach(function (item) {
      const match = String(item.getAttribute('data-vmfm-match') || '').trim();
      const href = item.getAttribute('href') || '';
      const itemPath = normalizePath(href);
      let active = false;

      if (match === 'home') {
        active = currentPath === '/';
      } else if (match === 'categories') {
        active =
          currentPath.indexOf('/categories') !== -1 ||
          currentPath.indexOf('/category') !== -1 ||
          currentPath.indexOf('/c/') !== -1;
      } else if (match === 'search') {
        active = currentPath.indexOf('/search') !== -1;
      } else if (match === 'cart') {
        active = currentPath.indexOf('/cart') !== -1;
      } else if (match === 'account') {
        active =
          currentPath.indexOf('/account') !== -1 ||
          currentPath.indexOf('/profile') !== -1 ||
          currentPath.indexOf('/login') !== -1;
      } else if (match) {
        active =
          currentPath.indexOf(match) !== -1 ||
          window.location.href.indexOf(match) !== -1;
      } else if (itemPath && itemPath !== '/') {
        active = currentPath === itemPath;
      }

      if (active) {
        item.classList.add('is-active');
      }
    });

    menu.addEventListener('click', function (event) {
      const searchItem = event.target.closest('[data-vmfm-action="search"]');

      if (!searchItem) {
        return;
      }

      const opened = openSearchFallback();

      if (opened) {
        event.preventDefault();
      }
    });
  });
})();