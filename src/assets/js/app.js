import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

/* ========================================================================
   Veloura Footer Controller — embedded in the existing app.js
   No additional JavaScript file is required.
   ======================================================================== */
const initVelouraFooter = (() => {
  /*
   * Veloura footer controller
   * - Builds one clean contact-card list from Salla contacts and social links.
   * - Removes duplicate platforms.
   * - Detects application badges and updates footer layout classes.
   * - Keeps App Store and Google Play badges side by side.
   */

  const SVG = {
          phone: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M6.6 10.8c1.6 3.1 3.5 5 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2C10.6 21.4 2.6 13.4 2.6 3.4c0-.7.5-1.2 1.2-1.2h3.5c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4 .1.4 0 .9-.3 1.2l-2.2 2.2Z"/></svg>',
          whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.4a9.4 9.4 0 0 0-8.1 14.2L2.7 21.6l5.1-1.2A9.4 9.4 0 1 0 12 2.4Zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-3 .7.7-2.9-.2-.3A7.6 7.6 0 1 1 12 19.5Zm4.3-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.2-.2-.4-.3Z"/></svg>',
          email: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2Zm8 8.1L4.4 8.2V17h15.2V8.2L12 13.1Zm0-2L19.1 7H4.9L12 11.1Z"/></svg>',
          telegram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.7 3.6 18.4 20c-.2 1-.8 1.2-1.6.7l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L6.9 14.1 2.5 12.7c-1-.3-1-1 .2-1.4L20 4.6c.8-.3 1.5.2 1.7 1Z"/></svg>',
          instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7.5 2.8h9A4.7 4.7 0 0 1 21.2 7.5v9a4.7 4.7 0 0 1-4.7 4.7h-9a4.7 4.7 0 0 1-4.7-4.7v-9a4.7 4.7 0 0 1 4.7-4.7Zm0 2A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9ZM12 7.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5-2.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/></svg>',
          twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4 3.5h4.1l4.4 6.1 5.3-6.1h2.3l-6.5 7.5 7.1 9.5h-4.1l-4.8-6.5-5.7 6.5H3.8l6.9-8L4 3.5Zm3.1 1.7 10.4 13.6h1L8.2 5.2H7.1Z"/></svg>',
          youtube: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.6 7.2c-.2-.8-.8-1.4-1.6-1.6C18.6 5.2 12 5.2 12 5.2s-6.6 0-8 .4c-.8.2-1.4.8-1.6 1.6C2 8.6 2 12 2 12s0 3.4.4 4.8c.2.8.8 1.4 1.6 1.6 1.4.4 8 .4 8 .4s6.6 0 8-.4c.8-.2 1.4-.8 1.6-1.6.4-1.4.4-4.8.4-4.8s0-3.4-.4-4.8ZM10 14.9V9.1l5.2 2.9L10 14.9Z"/></svg>',
          tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M15.4 3c.4 2.6 1.9 4.2 4.5 4.4v3.1c-1.5.1-2.9-.4-4.4-1.3v6.2c0 3.1-2.1 5.4-5.2 5.6-2.8.2-5.3-1.7-5.8-4.4-.7-3.8 2.5-7 6.2-6.3v3.2c-.5-.2-1-.3-1.5-.2-1.2.2-2 1.2-1.9 2.4.1 1.2 1.1 2.1 2.3 2.1 1.5 0 2.4-1 2.4-2.7V3h3.4Z"/></svg>',
          facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14 8.1V6.3c0-.9.2-1.3 1.4-1.3H17V2.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v2H8v3.1h2.6V22H14V11.2h2.7l.4-3.1H14Z"/></svg>',
          snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.5c3 0 5 2.2 5 5.4v2.3c.3.2.8.1 1.2 0 .6-.2 1 .5.6 1-.4.5-.9.8-1.4 1 .2 1.1 1.1 2.4 3.1 3 .7.2.7 1.1.1 1.4-.9.4-1.8.5-2.6.6-.3.5-.8 1-1.5 1-.6 0-1.1-.2-1.7-.4-.7.7-1.6 1.2-2.8 1.2s-2.1-.5-2.8-1.2c-.6.2-1.1.4-1.7.4-.7 0-1.2-.5-1.5-1-.8-.1-1.7-.2-2.6-.6-.6-.3-.6-1.2.1-1.4 2-.6 2.9-1.9 3.1-3-.5-.2-1-.5-1.4-1-.4-.5 0-1.2.6-1 .4.1.9.2 1.2 0V7.9c0-3.2 2-5.4 5-5.4Z"/></svg>',
          website: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3.2c-.1-2-.6-3.8-1.4-5.2A8 8 0 0 1 18.9 11ZM12 4.1c.7 1 1.5 3.3 1.7 6.9h-3.4c.2-3.6 1-5.9 1.7-6.9ZM4.3 13h3.2c.1 2 .6 3.8 1.4 5.2A8 8 0 0 1 4.3 13Zm3.2-2H4.3a8 8 0 0 1 4.6-5.2C8.1 7.2 7.6 9 7.5 11ZM12 19.9c-.7-1-1.5-3.3-1.7-6.9h3.4c-.2 3.6-1 5.9-1.7 6.9Zm3.1-1.7c.8-1.4 1.3-3.2 1.4-5.2h3.2a8 8 0 0 1-4.6 5.2Z"/></svg>',
          contact: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.6V20h14v-1.4C19 16 16 14 12 14Z"/></svg>'
        };

  const labelMap = {
          phone: 'جوال',
          whatsapp: 'واتساب',
          email: 'إيميل',
          telegram: 'تلجرام',
          instagram: 'انستغرام',
          twitter: 'إكس',
          youtube: 'يوتيوب',
          snapchat: 'سناب',
          tiktok: 'تيك توك',
          facebook: 'فيسبوك',
          website: 'الموقع',
          contact: 'تواصل'
        };

  let eventsBound = false;
  let resizeTimer = null;

  function cleanText(element) {
    return (element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function detectKind(link, sourceType) {
    const href = (link.getAttribute('href') || '').toLowerCase();
    const aria = (link.getAttribute('aria-label') || '').toLowerCase();
    const title = (link.getAttribute('title') || '').toLowerCase();
    const classes = Array.from(link.querySelectorAll('[class]'))
      .map(element => element.className || '')
      .join(' ')
      .toLowerCase();
    const text = cleanText(link).toLowerCase();
    const source = [href, aria, title, classes, text].join(' ');

    if (/wa\.me|whatsapp|واتساب/.test(source)) return 'whatsapp';
    if (/mailto:|email|mail|إيميل|بريد|envelope/.test(source)) return 'email';
    if (/t\.me|telegram|تلجرام|paper-plane/.test(source)) return 'telegram';
    if (/instagram|انستغرام/.test(source)) return 'instagram';
    if (/twitter|x\.com|إكس/.test(source)) return 'twitter';
    if (/youtube|youtu\.be|يوتيوب/.test(source)) return 'youtube';
    if (/snapchat|snap|سناب/.test(source)) return 'snapchat';
    if (/tiktok|تيك/.test(source)) return 'tiktok';
    if (/facebook|فيسبوك/.test(source)) return 'facebook';
    if (/tel:|phone|mobile|call|هاتف|جوال/.test(source)) return 'phone';
    if (sourceType === 'social') return 'website';
    if (/https?:\/\//.test(source)) return 'website';

    return 'contact';
  }

  function copySafeAttributes(source, target) {
    Array.from(source.attributes || []).forEach(attribute => {
      if (['id', 'class', 'style', 'hidden'].includes(attribute.name)) return;
      target.setAttribute(attribute.name, attribute.value);
    });
  }

  function createContactCard(source, kind) {
    const isLink = source.tagName === 'A' && source.getAttribute('href');
    const card = document.createElement(isLink ? 'a' : 'button');
    const label = labelMap[kind] || labelMap.contact;
    const icon = SVG[kind] || SVG.contact;

    copySafeAttributes(source, card);

    if (!isLink) {
      card.type = 'button';
      card.addEventListener('click', event => {
        event.preventDefault();
        source.click();
      });
    }

    card.className = `veloura-footer-contact-card veloura-footer-contact-kind-${kind}`;
    card.dataset.velouraFooterKind = kind;
    card.setAttribute('aria-label', source.getAttribute('aria-label') || label);
    card.innerHTML = `
      <span class="veloura-footer-contact-card__icon" aria-hidden="true">${icon}</span>
      <span class="veloura-footer-contact-card__text">${label}</span>
    `;

    return card;
  }

  function renderContactCards(footer) {
    const contactWrap = footer.querySelector('.veloura-footer-contact-wrap');
    if (!contactWrap) return;

    const sources = Array.from(contactWrap.querySelectorAll(
      '[data-veloura-footer-contacts] a[href], ' +
      '[data-veloura-footer-social] a[href], ' +
      '[data-veloura-footer-social] button'
    ));

    if (!sources.length) return;

    const seen = new Set();
    const cards = [];

    sources.forEach(source => {
      const sourceType = source.closest('[data-veloura-footer-social]')
        ? 'social'
        : 'contact';
      const kind = detectKind(source, sourceType);
      const href = (source.getAttribute('href') || '').trim().toLowerCase();
      const key = kind === 'contact' ? `${kind}:${href || cleanText(source)}` : kind;

      if (!key || seen.has(key)) return;

      seen.add(key);
      cards.push(createContactCard(source, kind));
    });

    if (!cards.length) return;

    let cardsRoot = contactWrap.querySelector(':scope > .veloura-footer-contact-cards');

    if (!cardsRoot) {
      cardsRoot = document.createElement('div');
      cardsRoot.className = 'veloura-footer-contact-cards';
      cardsRoot.dataset.velouraFooterContactCards = '1';
      contactWrap.appendChild(cardsRoot);
    }

    cardsRoot.replaceChildren(...cards);
    contactWrap.classList.add('veloura-footer-contact-ready');
  }

  function restoreImages(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;

    root.querySelectorAll('img').forEach(image => {
      const dataSrc = image.getAttribute('data-src');
      const dataSrcset = image.getAttribute('data-srcset');

      if (!image.getAttribute('src') && dataSrc) image.setAttribute('src', dataSrc);
      if (!image.getAttribute('srcset') && dataSrcset) image.setAttribute('srcset', dataSrcset);

      image.hidden = false;
      image.style.removeProperty('display');
      image.style.removeProperty('visibility');
      image.style.removeProperty('opacity');
    });
  }

  function setImportant(element, property, value) {
    if (!element?.style) return;
    element.style.setProperty(property, value, 'important');
  }

  function getApplicationRoots(appsBlock) {
    const component = appsBlock?.querySelector('salla-apps-icons');
    const roots = [appsBlock, component].filter(Boolean);

    if (component?.shadowRoot) roots.push(component.shadowRoot);

    return { component, roots };
  }

  function rootHasApplications(root) {
    if (!root || typeof root.querySelector !== 'function') return false;

    return Boolean(root.querySelector(
      'a[href], img[src]:not([src=""]), img[data-src]'
    ));
  }

  function arrangeApplications(footer) {
    const appsBlock = footer.querySelector('[data-veloura-footer-apps]');

    if (!appsBlock) {
      footer.classList.remove('veloura-footer-has-apps', 'veloura-footer-layout-detecting');
      footer.classList.add('veloura-footer-no-apps');
      return;
    }

    restoreImages(appsBlock);

    const { component, roots } = getApplicationRoots(appsBlock);
    const centered =
      footer.classList.contains('veloura-footer-center-all') ||
      footer.dataset.velouraFooterCenterAll === 'true';

    roots.forEach(root => {
      if (!root) return;

      const host = root.host || root;
      setImportant(host, 'width', '100%');

      if (typeof root.querySelectorAll !== 'function') return;

      root.querySelectorAll(
        'div, ul, ol, nav, section, [class*="apps"], ' +
        '[class*="wrapper"], [class*="icons"]'
      ).forEach(wrapper => {
        if (wrapper.querySelectorAll('a[href], img').length < 2) return;

        setImportant(wrapper, 'display', 'flex');
        setImportant(wrapper, 'flex-direction', 'row');
        setImportant(wrapper, 'flex-wrap', window.innerWidth <= 560 ? 'wrap' : 'nowrap');
        setImportant(wrapper, 'align-items', 'center');
        setImportant(wrapper, 'justify-content', centered ? 'center' : 'center');
        setImportant(wrapper, 'gap', '10px');
        setImportant(wrapper, 'margin', '0');
        setImportant(wrapper, 'padding', '0');
      });

      root.querySelectorAll('a[href]').forEach(link => {
        setImportant(link, 'display', 'inline-flex');
        setImportant(link, 'flex', '0 0 auto');
        setImportant(link, 'align-items', 'center');
        setImportant(link, 'justify-content', 'center');
        setImportant(link, 'width', 'auto');
        setImportant(link, 'min-width', '0');
        setImportant(link, 'max-width', '150px');
        setImportant(link, 'margin', '0');
      });

      root.querySelectorAll('img').forEach(image => {
        setImportant(image, 'display', 'block');
        setImportant(image, 'visibility', 'visible');
        setImportant(image, 'opacity', '1');
        setImportant(image, 'width', 'auto');
        setImportant(image, 'height', '38px');
        setImportant(image, 'max-width', '150px');
        setImportant(image, 'max-height', '38px');
        setImportant(image, 'object-fit', 'contain');
        setImportant(image, 'margin', '0');
      });
    });

    const hasApps = roots.some(rootHasApplications);

    appsBlock.hidden = !hasApps;
    appsBlock.setAttribute('aria-hidden', hasApps ? 'false' : 'true');
    footer.classList.toggle('veloura-footer-has-apps', hasApps);
    footer.classList.toggle('veloura-footer-no-apps', !hasApps);
    footer.classList.remove('veloura-footer-layout-detecting');

    if (
      component &&
      typeof component.componentOnReady === 'function' &&
      component.dataset.velouraFooterReadyWatch !== '1'
    ) {
      component.dataset.velouraFooterReadyWatch = '1';

      component.componentOnReady().then(() => {
        restoreImages(appsBlock);
        arrangeApplications(footer);
      }).catch(() => {});
    }
  }

  function observeContactSources(footer) {
    footer.querySelectorAll(
      '[data-veloura-footer-contacts], [data-veloura-footer-social]'
    ).forEach(sourceRoot => {
      if (sourceRoot.dataset.velouraFooterObserver === '1') return;

      sourceRoot.dataset.velouraFooterObserver = '1';
      let scheduled = false;

      const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;

        window.requestAnimationFrame(() => {
          scheduled = false;
          renderContactCards(footer);
        });
      });

      observer.observe(sourceRoot, { childList: true, subtree: true });

      window.setTimeout(() => observer.disconnect(), 8000);
    });
  }

  function observeApplications(footer) {
    const appsBlock = footer.querySelector('[data-veloura-footer-apps]');
    if (!appsBlock || appsBlock.dataset.velouraFooterObserver === '1') return;

    appsBlock.dataset.velouraFooterObserver = '1';
    let scheduled = false;

    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;

      window.requestAnimationFrame(() => {
        scheduled = false;
        restoreImages(appsBlock);
        arrangeApplications(footer);
      });
    });

    observer.observe(appsBlock, { childList: true, subtree: true });

    window.setTimeout(() => {
      observer.disconnect();
      arrangeApplications(footer);
    }, 8000);
  }

  function initFooter(footer) {
    if (!footer) return;

    restoreImages(footer);
    renderContactCards(footer);
    arrangeApplications(footer);
    observeContactSources(footer);
    observeApplications(footer);
  }

  function initAllFooters() {
    document
      .querySelectorAll('.store-footer.veloura-footer-enabled')
      .forEach(initFooter);
  }

  function initVelouraFooter() {
    if (eventsBound) {
      initAllFooters();
      return;
    }

    eventsBound = true;

    document.addEventListener('theme::ready', initAllFooters);

    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(initAllFooters, 150);
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllFooters, { once: true });
    } else {
      initAllFooters();
    }

    [300, 900, 1800, 3500].forEach(delay => {
      window.setTimeout(initAllFooters, delay);
    });
  }

  return initVelouraFooter;
})();

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    initVelouraFooter();
    this.initiateNotifier();
    this.initiateMobileMenu();
    if (header_is_sticky) {
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    
    // Ensure #more-menu-dropdown exists before running changeMenuDirection
    const menuDirInterval = setInterval(() => {
      if (document.querySelector('#more-menu-dropdown')) {
        this.changeMenuDirection();
        clearInterval(menuDirInterval);
      }
    }, 100);

    initTootTip();
    this.loadModalImgOnclick();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }

    changeMenuDirection() {
      setTimeout(() => {
        app.all('.root-level.has-children', item => {
          if (item.classList.contains('change-menu-dir')) return;
          app.on('mouseover', item, () => {
            let allSubMenus = item.querySelectorAll('.sub-menu');
            allSubMenus.forEach((submenu, idx) => {
              if (idx === 0) return;
              let rect = submenu.getBoundingClientRect();
              if (rect.left < 10 || rect.right > window.innerWidth - 10) {
                app.addClass(item, 'change-menu-dir');
              }
            });
          });
        });
      }, 1000);
    }

  loadModalImgOnclick(){
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
          img = modal.querySelector('img'),
          imgSrc = img.dataset.src;
        modal.open();

        if (img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings() {
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

isElementLoaded(selector){
  return new Promise((resolve=>{
    const interval=setInterval(()=>{
    if(document.querySelector(selector)){
      clearInterval(interval)
      return resolve(document.querySelector(selector))
    }
   },160)
}))

  
  };

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
    btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (window.enable_add_product_toast && data?.data?.googleTags?.event === "addToCart") {
        return;
      }
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 2000,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true
      })
    });
  }

  initiateMobileMenu() {
    /**
     * Veloura fix:
     * - نهيئ mmenu-light مرة واحدة فقط.
     * - يعمل على الجوال واللابتوب بعد تغيير media query إلى min-width: 0px.
     * - لا يعمل close ثم open بنفس الضغطة.
     * - لا يكرر عناصر القائمة ولا يكرر event listeners.
     */
    if (window.__velouraNativeMobileMenuInitPromise) {
      return window.__velouraNativeMobileMenuInitPromise;
    }

    window.__velouraNativeMobileMenuInitPromise = this.isElementLoaded('#mobile-menu').then((menu) => {
      if (!menu) {
        window.__velouraNativeMobileMenuInitPromise = null;
        return;
      }

      if (menu.dataset.velouraMmenuReady === '1') {
        return;
      }

      menu.dataset.velouraMmenuReady = '1';

      const mobileMenu = new MobileMenu(
        menu,
        "(min-width: 0px)",
        "( slidingSubmenus: false)"
      );

      salla.lang.onLoaded(() => {
        mobileMenu.navigation({
          title: salla.lang.get('blocks.header.main_menu')
        });
      });

      const drawer = mobileMenu.offcanvas({
        position: salla.config.get('theme.is_rtl') ? "right" : "left"
      });

      window.__velouraNativeMobileMenuDrawer = drawer;

      if (window.__velouraNativeMobileMenuEventsBound) {
        return;
      }

      window.__velouraNativeMobileMenuEventsBound = true;

      this.onClick("a[href='#mobile-menu']", event => {
        event.preventDefault();

        const activeDrawer = window.__velouraNativeMobileMenuDrawer || drawer;

        if (!activeDrawer) {
          return;
        }

        if (document.body.classList.contains('menu-opened')) {
          document.body.classList.remove('menu-opened');
          activeDrawer.close();
          return;
        }

        document.body.classList.add('menu-opened');
        activeDrawer.open();
      });

      this.onClick(".close-mobile-menu", event => {
        event.preventDefault();

        const activeDrawer = window.__velouraNativeMobileMenuDrawer || drawer;

        document.body.classList.remove('menu-opened');

        if (activeDrawer) {
          activeDrawer.close();
        }
      });

      this.onClick(".mm-ocd__backdrop", event => {
        const activeDrawer = window.__velouraNativeMobileMenuDrawer || drawer;

        document.body.classList.remove('menu-opened');

        if (activeDrawer) {
          activeDrawer.close();
        }
      });
    });

    return window.__velouraNativeMobileMenuInitPromise;
  }

  initiateStickyMenu() {
    let header = this.element('#mainnav'),
      height = this.element('#mainnav .inner')?.clientHeight;
    //when it's landing page, there is no header
    if (!header) {
      return;
    }

    window.addEventListener('load', () => setTimeout(() => this.setHeaderHeight(), 500))
    window.addEventListener('resize', () => this.setHeaderHeight())

    window.addEventListener('scroll', () => {
      window.scrollY >= header.offsetTop + height ? header.classList.add('fixed-pinned', 'animated') : header.classList.remove('fixed-pinned');
      window.scrollY >= 200 ? header.classList.add('fixed-header') : header.classList.remove('fixed-header', 'animated');
    }, { passive: true });
  }

  setHeaderHeight() {
    let height = this.element('#mainnav .inner').clientHeight,
      header = this.element('#mainnav');
    header.style.height = height + 'px';
  }

  initiateDropdowns() {
    this.onClick('.dropdown__trigger', ({ target: btn }) => {
      btn.parentElement.classList.toggle('is-opened');
      document.body.classList.toggle('dropdown--is-opened');
      // Click Outside || Click on close btn
      window.addEventListener('click', ({ target: element }) => {
        if (!element.closest('.dropdown__menu') && element !== btn || element.classList.contains('dropdown__close')) {
          btn.parentElement.classList.remove('is-opened');
          document.body.classList.remove('dropdown--is-opened');
        }
      });
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        if (!content) return;

        const state = { isOpen: false }

        const toggleState = (isOpen) => {
          state.isOpen = !isOpen;
          this.toggleElementClassIf([content, trigger], 'is-closed', 'is-opened', () => isOpen);
        }

        trigger.addEventListener('click', () => {
          const { isOpen } = state;
          toggleState(isOpen);
        });
      });
  }


  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerHTML = salla.money(summary.total));
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }
}

