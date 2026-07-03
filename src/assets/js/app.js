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












