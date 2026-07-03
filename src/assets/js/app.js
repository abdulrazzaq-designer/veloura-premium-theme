import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
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

  function cleanText(value) {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
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
        regularPrice: regularPrice,
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
      .veloura-qv-full{position:fixed;inset:0;z-index:2147483400;display:none;align-items:center;justify-content:center;padding:18px;direction:rtl}
      .veloura-qv-full.is-open{display:flex}
      .veloura-qv-full__overlay{position:absolute;inset:0;background:rgba(15,23,42,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
      .veloura-qv-full__dialog{position:relative;width:min(1120px,100%);max-height:min(760px,94vh);overflow:auto;background:var(--veloura-quick-view-modal-bg,#fff);color:var(--veloura-quick-view-modal-text,#111827);border-radius:var(--veloura-quick-view-modal-radius,28px);box-shadow:0 28px 100px rgba(15,23,42,.32);padding:0;animation:velouraQvFullZoom .22s ease both}
      body.veloura-quick-view-animation-fade .veloura-qv-full__dialog{animation-name:velouraQvFullFade}
      body.veloura-quick-view-animation-slide_up .veloura-qv-full__dialog,body.veloura-quick-view-animation-slide-up .veloura-qv-full__dialog{animation-name:velouraQvFullSlide}
      .veloura-qv-full__close{position:absolute;top:14px;inset-inline-end:14px;width:42px;height:42px;border:0;border-radius:999px;background:rgba(255,255,255,.9);color:#111827;font-size:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:4;box-shadow:0 10px 26px rgba(15,23,42,.18)}
      .veloura-qv-full__grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);min-height:540px}
      .veloura-qv-full__media{position:relative;overflow:hidden;background:rgba(15,23,42,.06);min-height:540px;order:2}
      .veloura-qv-full__image{width:100%;height:100%;min-height:540px;object-fit:cover;display:block}
      .veloura-qv-full__content{padding:34px 34px 28px;display:flex;flex-direction:column;gap:18px;order:1}
      .veloura-qv-full__top{display:flex;justify-content:space-between;align-items:center;gap:12px}
      .veloura-qv-full__actions{display:flex;align-items:center;gap:10px}
      .veloura-qv-full__circle{width:44px;height:44px;border:0;border-radius:999px;background:var(--veloura-quick-view-button-bg,#004d65);color:var(--veloura-quick-view-button-text,#fff);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px}
      .veloura-qv-full__loading{font-size:12px;opacity:.65;display:none}
      .veloura-qv-full.is-loading .veloura-qv-full__loading{display:inline-flex}
      .veloura-qv-full__title{margin:0;font-size:26px;font-weight:900;line-height:1.45;color:inherit}
      .veloura-qv-full__sku{font-size:13px;opacity:.65;display:none}
      .veloura-qv-full__sku:not(:empty){display:block}
      .veloura-qv-full__price-row{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
      .veloura-qv-full__price{font-size:24px;font-weight:900;color:#ef4444}
      .veloura-qv-full__regular{font-size:15px;opacity:.65;text-decoration:line-through}
      .veloura-qv-full__divider{height:1px;background:currentColor;opacity:.12;margin:0}
      .veloura-qv-full__desc{margin:0;font-size:14px;line-height:1.9;opacity:.82;white-space:normal;overflow-wrap:anywhere;word-break:break-word;max-height:150px;overflow:auto}
      .veloura-qv-full__read-more{align-self:flex-start;color:inherit;font-weight:800;text-decoration:none;font-size:13px;opacity:.85}
      .veloura-qv-full__buy{display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:end;margin-top:auto}
      .veloura-qv-full__label{display:block;font-size:13px;font-weight:900;margin-bottom:8px;opacity:.82}
      .veloura-qv-full__qty{display:grid;grid-template-columns:44px 1fr 44px;height:48px;border:1px solid rgba(148,163,184,.6);border-radius:10px;overflow:hidden;max-width:160px}
      .veloura-qv-full__qty button{border:0;background:transparent;color:inherit;font-size:24px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
      .veloura-qv-full__qty input{border:0;background:var(--veloura-quick-view-button-bg,#004d65);color:var(--veloura-quick-view-button-text,#fff);text-align:center;font-size:18px;font-weight:900;width:100%}
      .veloura-qv-full__add{height:48px;border:0;border-radius:10px;background:var(--veloura-quick-view-button-bg,#004d65);color:var(--veloura-quick-view-button-text,#fff);font-weight:900;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px}
      .veloura-qv-full__add.is-busy{opacity:.68;pointer-events:none}
      .veloura-qv-full__link{height:44px;border-radius:999px;border:1px solid rgba(148,163,184,.42);padding:0 18px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:inherit;font-weight:800;align-self:flex-start}
      .veloura-qv-full__hidden{display:none!important}
      @media(max-width:767px){.veloura-qv-full{padding:10px}.veloura-qv-full__dialog{border-radius:22px}.veloura-qv-full__grid{grid-template-columns:1fr;min-height:0}.veloura-qv-full__media{order:1;min-height:260px}.veloura-qv-full__image{min-height:260px;max-height:360px}.veloura-qv-full__content{order:2;padding:22px 18px}.veloura-qv-full__buy{grid-template-columns:1fr}.veloura-qv-full__title{font-size:21px}.veloura-qv-full__price{font-size:21px}}
      @keyframes velouraQvFullZoom{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      @keyframes velouraQvFullFade{from{opacity:0}to{opacity:1}}
      @keyframes velouraQvFullSlide{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      html.veloura-qv-full-lock{overflow:hidden!important}
    `;

    document.head.appendChild(style);
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
              <span class="veloura-qv-full__loading">جاري تحميل التفاصيل...</span>
              <div class="veloura-qv-full__actions">
                <button type="button" class="veloura-qv-full__circle" data-veloura-qv-share aria-label="مشاركة"><i class="sicon-share"></i></button>
                <button type="button" class="veloura-qv-full__circle" data-veloura-qv-wishlist aria-label="المفضلة"><i class="sicon-heart"></i></button>
              </div>
            </div>
            <h3 class="veloura-qv-full__title"></h3>
            <span class="veloura-qv-full__sku"></span>
            <div class="veloura-qv-full__price-row">
              <strong class="veloura-qv-full__price"></strong>
              <span class="veloura-qv-full__regular"></span>
            </div>
            <div class="veloura-qv-full__divider"></div>
            <p class="veloura-qv-full__desc"></p>
            <a class="veloura-qv-full__read-more" href="#">قراءة المزيد ↗</a>
            <div class="veloura-qv-full__buy">
              <div class="veloura-qv-full__qty-wrap">
                <span class="veloura-qv-full__label">الكمية</span>
                <div class="veloura-qv-full__qty">
                  <button type="button" data-veloura-qv-qty-minus>−</button>
                  <input type="number" min="1" value="1" data-veloura-qv-qty>
                  <button type="button" data-veloura-qv-qty-plus>+</button>
                </div>
              </div>
              <div>
                <span class="veloura-qv-full__label">السعر</span>
                <button type="button" class="veloura-qv-full__add" data-veloura-qv-add>
                  <i class="sicon-shopping-bag"></i>
                  <span>إضافة للسلة</span>
                </button>
              </div>
            </div>
            <a class="veloura-qv-full__link" href="#">${setting('productLinkText', 'عرض تفاصيل المنتج')}</a>
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
    var link = modal.querySelector('.veloura-qv-full__link');
    var actions = modal.querySelector('.veloura-qv-full__actions');
    var buy = modal.querySelector('.veloura-qv-full__buy');
    var qtyWrap = modal.querySelector('.veloura-qv-full__qty-wrap');
    var add = modal.querySelector('.veloura-qv-full__add');

    title.textContent = data.name || 'المنتج';
    sku.textContent = data.sku ? ('SKU: ' + data.sku) : '';
    price.textContent = data.price || '';
    regular.textContent = data.regularPrice && data.regularPrice !== data.price ? data.regularPrice : '';
    desc.textContent = data.description || '';
    image.src = data.image || '';
    image.alt = data.name || '';
    link.href = data.url || '#';
    readMore.href = data.url || '#';

    toggle(price.parentElement, setting('showPrice', true) && !!(data.price || data.regularPrice));
    toggle(regular, setting('showDiscount', true) && !!regular.textContent);
    toggle(desc, setting('showDescription', true) && !!data.description);
    toggle(readMore, setting('showProductLink', true));
    toggle(link, setting('showProductLink', true));
    toggle(actions.querySelector('[data-veloura-qv-wishlist]'), setting('showWishlist', true));
    toggle(actions.querySelector('[data-veloura-qv-share]'), setting('showShare', true));
    toggle(actions, setting('showWishlist', true) || setting('showShare', true));
    toggle(buy, setting('showAddToCart', true));
    toggle(qtyWrap, setting('showQuantity', true));
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






/* ================================
   Veloura Quick View - إصلاح الترتيب والكمية والسلة
   ضعه في آخر ملف app.js
================================ */

(function () {
  'use strict';

  let lastQuickViewProduct = null;

  function cleanVisibleText(value) {
    let text = String(value || '');

    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;

    const div = document.createElement('div');
    div.innerHTML = text;
    text = div.textContent || div.innerText || text;

    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/sicon-sar/gi, ' ')
      .replace(/class=/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getAttr(node, names) {
    if (!node) return '';

    for (const name of names) {
      const value = node.getAttribute && node.getAttribute(name);
      if (value) return value;
    }

    return '';
  }

  function findProductId(root, url) {
    if (!root) return '';

    const fromRoot =
      getAttr(root, ['product-id', 'data-product-id', 'data-id', 'product']) ||
      (root.dataset && (root.dataset.productId || root.dataset.id));

    if (fromRoot) return String(fromRoot);

    const addButton = root.querySelector(
      'salla-add-product-button, [product-id], [data-product-id], [data-id]'
    );

    const fromButton =
      getAttr(addButton, ['product-id', 'data-product-id', 'data-id']) ||
      (addButton &&
        addButton.dataset &&
        (addButton.dataset.productId || addButton.dataset.id));

    if (fromButton) return String(fromButton);

    const matched =
      String(url || '').match(/\/p(\d+)/i) ||
      String(url || '').match(/[?&]product(?:_id)?=(\d+)/i);

    return matched && matched[1] ? matched[1] : '';
  }

  function getProductFromQuickButton(button) {
    const root =
      button.closest('.s-product-card-entry') ||
      button.closest('product-card') ||
      button.closest('[product-id]') ||
      button.closest('[data-product-id]');

    if (!root) return null;

    const titleLink =
      root.querySelector('.s-product-card-content-title a') ||
      root.querySelector('.s-product-card-content h3 a') ||
      root.querySelector('a[href*="/products/"]') ||
      root.querySelector('a[href*="/p"]');

    const url = titleLink && titleLink.href ? titleLink.href : '#';

    return {
      id: findProductId(root, url),
      url: url
    };
  }

  document.addEventListener(
    'click',
    function (event) {
      const quickButton = event.target.closest('.veloura-quick-view-btn');

      if (!quickButton) return;

      lastQuickViewProduct = getProductFromQuickButton(quickButton);
    },
    true
  );

  function fixTexts(modal) {
    const title = modal.querySelector('.veloura-quick-view-modal__title');
    const price = modal.querySelector('.veloura-quick-view-modal__price');
    const description = modal.querySelector('.veloura-quick-view-modal__description');

    [title, price, description].forEach(function (el) {
      if (!el) return;

      const cleaned = cleanVisibleText(el.innerHTML || el.textContent);

      if (cleaned) {
        el.textContent = cleaned;
      }
    });
  }

  function createQtyControl(addButton) {
    const row = document.createElement('div');
    row.className = 'veloura-qv-qty-row';

    row.innerHTML = `
      <span class="veloura-qv-label">الكمية</span>
      <div class="veloura-qv-qty-control">
        <button type="button" class="veloura-qv-qty-btn" data-qv-plus aria-label="زيادة">+</button>
        <input class="veloura-qv-qty-input" type="number" min="1" value="1" inputmode="numeric">
        <button type="button" class="veloura-qv-qty-btn" data-qv-minus aria-label="نقصان">−</button>
      </div>
    `;

    const input = row.querySelector('.veloura-qv-qty-input');
    const plus = row.querySelector('[data-qv-plus]');
    const minus = row.querySelector('[data-qv-minus]');

    function syncQuantity() {
      let qty = parseInt(input.value, 10);

      if (!qty || qty < 1) {
        qty = 1;
      }

      input.value = qty;
      addButton.setAttribute('quantity', String(qty));
    }

    plus.addEventListener('click', function () {
      input.value = parseInt(input.value || '1', 10) + 1;
      syncQuantity();
    });

    minus.addEventListener('click', function () {
      input.value = Math.max(1, parseInt(input.value || '1', 10) - 1);
      syncQuantity();
    });

    input.addEventListener('input', syncQuantity);
    syncQuantity();

    return row;
  }

  function enhanceModal(modal) {
    if (!modal) return;

    modal.classList.add('veloura-qv-fixed');
    modal.setAttribute('dir', 'rtl');

    fixTexts(modal);

    const content = modal.querySelector('.veloura-quick-view-modal__content');
    const link = modal.querySelector('.veloura-quick-view-modal__link');

    if (!content) return;

    if (link) {
      link.textContent = 'منتجات';
      link.classList.add('veloura-qv-products-link');
    }

    let productId = '';

    if (lastQuickViewProduct && lastQuickViewProduct.id) {
      productId = lastQuickViewProduct.id;
    }

    if (!productId && link) {
      productId = findProductId(modal, link.href);
    }

    let buyBox = content.querySelector('.veloura-qv-buybox');

    if (!buyBox) {
      buyBox = document.createElement('div');
      buyBox.className = 'veloura-qv-buybox';
      content.appendChild(buyBox);
    }

    let addButton = buyBox.querySelector('salla-add-product-button');

    if (!addButton) {
      addButton = document.createElement('salla-add-product-button');
      addButton.className = 'veloura-qv-cart-button';
      addButton.setAttribute('product-status', 'sale');
      addButton.setAttribute('product-type', 'product');
      addButton.setAttribute('width', 'wide');
      addButton.setAttribute('quantity', '1');

      const qtyControl = createQtyControl(addButton);

      buyBox.appendChild(qtyControl);
      buyBox.appendChild(addButton);
    }

    if (productId) {
      addButton.style.display = '';
      addButton.setAttribute('product-id', productId);
    } else {
      addButton.style.display = 'none';
    }

    if (link && !buyBox.contains(link)) {
      buyBox.appendChild(link);
    }
  }

  function scanQuickView() {
    document.querySelectorAll('.veloura-quick-view-modal').forEach(enhanceModal);
  }

  document.addEventListener('DOMContentLoaded', scanQuickView);
  document.addEventListener('theme::ready', scanQuickView);

  const observer = new MutationObserver(function () {
    clearTimeout(window.__velouraQuickViewFixTimer);
    window.__velouraQuickViewFixTimer = setTimeout(scanQuickView, 60);
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
})();