salla.onReady(() => (new App).loadTheApp());


document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.veloura-counter');

  const animateCounter = (element) => {
    if (element.dataset.animated) return;

    element.dataset.animated = 'true';

    const originalText = element.textContent.trim();
    const match = originalText.match(/(\d+)/);

    if (!match) return;

    const target = parseInt(match[1], 10);
    const prefix = originalText.slice(0, match.index);
    const suffix = originalText.slice(match.index + match[1].length);

    const duration = 4000;
    const startTime = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * target);

      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = originalText;
      }
    };

    requestAnimationFrame(update);
  };

  counters.forEach((counter) => {
    const startOnView = counter.dataset.startOnView === 'true';

    if (!startOnView) {
      animateCounter(counter);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    observer.observe(counter);
  });
});


document.addEventListener('click', function (e) {
  const button = e.target.closest('.veloura-faq__question');
  if (!button) return;

  const item = button.closest('.veloura-faq__item');
  const answer = item.querySelector('.veloura-faq__answer');

  if (!item || !answer) return;

  const isOpen = item.classList.contains('is-open');

  if (isOpen) {
    answer.style.height = answer.scrollHeight + 'px';

    requestAnimationFrame(() => {
      item.classList.remove('is-open');
      answer.style.height = '0px';
    });
  } else {
    item.classList.add('is-open');
    answer.style.height = answer.scrollHeight + 'px';

    answer.addEventListener('transitionend', function handler() {
      if (item.classList.contains('is-open')) {
        answer.style.height = 'auto';
      }
      answer.removeEventListener('transitionend', handler);
    });
  }
});

function initVelouraTitleNextSection() {
  document.querySelectorAll('.veloura-title.is-title-next-section').forEach((titleBlock) => {
    let next = titleBlock.nextElementSibling;

    while (next && (!next.classList || !next.classList.contains('s-block'))) {
      next = next.nextElementSibling;
    }

    if (!next) return;

    next.classList.add('has-veloura-title-before');

    next.style.setProperty('margin-top', '1rem', 'important');
    next.style.setProperty('padding-top', '0', 'important');

    const sectionTitle = next.querySelector('.section-main-title, .s-block__title');

    if (sectionTitle) {
      sectionTitle.style.setProperty('display', 'none', 'important');
      sectionTitle.style.setProperty('margin', '0', 'important');
      sectionTitle.style.setProperty('padding', '0', 'important');
    }
  });
}

document.addEventListener('DOMContentLoaded', initVelouraTitleNextSection);
document.addEventListener('theme::ready', initVelouraTitleNextSection);
setTimeout(initVelouraTitleNextSection, 500);
setTimeout(initVelouraTitleNextSection, 1500);




/* ================================
   Veloura Dark Icon Switch
================================ */

function velouraUpdateDarkIcon() {
  const isDark =
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    document.body.getAttribute('data-theme') === 'dark';

  document.querySelectorAll('.veloura-dark-toggle__icon').forEach((icon) => {
    icon.classList.remove('sicon-moon', 'sicon-sun');
    icon.classList.add(isDark ? 'sicon-sun' : 'sicon-moon');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  velouraUpdateDarkIcon();

  document.querySelectorAll('.veloura-dark-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      setTimeout(velouraUpdateDarkIcon, 80);
      setTimeout(velouraUpdateDarkIcon, 250);
    });
  });

  const observer = new MutationObserver(() => {
    velouraUpdateDarkIcon();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  });
});


/* ================================
   Veloura Cart Total Hide Only
   تم حذف سكربت درج اللابتوب القديم لأنه يتعارض مع قائمة الجوال الأصلية
================================ */

document.addEventListener('DOMContentLoaded', () => {
  function velouraHideCartTotal() {
    document.querySelectorAll('.veloura-cart-hide-total').forEach((cart) => {
      cart.querySelectorAll('.s-cart-summary-total, .s-cart-summary-content').forEach((item) => {
        item.style.setProperty('display', 'none', 'important');
      });
    });
  }

  velouraHideCartTotal();

  const observer = new MutationObserver(() => {
    velouraHideCartTotal();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});





/* ================================
   Veloura Side Categories Settings Hook V5
   يمنع صورة التخفيضات من أخذ مكان صورة الرابط المخصصة
================================ */

(function () {
  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeKey(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/[?#].*$/, '')
      .replace(/\/+$/, '');
  }

  function getSettings() {
    return window.velouraSideCategoriesSettings || {};
  }

  function findMobileMenu() {
    return document.querySelector('#mobile-menu.mm-spn');
  }

  function getMainList(menu) {
    return menu && menu.querySelector('ul.main-menu');
  }

  function normalizeCollection(collection) {
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;

    if (typeof collection === 'object') {
      if (Array.isArray(collection.value)) return collection.value;
      if (Array.isArray(collection.selected)) return collection.selected;
      if (Array.isArray(collection.items)) return collection.items;
      if (Array.isArray(collection.data)) return collection.data;

      return Object.keys(collection).map(function (key) {
        return collection[key];
      });
    }

    return [];
  }

  function extractImageUrl(value) {
    if (!value) return '';

    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        var found = extractImageUrl(value[i]);
        if (found) return found;
      }
    }

    if (typeof value === 'object') {
      return (
        value.url ||
        value.src ||
        value.path ||
        value.image ||
        value.cdn ||
        value.value ||
        ''
      );
    }

    return '';
  }

  function allowSideImages(settings) {
    var value = String(
      settings.categoryImagesLocation ||
      settings.imageDisplayLocation ||
      'sidebar_and_page'
    );

    return (
      value === 'sidebar_and_page' ||
      value === 'sidebar_only' ||
      value === 'sidebar_and_related' ||
      value === 'side_and_category' ||
      value === 'side'
    );
  }

  function syncVisualModes(settings) {
  document.documentElement.classList.toggle(
    'veloura-side-cats-img-auto-width',
    settings.imageAutoWidth === true || settings.imageAutoWidth === 'true'
  );

  document.documentElement.classList.toggle(
    'veloura-side-cats-glass',
    settings.glass === true || settings.glass === 'true'
  );
}

  function createImage(src, extraClass) {
    if (!src) return null;

    var img = document.createElement('img');
    img.className = 'veloura-side-menu-img ' + (extraClass || '');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';

    return img;
  }

  function removeExistingImages(link) {
    link.querySelectorAll('img').forEach(function (img) {
      img.remove();
    });
  }

  function setImageOnLink(link, src, type) {
    if (!link || !src) return;

    removeExistingImages(link);

    var img = createImage(src, type === 'custom-link' ? 'veloura-side-menu-img-custom-link' : 'veloura-side-menu-img-custom');

    if (!img) return;

    link.insertBefore(img, link.firstChild);

    if (type === 'custom-link') {
      link.dataset.velouraOwnImage = '1';
    }

    if (type === 'mapped') {
      link.dataset.velouraMappedImage = '1';
    }

    if (type === 'special') {
      link.dataset.velouraSpecialImage = '1';
    }
  }

  function markNativeCategoryImages(menu) {
    menu.querySelectorAll('li > a > img, li > span > img').forEach(function (img) {
      img.classList.add('veloura-side-menu-img', 'veloura-side-menu-img-native');
    });
  }

  function getItemImage(item) {
    if (!item || typeof item !== 'object') return '';

    return extractImageUrl(
      item.veloura_map_image ||
      item.image ||
      item.img ||
      item.photo ||
      item.url ||
      ''
    );
  }

  function collectPrimitiveTokens(value, tokens) {
    tokens = tokens || [];

    function add(v) {
      var key = normalizeKey(v);
      if (key && tokens.indexOf(key) === -1) {
        tokens.push(key);
      }
    }

    if (value === null || value === undefined) return tokens;

    if (typeof value === 'string' || typeof value === 'number') {
      add(value);
      return tokens;
    }

    if (Array.isArray(value)) {
      value.forEach(function (item) {
        collectPrimitiveTokens(item, tokens);
      });
      return tokens;
    }

    if (typeof value === 'object') {
      [
        'label',
        'name',
        'title',
        'value',
        'id',
        'key',
        'url',
        'link',
        'slug',
        'selected',
        'items',
        'data'
      ].forEach(function (prop) {
        if (value[prop] !== undefined) {
          collectPrimitiveTokens(value[prop], tokens);
        }
      });
    }

    return tokens;
  }

  function getItemCategoryTokens(item) {
    if (!item || typeof item !== 'object') return [];

    var categories =
      item.veloura_map_categories ||
      item.categories ||
      item.category ||
      item.selected ||
      item.value ||
      [];

    return collectPrimitiveTokens(categories, []);
  }

  function getLinkTokens(link) {
    var li = link.closest('li');
    var tokens = [];

    function add(value) {
      var key = normalizeKey(value);
      if (key && tokens.indexOf(key) === -1) {
        tokens.push(key);
      }
    }

    add(link.textContent);
    add(link.getAttribute('href'));
    add(link.href);

    if (li) {
      add(li.id);
      add(li.getAttribute('id'));
      add(li.getAttribute('data-id'));
      add(li.getAttribute('data-category-id'));
      add(li.getAttribute('data-slug'));
      add(li.getAttribute('data-url'));
      add(li.getAttribute('data-menu-item'));
    }

    return tokens;
  }

  function isSameCategory(link, categoryTokens) {
    var linkTokens = getLinkTokens(link);

    return categoryTokens.some(function (categoryToken) {
      return linkTokens.some(function (linkToken) {
        if (!categoryToken || !linkToken) return false;
        if (linkToken === categoryToken) return true;

        if (linkToken.length >= 2 && categoryToken.length >= 2) {
          return (
            linkToken.indexOf(categoryToken) !== -1 ||
            categoryToken.indexOf(linkToken) !== -1
          );
        }

        return false;
      });
    });
  }

  function applyMappedCategoryImages(menu, settings) {
    var map = normalizeCollection(settings.categoryImagesMap);

    if (!map.length || !allowSideImages(settings)) return;

    var links = menu.querySelectorAll('li > a, li > span');

    map.forEach(function (item) {
      var image = getItemImage(item);
      var categoryTokens = getItemCategoryTokens(item);

      if (!image || !categoryTokens.length) return;

      links.forEach(function (link) {
        if (isSameCategory(link, categoryTokens)) {
          setImageOnLink(link, image, 'mapped');
        }
      });
    });
  }

  function enhanceSpecialImages(menu, settings) {
    if (!allowSideImages(settings)) return;

    menu.querySelectorAll('li > a, li > span').forEach(function (link) {
      if (link.dataset.velouraOwnImage === '1') return;
      if (link.dataset.velouraMappedImage === '1') return;

      var text = normalizeText(link.textContent);

      if (
        settings.discountImage &&
        /تخفيض|تخفيضات|خصم|خصومات|عروض|العروض|عرض|offer|offers|discount|sale/i.test(text)
      ) {
        setImageOnLink(link, settings.discountImage, 'special');
      }

      if (
        settings.blogImage &&
        /مدونة|المدونة|blog/i.test(text)
      ) {
        setImageOnLink(link, settings.blogImage, 'special');
      }
    });
  }

  function appendCustomLinks(menu, settings) {
    var list = getMainList(menu);
    var links = normalizeCollection(settings.customLinks);

    if (!list || !links.length || list.dataset.velouraCustomLinksReady === '1') {
      return;
    }

    links.forEach(function (item, index) {
      if (!item) return;

      var label = normalizeText(item.label || item.title || item.name);
      var url = normalizeText(item.url || item.link);
      var image = extractImageUrl(item.image || item.img || item.photo || item.veloura_link_image);

      if (!label || !url) return;

      var li = document.createElement('li');
      li.className = 'veloura-side-custom-link';
      li.setAttribute('data-veloura-custom-link-index', String(index));

      var a = document.createElement('a');
      a.href = url;
      a.textContent = label;

      if (item.new_tab === true || item.new_tab === 'true') {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }

      li.appendChild(a);
      list.appendChild(li);

      if (image && allowSideImages(settings)) {
        setImageOnLink(a, image, 'custom-link');
      }
    });

    list.dataset.velouraCustomLinksReady = '1';
  }

  function applySideCategoriesSettings() {
    var menu = findMobileMenu();
    var settings = getSettings();

    syncVisualModes(settings);

    if (!menu) return;

    markNativeCategoryImages(menu);

    applyMappedCategoryImages(menu, settings);
    appendCustomLinks(menu, settings);
    enhanceSpecialImages(menu, settings);
    hideMatchingLinks(menu, settings);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applySideCategoriesSettings();
    setTimeout(applySideCategoriesSettings, 300);
    setTimeout(applySideCategoriesSettings, 900);
    setTimeout(applySideCategoriesSettings, 1800);
  });

  document.addEventListener('theme::ready', function () {
    applySideCategoriesSettings();
    setTimeout(applySideCategoriesSettings, 500);
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest("a[href='#mobile-menu']")) {
      setTimeout(applySideCategoriesSettings, 120);
      setTimeout(applySideCategoriesSettings, 500);
      setTimeout(applySideCategoriesSettings, 1200);
    }
  }, true);
})();

/* ================================
   Veloura Product Card Native Actions Safe Sync
   لا ينقل أزرار المفضلة والعرض السريع - فقط يضيف كلاسات للتحكم بالشكل
================================ */
(function () {
  function markCleanParents(el) {
    if (!el) return;

    var p = el.parentElement;
    var rounds = 0;

    while (p && rounds < 2) {
      if (
        !p.classList.contains('s-product-card-image') &&
        !p.classList.contains('s-product-card-entry')
      ) {
        p.classList.add('veloura-pc-action-parent-clean');
      }

      p = p.parentElement;
      rounds++;
    }
  }

  function pickRoot(el) {
    if (!el) return null;

    return (
      el.closest('.s-product-card-wishlist-btn') ||
      el.closest('.veloura-quick-view-btn') ||
      el.closest('.veloura-quick-view-button') ||
      el.closest('button') ||
      el.closest('a') ||
      el.closest('salla-button') ||
      el.closest('.s-button-element') ||
      el
    );
  }

  function markCard(card) {
    if (!card) return;

    var imageBox =
      card.querySelector('.s-product-card-image') ||
      card.querySelector('.veloura-quick-view-image-host') ||
      card;

    var wishlistRaw =
      card.querySelector('.s-product-card-wishlist-btn') ||
      card.querySelector('[class*="wishlist"]') ||
      card.querySelector('[class*="favorite"]') ||
      card.querySelector('[aria-label*="المفضلة"]') ||
      card.querySelector('[aria-label*="الأمنيات"]') ||
      card.querySelector('[aria-label*="wishlist"]');

    var quickRaw =
      card.querySelector('.veloura-quick-view-btn') ||
      card.querySelector('.veloura-quick-view-button') ||
      card.querySelector('[data-veloura-quick-view]') ||
      card.querySelector('[class*="quick-view"]');

    var wishlist = pickRoot(wishlistRaw);
    var quick = pickRoot(quickRaw);

    if (wishlist && !wishlist.closest('salla-add-product-button')) {
      wishlist.classList.add('veloura-pc-native-wish');
      markCleanParents(wishlist);
    }

    if (quick && !quick.closest('salla-add-product-button')) {
      quick.classList.add('veloura-pc-native-quick');
      markCleanParents(quick);
    }

    var promos = card.querySelectorAll(
      '.s-product-card-image [class*="promotion"], .s-product-card-image [class*="promo"], .s-product-card-image [class*="badge"], .s-product-card-image [class*="ribbon"]'
    );

    promos.forEach(function (promo) {
      promo.classList.add('veloura-pc-native-promo');
    });

    imageBox.classList.add('veloura-pc-image-actions-host');
  }

  function scanCards() {
    document.querySelectorAll('product-card, .s-product-card-entry').forEach(function (node) {
      var card = node.classList && node.classList.contains('s-product-card-entry')
        ? node
        : node.querySelector && node.querySelector('.s-product-card-entry');

      markCard(card || node);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    scanCards();
    setTimeout(scanCards, 300);
    setTimeout(scanCards, 900);
    setTimeout(scanCards, 1800);

    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(scanCards, 140);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(function () {
      observer.disconnect();
    }, 10000);
  });

  document.addEventListener('theme::ready', function () {
    scanCards();
    setTimeout(scanCards, 500);
  });
})();


/* ================================
   Veloura Quick View Full Product Modal
   نافذة عرض سريع كاملة: سعر، خصم، كمية، سلة، مفضلة، مشاركة، وصف منسق
================================ */
(function () {
  var state = {
    product: null,
    sourceCard: null,
    qty: 1,
    busy: false
  };

  function config() {
    return window.velouraQuickView || {};
  }

  function setting(name, fallback) {
    var value = config()[name];
    if (value === undefined || value === null || value === '') return fallback;
    if (value === 'false') return false;
    if (value === 'true') return true;
    return value;
  }

  function decodeHtml(value) {
    var text = String(value || '');

    if (!/[&<>]/.test(text)) {
      return text;
    }

    var textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value || text;
  }

  function stripHtmlText(value) {
    var text = String(value || '');

    // Salla currency icon sometimes arrives as text, encoded HTML, or real HTML.
    text = text
      .replace(/&lt;\s*i[^&]*sicon-sar[^&]*&gt;\s*&lt;\s*\/\s*i\s*&gt;/gi, ' ر.س ')
      .replace(/<\s*i[^>]*sicon-sar[^>]*>\s*<\s*\/\s*i\s*>/gi, ' ر.س ')
      .replace(/&lt;[^&]*&gt;/g, ' ')
      .replace(/<[^>]*>/g, ' ');

    return text;
  }

  function cleanText(value) {
    var text = decodeHtml(value);
    text = stripHtmlText(text);

    return String(text || '')
      .replace(/sicon-sar/gi, ' ر.س ')
      .replace(/SAR/gi, ' ر.س ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function firstValue() {
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  function readMoneyValue(value) {
    if (value === undefined || value === null || value === '') return '';

    if (typeof value === 'object') {
      return firstValue(
        value.amount,
        value.value,
        value.price,
        value.formatted,
        value.currency_amount,
        ''
      );
    }

    return value;
  }

  function formatMoney(value) {
    value = readMoneyValue(value);

    if (value === undefined || value === null || value === '') return '';

    if (typeof value === 'string' && /[ر$€£]|SAR|USD|AED/i.test(value)) {
      return cleanText(value);
    }

    var numeric = Number(String(value).replace(/[^0-9.]/g, ''));

    if (!Number.isNaN(numeric) && numeric > 0 && window.salla && salla.money) {
      try {
        return salla.money(numeric);
      } catch (error) {}
    }

    return cleanText(value);
  }

  function extractIdFromText(value) {
    value = String(value || '');
    var match = value.match(/(?:product-|product_id=|products\/|p)(\d{2,})/i);
    return match ? match[1] : '';
  }

  function getProductId(card, button) {
    var candidates = [
      button && button.dataset && button.dataset.productId,
      button && button.dataset && button.dataset.id,
      card && card.dataset && card.dataset.productId,
      card && card.dataset && card.dataset.id,
      card && card.getAttribute && card.getAttribute('product-id'),
      card && card.getAttribute && card.getAttribute('data-product-id'),
      card && card.id,
      card && card.querySelector && card.querySelector('[data-product-id]') && card.querySelector('[data-product-id]').dataset.productId,
      card && card.querySelector && card.querySelector('salla-add-product-button') && card.querySelector('salla-add-product-button').getAttribute('product-id'),
      card && card.querySelector && card.querySelector('salla-add-product-button') && card.querySelector('salla-add-product-button').getAttribute('product-id')
    ];

    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i]) {
        var direct = String(candidates[i]).replace(/[^0-9]/g, '');
        if (direct) return direct;
      }
    }

    var link = getProductUrl(card);
    return extractIdFromText(link);
  }

  function getProductUrl(card) {
    if (!card) return '#';

    var selectors = [
      'a.s-product-card-image',
      '.s-product-card-content-title a',
      '.s-product-card-content-main a',
      'a[href*="/products/"]',
      'a[href*="/product/"]',
      'a[href]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var link = card.querySelector(selectors[i]);
      if (link && link.href && link.getAttribute('href') !== '#') return link.href;
    }

    return '#';
  }

  function getImage(card) {
    if (!card) return '';

    var img = card.querySelector('.s-product-card-image img') || card.querySelector('img');

    if (!img) return '';

    return (
      img.currentSrc ||
      img.src ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-lazy-src') ||
      ''
    );
  }

  function getTitle(card) {
    if (!card) return '';

    var selectors = [
      '.s-product-card-content-title',
      '.s-product-card-title',
      '[class*="product-card"][class*="title"]',
      'h3',
      'h2',
      'a[title]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = card.querySelector(selectors[i]);
      if (!el) continue;
      var text = cleanText(el.getAttribute('title') || el.textContent);
      if (text) return text;
    }

    return 'المنتج';
  }

  function getCardDescription(card) {
    if (!card) return '';

    var selectors = [
      '.s-product-card-content-subtitle',
      '.s-product-card-content-description',
      '.s-product-card-description',
      '[class*="description"]',
      '[class*="subtitle"]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = card.querySelector(selectors[i]);
      if (!el) continue;
      var text = cleanText(el.textContent);
      if (text) return text;
    }

    return '';
  }

  function cleanPriceString(value) {
    var text = cleanText(value);

    text = text
      .replace(/<\/?[^>]+>/g, ' ')
      .replace(/&lt;\/?[^&]+&gt;/g, ' ')
      .replace(/class\s*=\s*['"]?sicon-sar['"]?/gi, ' ')
      .replace(/sicon-sar/gi, ' ر.س ')
      .replace(/SAR/gi, ' ر.س ')
      .replace(/\bi\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Fix duplicated currency words if any.
    text = text.replace(/(ر\.س\s*){2,}/g, 'ر.س ');

    return text;
  }

  function getCardPrice(card) {
    if (!card) return { price: '', regularPrice: '' };

    var priceText = '';
    var regularText = '';

    var oldEl =
      card.querySelector('del') ||
      card.querySelector('.s-product-card-price-old') ||
      card.querySelector('[class*="old-price"]') ||
      card.querySelector('[class*="regular-price"]');

    if (oldEl) regularText = cleanText(oldEl.textContent);

    var priceSelectors = [
      '.s-product-card-price',
      '.s-product-card-sale-price',
      '[class*="price"]'
    ];

    for (var i = 0; i < priceSelectors.length; i++) {
      var el = card.querySelector(priceSelectors[i]);
      if (!el) continue;
      var text = cleanText(el.textContent);
      if (text && text !== regularText) {
        priceText = text;
        break;
      }
    }

    priceText = cleanPriceString(priceText);
    regularText = cleanPriceString(regularText);

    return {
      price: priceText,
      regularPrice: regularText
    };
  }

  function readProductObject(response) {
    if (!response) return null;

    if (response.data && response.data.product) return response.data.product;
    if (response.data) return response.data;
    if (response.product) return response.product;

    return response;
  }

  function normalizeProductResponse(response) {
    var product = readProductObject(response);
    if (!product || typeof product !== 'object') return null;

    var image = '';
    if (product.image) {
      image = typeof product.image === 'string'
        ? product.image
        : firstValue(product.image.url, product.image.src, product.image.path);
    }

    if (!image && product.images && product.images.length) {
      var firstImage = product.images[0];
      image = typeof firstImage === 'string'
        ? firstImage
        : firstValue(firstImage.url, firstImage.src, firstImage.path);
    }

    var price = firstValue(
      readMoneyValue(product.sale_price),
      readMoneyValue(product.price),
      readMoneyValue(product.price_amount),
      readMoneyValue(product.price_after_discount)
    );

    var regularPrice = firstValue(
      readMoneyValue(product.regular_price),
      readMoneyValue(product.original_price),
      readMoneyValue(product.before_price),
      readMoneyValue(product.price_before),
      readMoneyValue(product.old_price)
    );

    return {
      id: firstValue(product.id, product.product_id, product.sku),
      name: cleanText(firstValue(product.name, product.title, product.product_name)),
      url: firstValue(product.url, product.link, product.product_url),
      image: image,
      price: formatMoney(price),
      regularPrice: formatMoney(regularPrice),
      sku: firstValue(product.sku, product.code, ''),
      description: cleanText(firstValue(product.description, product.short_description, product.subtitle, '')),
      raw: product
    };
  }

  async function fetchProductDetails(productId) {
    if (!productId || !window.salla || !salla.product || !salla.product.getDetails) return null;

    var attempts = [
      function () { return salla.product.getDetails(productId); },
      function () { return salla.product.getDetails({ id: productId }); },
      function () { return salla.product.getDetails({ product_id: productId }); }
    ];

    for (var i = 0; i < attempts.length; i++) {
      try {
        var response = await attempts[i]();
        var normalized = normalizeProductResponse(response);
        if (normalized) return normalized;
      } catch (error) {}
    }

    return null;
  }

  function parseJsonLd(doc) {
    var product = null;

    doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
      try {
        var parsed = JSON.parse(script.textContent || '{}');
        var items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach(function (item) {
          if (item && item['@type'] === 'Product') product = item;
          if (item && Array.isArray(item['@graph'])) {
            var found = item['@graph'].find(function (node) {
              return node && node['@type'] === 'Product';
            });
            if (found) product = found;
          }
        });
      } catch (error) {}
    });

    return product;
  }

  function getMeta(doc, selector) {
    var el = doc.querySelector(selector);
    return el ? el.getAttribute('content') : '';
  }

  async function fetchProductFromPage(url) {
    if (!url || url === '#') return null;

    try {
      var response = await fetch(url, { credentials: 'same-origin' });
      var html = await response.text();
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var jsonProduct = parseJsonLd(doc);
      var offers = jsonProduct && jsonProduct.offers;

      if (Array.isArray(offers)) offers = offers[0];

      var title =
        jsonProduct && jsonProduct.name ||
        cleanText(doc.querySelector('h1') && doc.querySelector('h1').textContent) ||
        getMeta(doc, 'meta[property="og:title"]');

      var description =
        jsonProduct && jsonProduct.description ||
        cleanText(doc.querySelector('.product__description, .s-product-description, [itemprop="description"], .content-entry') && doc.querySelector('.product__description, .s-product-description, [itemprop="description"], .content-entry').textContent) ||
        getMeta(doc, 'meta[property="og:description"]') ||
        getMeta(doc, 'meta[name="description"]');

      var image =
        jsonProduct && jsonProduct.image && (Array.isArray(jsonProduct.image) ? jsonProduct.image[0] : jsonProduct.image) ||
        getMeta(doc, 'meta[property="og:image"]') ||
        getMeta(doc, 'meta[name="twitter:image"]');

      var pageAddBtn = doc.querySelector('salla-add-product-button[product-id], [data-product-id]');
      var pageProductId = pageAddBtn && (pageAddBtn.getAttribute('product-id') || pageAddBtn.getAttribute('data-product-id'));

      var price = offers && firstValue(offers.price, offers.lowPrice);
      var regularPrice = '';

      var oldPriceEl = doc.querySelector('del, .old-price, .regular-price, [class*="old-price"], [class*="regular-price"]');
      if (oldPriceEl) regularPrice = cleanText(oldPriceEl.textContent);

      return {
        id: pageProductId || extractIdFromText(url),
        name: cleanText(title),
        url: url,
        image: image || '',
        price: formatMoney(price),
        regularPrice: cleanPriceString(regularPrice),
        description: cleanText(description)
      };
    } catch (error) {
      return null;
    }
  }

  function getCardData(button) {
    var card = button.closest('.s-product-card-entry') || button.closest('product-card');
    var cardPrice = getCardPrice(card);

    return {
      id: getProductId(card, button),
      name: getTitle(card),
      url: getProductUrl(card),
      image: getImage(card),
      price: cardPrice.price,
      regularPrice: cardPrice.regularPrice,
      description: getCardDescription(card),
      sourceCard: card
    };
  }

  function ensureStyles() {
    if (document.getElementById('veloura-qv-full-styles')) return;

    var style = document.createElement('style');
    style.id = 'veloura-qv-full-styles';
    style.textContent = `
      /* Veloura Quick View Direct CSS V11 */
      .veloura-qv-full{
        position:fixed!important;
        inset:0!important;
        z-index:2147483400!important;
        display:none;
        align-items:center!important;
        justify-content:center!important;
        padding:24px!important;
        direction:rtl!important;
      }
      .veloura-qv-full.is-open{display:flex!important}
      .veloura-qv-full__overlay{
        position:absolute!important;
        inset:0!important;
        background:rgba(15,23,42,.58)!important;
        backdrop-filter:blur(8px)!important;
        -webkit-backdrop-filter:blur(8px)!important;
      }
      .veloura-qv-full__dialog{
        position:relative!important;
        width:min(1040px,calc(100vw - 88px))!important;
        max-height:min(650px,88vh)!important;
        overflow:hidden!important;
        background:var(--veloura-quick-view-modal-bg,#fff)!important;
        color:var(--veloura-quick-view-modal-text,#111827)!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        box-shadow:0 28px 100px rgba(15,23,42,.32)!important;
        padding:0!important;
        animation:velouraQvFullZoom .22s ease both;
      }
      body.veloura-quick-view-animation-fade .veloura-qv-full__dialog{animation-name:velouraQvFullFade}
      body.veloura-quick-view-animation-slide_up .veloura-qv-full__dialog,
      body.veloura-quick-view-animation-slide-up .veloura-qv-full__dialog{animation-name:velouraQvFullSlide}

      .veloura-qv-full__close{
        position:absolute!important;
        top:16px!important;
        inset-inline-start:16px!important;
        width:46px!important;
        height:46px!important;
        border:0!important;
        border-radius:999px!important;
        background:rgba(255,255,255,.95)!important;
        color:#111827!important;
        font-size:24px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        cursor:pointer!important;
        z-index:7!important;
        box-shadow:0 10px 26px rgba(15,23,42,.16)!important;
      }

      .veloura-qv-full__grid{
        display:grid!important;
        direction:ltr!important;
        grid-template-columns:minmax(0,62%) minmax(280px,38%)!important;
        grid-template-areas:"content media"!important;
        min-height:560px!important;
        max-height:min(650px,88vh)!important;
        width:100%!important;
      }

      .veloura-qv-full__media{
        grid-area:media!important;
        position:relative!important;
        overflow:hidden!important;
        background:rgba(15,23,42,.045)!important;
        min-height:560px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
      }
      .veloura-qv-full__image{
        width:100%!important;
        height:100%!important;
        min-height:560px!important;
        object-fit:contain!important;
        object-position:center!important;
        display:block!important;
      }

      .veloura-qv-full__content{
        grid-area:content!important;
        direction:rtl!important;
        padding:34px 32px 26px!important;
        display:flex!important;
        flex-direction:column!important;
        gap:10px!important;
        min-width:0!important;
        overflow:hidden!important;
        width:100%!important;
        box-sizing:border-box!important;
      }

      .veloura-qv-full__top{
        position:relative!important;
        min-height:58px!important;
        display:block!important;
        margin-bottom:4px!important;
        direction:rtl!important;
        width:100%!important;
      }
      .veloura-qv-full__top>div:first-child{
        width:100%!important;
        padding-left:122px!important;
        padding-right:0!important;
        box-sizing:border-box!important;
        text-align:right!important;
        direction:rtl!important;
      }
      .veloura-qv-full__actions{
        position:absolute!important;
        top:0!important;
        left:0!important;
        right:auto!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        z-index:2!important;
      }
      .veloura-qv-full__circle{
        width:48px!important;
        height:48px!important;
        border:0!important;
        border-radius:999px!important;
        background:var(--veloura-quick-view-button-bg,#004d65)!important;
        color:var(--veloura-quick-view-button-text,#fff)!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        cursor:pointer!important;
        font-size:18px!important;
        box-shadow:0 12px 28px rgba(15,23,42,.14)!important;
      }
      .veloura-qv-full__loading{font-size:12px!important;opacity:.65!important;display:none}
      .veloura-qv-full.is-loading .veloura-qv-full__loading{display:inline-flex!important}

      .veloura-qv-full__title{
        margin:0!important;
        font-size:31px!important;
        font-weight:900!important;
        line-height:1.3!important;
        color:inherit!important;
        text-align:right!important;
      }
      .veloura-qv-full__sku{display:none!important}

      .veloura-qv-full__price-row,
      .veloura-qv-full__mini-price{
        display:flex!important;
        align-items:baseline!important;
        gap:10px!important;
        flex-wrap:wrap!important;
        justify-content:flex-start!important;
        direction:rtl!important;
        min-height:32px!important;
      }
      .veloura-qv-full__price,
      .veloura-qv-full__mini-current{
        font-size:27px!important;
        font-weight:900!important;
        color:#ef4444!important;
      }
      .veloura-qv-full__regular,
      .veloura-qv-full__mini-regular{
        font-size:16px!important;
        opacity:.65!important;
        text-decoration:line-through!important;
      }

      .veloura-qv-full__divider{
        height:1px!important;
        background:currentColor!important;
        opacity:.16!important;
        margin:1px 0!important;
      }
      .veloura-qv-full__divider--bottom{margin-top:10px!important}

      .veloura-qv-full__desc{
        margin:0!important;
        font-size:15px!important;
        line-height:1.75!important;
        opacity:.88!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
        max-height:86px!important;
        overflow:auto!important;
        padding-inline-end:2px!important;
        text-align:right!important;
      }

      .veloura-qv-full__read-more{
        align-self:flex-start!important;
        height:38px!important;
        border-radius:999px!important;
        border:1px solid rgba(148,163,184,.42)!important;
        padding:0 18px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        color:inherit!important;
        font-weight:900!important;
        text-decoration:none!important;
        font-size:13px!important;
        opacity:.96!important;
        background:rgba(255,255,255,.04)!important;
        margin-top:0!important;
      }

      .veloura-qv-full__bottom{
        margin-top:auto!important;
        display:flex!important;
        flex-direction:column!important;
        gap:10px!important;
        padding-top:6px!important;
      }

      .veloura-qv-full__row{
        display:grid!important;
        grid-template-columns:minmax(160px,max-content) 1fr!important;
        align-items:center!important;
        gap:14px!important;
        direction:ltr!important;
      }

      .veloura-qv-full__label{
        display:block!important;
        font-size:15px!important;
        font-weight:900!important;
        margin:0!important;
        opacity:.92!important;
        text-align:right!important;
        justify-self:end!important;
        direction:rtl!important;
      }

      .veloura-qv-full__qty{
        display:grid!important;
        grid-template-columns:50px 66px 50px!important;
        height:46px!important;
        border:1px solid rgba(148,163,184,.58)!important;
        border-radius:9px!important;
        overflow:hidden!important;
        width:max-content!important;
        max-width:100%!important;
      }
      .veloura-qv-full__qty button{
        border:0!important;
        background:transparent!important;
        color:inherit!important;
        font-size:24px!important;
        font-weight:800!important;
        cursor:pointer!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
      }
      .veloura-qv-full__qty input{
        border:0!important;
        background:var(--veloura-quick-view-button-bg,#004d65)!important;
        color:var(--veloura-quick-view-button-text,#fff)!important;
        text-align:center!important;
        font-size:18px!important;
        font-weight:900!important;
        width:100%!important;
      }

      .veloura-qv-full__add{
        height:50px!important;
        border:0!important;
        border-radius:10px!important;
        background:var(--veloura-quick-view-button-bg,#004d65)!important;
        color:var(--veloura-quick-view-button-text,#fff)!important;
        font-weight:900!important;
        font-size:15px!important;
        cursor:pointer!important;
        width:100%!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        box-shadow:0 12px 30px rgba(0,77,101,.18)!important;
      }
      .veloura-qv-full__add.is-busy{opacity:.68!important;pointer-events:none!important}

      .veloura-qv-full__link{display:none!important}
      .veloura-qv-full__hidden{display:none!important}

      @media(max-width:767px){
        .veloura-qv-full{
          padding:18px 24px!important;
          align-items:flex-start!important;
          justify-content:center!important;
          overflow-y:auto!important;
        }
        .veloura-qv-full__dialog{
          width:100%!important;
          max-width:430px!important;
          max-height:86vh!important;
          overflow:auto!important;
          border-radius:22px!important;
          margin:0 auto!important;
        }
        .veloura-qv-full__grid{
          display:grid!important;
          direction:ltr!important;
          grid-template-columns:1fr!important;
          grid-template-areas:"media" "content"!important;
          min-height:0!important;
          max-height:none!important;
          width:100%!important;
        }
        .veloura-qv-full__media{
          grid-area:media!important;
          width:100%!important;
          min-height:285px!important;
          height:315px!important;
          max-height:315px!important;
          overflow:hidden!important;
          border-radius:22px 22px 0 0!important;
        }
        .veloura-qv-full__image{
          min-height:0!important;
          height:100%!important;
          max-height:none!important;
          width:100%!important;
          object-fit:contain!important;
          object-position:center!important;
        }
        .veloura-qv-full__close{
          top:14px!important;
          inset-inline-start:14px!important;
          width:42px!important;
          height:42px!important;
          font-size:22px!important;
        }
        .veloura-qv-full__content{
          grid-area:content!important;
          direction:rtl!important;
          padding:15px 18px 17px!important;
          overflow:visible!important;
          gap:8px!important;
          width:100%!important;
        }
        .veloura-qv-full__top{
          min-height:44px!important;
          margin-bottom:1px!important;
        }
        .veloura-qv-full__top>div:first-child{
          width:100%!important;
          padding-left:98px!important;
          padding-right:0!important;
          box-sizing:border-box!important;
          text-align:right!important;
        }
        .veloura-qv-full__actions{
          top:0!important;
          left:0!important;
          right:auto!important;
          gap:8px!important;
        }
        .veloura-qv-full__circle{
          width:40px!important;
          height:40px!important;
          font-size:16px!important;
        }
        .veloura-qv-full__title{
          font-size:24px!important;
          line-height:1.25!important;
        }
        .veloura-qv-full__price,
        .veloura-qv-full__mini-current{
          font-size:22px!important;
          line-height:1.2!important;
        }
        .veloura-qv-full__regular,
        .veloura-qv-full__mini-regular{font-size:14px!important}
        .veloura-qv-full__desc{
          max-height:78px!important;
          font-size:14px!important;
          line-height:1.65!important;
          overflow:hidden!important;
          scrollbar-width:none!important;
        }
        .veloura-qv-full__read-more{
          height:34px!important;
          padding:0 14px!important;
          font-size:13px!important;
        }
        .veloura-qv-full__bottom{
          margin-top:4px!important;
          padding-top:2px!important;
          gap:8px!important;
        }
        .veloura-qv-full__row{
          display:grid!important;
          grid-template-columns:minmax(130px,max-content) 1fr!important;
          align-items:center!important;
          gap:10px!important;
          direction:ltr!important;
        }
        .veloura-qv-full__label{
          order:initial!important;
          align-self:auto!important;
          justify-self:end!important;
          text-align:right!important;
          font-size:14px!important;
          margin:0!important;
          direction:rtl!important;
        }
        .veloura-qv-full__qty{
          width:150px!important;
          height:42px!important;
          grid-template-columns:40px 70px 40px!important;
          justify-self:start!important;
        }
        .veloura-qv-full__qty button{font-size:22px!important}
        .veloura-qv-full__qty input{font-size:17px!important}
        .veloura-qv-full__mini-price{
          justify-content:flex-start!important;
          justify-self:start!important;
          min-height:24px!important;
        }
        .veloura-qv-full__add{
          height:46px!important;
          font-size:14px!important;
          border-radius:10px!important;
        }
        .veloura-qv-full__divider--bottom{margin-top:6px!important}
      }

      @media(max-width:420px){
        .veloura-qv-full{padding-left:20px!important;padding-right:20px!important}
        .veloura-qv-full__media{height:285px!important;max-height:285px!important;min-height:195px!important}
        .veloura-qv-full__row{grid-template-columns:minmax(112px,max-content) 1fr!important;gap:9px!important}
        .veloura-qv-full__qty{width:144px!important;grid-template-columns:38px 68px 38px!important}
      }


      /* V12: تكبير صورة الجوال وإخفاء سكرول الوصف */
      @media(max-width:767px){
        .veloura-qv-full__media{
          background:rgba(15,23,42,.035)!important;
        }

        .veloura-qv-full__image{
          transform:scale(1.16)!important;
          transform-origin:center!important;
        }

        .veloura-qv-full__desc{
          overflow:hidden!important;
          scrollbar-width:none!important;
          -ms-overflow-style:none!important;
        }

        .veloura-qv-full__desc::-webkit-scrollbar{
          display:none!important;
          width:0!important;
          height:0!important;
        }
      }

      @media(max-width:420px){
        .veloura-qv-full__image{
          transform:scale(1.14)!important;
        }
      }

      @keyframes velouraQvFullZoom{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      @keyframes velouraQvFullFade{from{opacity:0}to{opacity:1}}
      @keyframes velouraQvFullSlide{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      html.veloura-qv-full-lock{overflow:hidden!important}
    `;

    document.head.appendChild(style);
    console.info('[Veloura] Quick View Direct CSS V12 loaded');
  }

  function ensureModal() {
    ensureStyles();

    var modal = document.querySelector('.veloura-qv-full');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'veloura-qv-full';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="veloura-qv-full__overlay" data-veloura-qv-full-close></div>
      <div class="veloura-qv-full__dialog" role="dialog" aria-modal="true">
        <button type="button" class="veloura-qv-full__close" data-veloura-qv-full-close aria-label="إغلاق">×</button>
        <div class="veloura-qv-full__grid">
          <div class="veloura-qv-full__media">
            <img class="veloura-qv-full__image" src="" alt="">
          </div>
          <div class="veloura-qv-full__content">
            <div class="veloura-qv-full__top">
              <div>
                <h3 class="veloura-qv-full__title"></h3>
                <span class="veloura-qv-full__loading">جاري تحميل التفاصيل...</span>
              </div>
              <div class="veloura-qv-full__actions">
                <button type="button" class="veloura-qv-full__circle" data-veloura-qv-share aria-label="مشاركة"><i class="sicon-share"></i></button>
                <button type="button" class="veloura-qv-full__circle" data-veloura-qv-wishlist aria-label="المفضلة"><i class="sicon-heart"></i></button>
              </div>
            </div>
            <span class="veloura-qv-full__sku"></span>
            <div class="veloura-qv-full__price-row">
              <strong class="veloura-qv-full__price"></strong>
              <span class="veloura-qv-full__regular"></span>
            </div>
            <div class="veloura-qv-full__divider"></div>
            <p class="veloura-qv-full__desc"></p>
            <a class="veloura-qv-full__read-more" href="#">عرض المزيد</a>
            <div class="veloura-qv-full__bottom">
              <div class="veloura-qv-full__row veloura-qv-full__row--qty">
                <div class="veloura-qv-full__qty">
                  <button type="button" data-veloura-qv-qty-minus>−</button>
                  <input type="number" min="1" value="1" data-veloura-qv-qty>
                  <button type="button" data-veloura-qv-qty-plus>+</button>
                </div>
                <span class="veloura-qv-full__label">الكمية</span>
              </div>
              <div class="veloura-qv-full__row veloura-qv-full__row--price">
                <div class="veloura-qv-full__mini-price">
                  <strong class="veloura-qv-full__mini-current"></strong>
                  <span class="veloura-qv-full__mini-regular"></span>
                </div>
                <span class="veloura-qv-full__label">السعر</span>
              </div>
              <button type="button" class="veloura-qv-full__add" data-veloura-qv-add>
                <i class="sicon-shopping-bag"></i>
                <span>إضافة للسلة</span>
              </button>
              <div class="veloura-qv-full__divider veloura-qv-full__divider--bottom"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', function (event) {
      if (event.target.closest('[data-veloura-qv-full-close]')) closeModal();
      if (event.target.closest('[data-veloura-qv-qty-minus]')) changeQty(-1);
      if (event.target.closest('[data-veloura-qv-qty-plus]')) changeQty(1);
      if (event.target.closest('[data-veloura-qv-add]')) addCurrentToCart();
      if (event.target.closest('[data-veloura-qv-wishlist]')) triggerWishlist();
      if (event.target.closest('[data-veloura-qv-share]')) shareCurrentProduct();
    });

    modal.addEventListener('input', function (event) {
      if (event.target.matches('[data-veloura-qv-qty]')) {
        state.qty = Math.max(1, parseInt(event.target.value || '1', 10));
        event.target.value = state.qty;
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });

    return modal;
  }

  function toggle(el, show) {
    if (!el) return;
    el.classList.toggle('veloura-qv-full__hidden', !show);
  }

  function render(data, loading) {
    var modal = ensureModal();
    state.product = data;

    modal.classList.toggle('is-loading', !!loading);

    var image = modal.querySelector('.veloura-qv-full__image');
    var title = modal.querySelector('.veloura-qv-full__title');
    var sku = modal.querySelector('.veloura-qv-full__sku');
    var price = modal.querySelector('.veloura-qv-full__price');
    var regular = modal.querySelector('.veloura-qv-full__regular');
    var desc = modal.querySelector('.veloura-qv-full__desc');
    var readMore = modal.querySelector('.veloura-qv-full__read-more');
    var actions = modal.querySelector('.veloura-qv-full__actions');
    var bottom = modal.querySelector('.veloura-qv-full__bottom');
    var qtyWrap = modal.querySelector('.veloura-qv-full__row--qty');
    var add = modal.querySelector('.veloura-qv-full__add');
    var miniPrice = modal.querySelector('.veloura-qv-full__row--price');
    var miniCurrent = modal.querySelector('.veloura-qv-full__mini-current');
    var miniRegular = modal.querySelector('.veloura-qv-full__mini-regular');

    title.textContent = data.name || 'المنتج';
    var cleanSku = cleanText(data.sku || '').replace(/^-+|-+$/g, '');
    sku.textContent = cleanSku ? ('SKU: ' + cleanSku) : '';
    data.price = cleanPriceString(data.price || '');
    data.regularPrice = cleanPriceString(data.regularPrice || '');

    price.textContent = data.price || '';
    regular.textContent = data.regularPrice && data.regularPrice !== data.price ? data.regularPrice : '';
    miniCurrent.textContent = data.price || '';
    miniRegular.textContent = data.regularPrice && data.regularPrice !== data.price ? data.regularPrice : '';
    desc.textContent = data.description || '';
    image.src = data.image || '';
    image.alt = data.name || '';
    readMore.href = data.url || '#';

    toggle(price.parentElement, setting('showPrice', true) && !!(data.price || data.regularPrice));
    toggle(regular, setting('showDiscount', true) && !!regular.textContent);
    toggle(desc, setting('showDescription', true) && !!data.description);
    toggle(readMore, setting('showProductLink', true));
    toggle(actions.querySelector('[data-veloura-qv-wishlist]'), setting('showWishlist', true));
    toggle(actions.querySelector('[data-veloura-qv-share]'), setting('showShare', true));
    toggle(actions, setting('showWishlist', true) || setting('showShare', true));
    toggle(bottom, setting('showAddToCart', true) || setting('showPrice', true));
    toggle(qtyWrap, setting('showAddToCart', true) && setting('showQuantity', true));
    toggle(miniPrice, setting('showPrice', true) && !!(data.price || data.regularPrice));
    toggle(add, setting('showAddToCart', true));
  }

  function openModal() {
    var modal = ensureModal();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('veloura-qv-full-lock');
  }

  function closeModal() {
    var modal = document.querySelector('.veloura-qv-full');
    if (!modal) return;
    modal.classList.remove('is-open', 'is-loading');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('veloura-qv-full-lock');
    state.busy = false;
  }

  function changeQty(delta) {
    var modal = ensureModal();
    var input = modal.querySelector('[data-veloura-qv-qty]');
    state.qty = Math.max(1, (state.qty || 1) + delta);
    input.value = state.qty;
  }

  async function addCurrentToCart() {
    if (state.busy || !state.product) return;

    var product = state.product;
    var modal = ensureModal();
    var button = modal.querySelector('[data-veloura-qv-add]');
    var qty = Math.max(1, state.qty || 1);

    if (!product.id) {
      if (product.url && product.url !== '#') window.location.href = product.url;
      return;
    }

    state.busy = true;
    button.classList.add('is-busy');

    var attempts = [];

    if (window.salla && salla.cart && salla.cart.addItem) {
      attempts.push(function () { return salla.cart.addItem(product.id, qty); });
      attempts.push(function () { return salla.cart.addItem({ id: product.id, quantity: qty }); });
      attempts.push(function () { return salla.cart.addItem({ product_id: product.id, quantity: qty }); });
    }

    if (window.salla && salla.product && salla.product.addToCart) {
      attempts.push(function () { return salla.product.addToCart(product.id, qty); });
      attempts.push(function () { return salla.product.addToCart({ id: product.id, quantity: qty }); });
    }

    for (var i = 0; i < attempts.length; i++) {
      try {
        await attempts[i]();
        if (window.salla && salla.notify) {
          salla.notify.success('تمت إضافة المنتج للسلة');
        }
        state.busy = false;
        button.classList.remove('is-busy');
        return;
      } catch (error) {}
    }

    state.busy = false;
    button.classList.remove('is-busy');

    if (window.salla && salla.notify) {
      salla.notify.warning('افتح صفحة المنتج لاختيار الخيارات ثم الإضافة للسلة');
    }

    if (product.url && product.url !== '#') {
      window.location.href = product.url;
    }
  }

  function triggerWishlist() {
    if (state.sourceCard) {
      var wishlist =
        state.sourceCard.querySelector('.s-product-card-wishlist-btn') ||
        state.sourceCard.querySelector('[class*="wishlist"]') ||
        state.sourceCard.querySelector('[class*="favorite"]') ||
        state.sourceCard.querySelector('[aria-label*="المفضلة"]') ||
        state.sourceCard.querySelector('[aria-label*="wishlist"]');

      if (wishlist) {
        wishlist.click();
        return;
      }
    }

    if (window.salla && salla.notify) {
      salla.notify.info('أضف المنتج للمفضلة من صفحة المنتج');
    }
  }

  async function shareCurrentProduct() {
    if (!state.product) return;

    var data = {
      title: state.product.name || document.title,
      text: state.product.name || '',
      url: state.product.url || window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {}
    }

    try {
      await navigator.clipboard.writeText(data.url);
      if (window.salla && salla.notify) salla.notify.success('تم نسخ رابط المنتج');
    } catch (error) {
      window.prompt('انسخ رابط المنتج', data.url);
    }
  }

  async function openQuickView(button) {
    var cardData = getCardData(button);
    state.sourceCard = cardData.sourceCard;
    state.qty = 1;

    render(cardData, !!(cardData.id || cardData.url));
    openModal();

    var details = null;

    if (cardData.id) {
      details = await fetchProductDetails(cardData.id);
    }

    if (!details && cardData.url && cardData.url !== '#') {
      details = await fetchProductFromPage(cardData.url);
    }

    if (details) {
      render({
        id: firstValue(details.id, cardData.id),
        name: firstValue(details.name, cardData.name),
        url: firstValue(details.url, cardData.url),
        image: firstValue(details.image, cardData.image),
        price: firstValue(details.price, cardData.price),
        regularPrice: firstValue(details.regularPrice, cardData.regularPrice),
        sku: firstValue(details.sku, ''),
        description: firstValue(details.description, cardData.description),
        sourceCard: cardData.sourceCard
      }, false);
    } else {
      render(cardData, false);
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest(
      '.veloura-quick-view-btn, .veloura-quick-view-button, [data-veloura-quick-view], .veloura-pc-native-quick'
    );

    if (!button) return;
    if (button.closest('.veloura-qv-full')) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    openQuickView(button);
  }, true);
})();