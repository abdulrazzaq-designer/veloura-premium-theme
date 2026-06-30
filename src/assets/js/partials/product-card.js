import BasePage from '../base-page';
class ProductCard extends HTMLElement {
  constructor(){
    super()
  }
  
  connectedCallback(){
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product')); 

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady() )
    }
  }

  onReady(){
      this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
      this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
      this.getProps()

	  this.source = salla.config.get("page.slug");
      // If the card is in the landing page, hide the add button and show the quantity
	  if (this.source == "landing-page") {
	  	this.hideAddBtn = true;
	  	this.showQuantity = window.showQuantity;
	  }

      salla.lang.onLoaded(() => {
        // Language
        this.remained = salla.lang.get('pages.products.remained');
        this.donationAmount = salla.lang.get('pages.products.donation_amount');
        this.startingPrice = salla.lang.get('pages.products.starting_price');
        this.addToCart = salla.lang.get('pages.cart.add_to_cart');
        this.outOfStock = salla.lang.get('pages.products.out_of_stock');

        // re-render to update translations
        this.render();
      })
      
      this.render()
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  } 

  getProductBadge() {
    if (this.product?.preorder?.label) {
      return `<div class="s-product-card-promotion-title">${this.product.preorder.label}</div>`
    }

    if (this.product.promotion_title) {
      return `<div class="s-product-card-promotion-title">${this.product.promotion_title}</div>`
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div
        class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash')?'-':'';
    }

    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    }
    else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`
    }
    else{
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`
    }

    return price;
  }

  getAddButtonLabel() {
    if(this.product.has_preorder_campaign) {
        return salla.lang.get('pages.products.pre_order_now');
    }

    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now'); 
    }

    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }

    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }

    // donating
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps(){

    /**
     *  Horizontal card.
     */
    this.horizontal = this.hasAttribute('horizontal');
  
    /**
     *  Support shadow on hover.
     */
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
  
    /**
     *  Hide add to cart button.
     */
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
  
    /**
     *  Full image card.
     */
    this.fullImage = this.hasAttribute('fullImage');
  
    /**
     *  Minimal card.
     */
    this.minimal = this.hasAttribute('minimal');
  
    /**
     *  Special card.
     */
    this.isSpecial = this.hasAttribute('isSpecial');
  
    /**
     *  Show quantity.
     */
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  }

  render(){
    this.classList.add('s-product-card-entry'); 
    this.setAttribute('id', this.product.id);
    !this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal? this.classList.add('s-product-card-fit-height') : '';
    this.isSpecial? this.classList.add('s-product-card-special') : '';
    this.fullImage? this.classList.add('s-product-card-full-image') : '';
    this.minimal? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation?  this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover?  this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock?  this.classList.add('s-product-card-out-of-stock') : '';
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));
      this.innerHTML = `
        <div class="${!this.fullImage ? 's-product-card-image' : 's-product-card-image-full'}">
          <a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product?.image?.alt || this.product.name)}">
           <img 
              class="s-product-card-image-${salla.url.is_placeholder(this.product?.image?.url)
                ? 'contain'
                : this.fitImageHeight
                ? this.fitImageHeight
                : 'cover'}"
              src="${this.product?.image?.url || this.product?.thumbnail || this.placeholder || ''}"
              alt="${this.escapeHTML(this.product?.image?.alt || this.product.name)}"
              loading="lazy"
            />
            ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}
          </a>
          ${this.fullImage ? `<a href="${this.product?.url}" aria-label=${this.product.name} class="s-product-card-overlay"></a>`:''}
          ${!this.horizontal && !this.fullImage ?
            `<salla-button
              shape="icon"
              fill="outline"
              color="light"
              name="product-name-${this.product.id}"
              aria-label="Add or remove to wishlist"
              class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
              onclick="salla.wishlist.toggle(${this.product.id})"
              data-id="${this.product.id}">
              <i class="sicon-heart"></i>
            </salla-button>` : ``
          }
        </div>
        <div class="s-product-card-content">
          ${this.isSpecial && this.product?.quantity ?
            `<div class="s-product-card-content-pie">
              <span>
                <b>${salla.helpers.number(this.product?.quantity)}</b>
                ${this.remained}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 34" class="s-product-card-content-pie-svg">
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-base" />
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-bar" />
              </svg>
            </div>`
            : ``}

          <div class="s-product-card-content-main ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            <h3 class="s-product-card-content-title">
              <a href="${this.product?.url}">${this.product?.name}</a>
            </h3>

            ${this.product?.subtitle && !this.minimal ?
              `<p class="s-product-card-content-subtitle opacity-80">${this.product?.subtitle}</p>`
              : ``}
          </div>
          ${this.product?.donation && !this.minimal && !this.fullImage ?
          `<salla-progress-bar donation=${JSON.stringify(this.product?.donation)}></salla-progress-bar>
          <div class="s-product-card-donation-input">
            ${this.product?.donation?.can_donate && this.product?.donation?.custom_amount_enabled  ?
              `<label for="donation-amount-${this.product.id}">${this.donationAmount} <span>*</span></label>
              <input
                type="text"
                onInput="${e => {
                  salla.helpers.inputDigitsOnly(e.target);
                  this.addBtn.donatingAmount = (e.target).value;
                }}"
                id="donation-amount-${this.product.id}"
                name="donating_amount"
                class="s-form-control"
                placeholder="${this.donationAmount}" />`
              : ``}
          </div>`
            : ''}
          <div class="s-product-card-content-sub ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
            ${this.product?.rating?.stars ?
              `<div class="s-product-card-rating">
                <i class="sicon-star2 before:text-orange-300"></i>
                <span>${this.product.rating.stars}</span>
              </div>`
               : ``}
          </div>

          ${this.isSpecial && this.product.discount_ends
            ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true}
              labeled=${true} />`
            : ``}


          ${!this.hideAddBtn ?
            `<div class="s-product-card-content-footer gap-2">
              <salla-add-product-button fill="outline" width="wide"
                product-id="${this.product.id}"
                product-status="${this.product.status}"
                product-type="${this.product.type}">
                ${this.product.status == 'sale' ? 
                    `<i class="text-base sicon-${ this.product.type == 'booking' ? 'calendar-time' : 'shopping-bag'}"></i>` : ``
                  }
                <span>${this.product.add_to_cart_label ? this.product.add_to_cart_label : this.getAddButtonLabel() }</span>
              </salla-add-product-button>

              ${this.horizontal || this.fullImage ?
                `<salla-button 
                  shape="icon" 
                  fill="outline" 
                  color="light" 
                  id="card-wishlist-btn-${this.product.id}-horizontal"
                  aria-label="Add or remove to wishlist"
                  class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
                  onclick="salla.wishlist.toggle(${this.product.id})"
                  data-id="${this.product.id}">
                  <i class="sicon-heart"></i> 
                </salla-button>`
                : ``}
            </div>`
            : ``}
        </div>
      `

      this.querySelectorAll('[name="donating_amount"]').forEach((element)=>{
        element.addEventListener('input', (e) => {
          e.target
            .closest(".s-product-card-content")
            .querySelector("salla-add-product-button")
            .setAttribute("donating-amount", e.target.value); 
        });
      })

      if (this.product?.quantity && this.isSpecial) {
        this.initCircleBar();
      }

      // Optimistic & Per-card wishlist toggle
      this.querySelectorAll('.s-product-card-wishlist-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const willBeAdded = !btn.classList.contains('s-product-card-wishlist-added');
          app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => willBeAdded);
          app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => willBeAdded);
        });
      });
    }
}

customElements.define('custom-salla-product-card', ProductCard);
















/* Veloura Quick View - Stable Direct Replace */

(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    const config = window.velouraQuickView || {};

    if (config.enabled === false || config.enabled === 'false') {
      return;
    }

    function cleanText(value) {
      return (value || '').replace(/\s+/g, ' ').trim();
    }

    function normalizeSettingValue(value, fallback) {
      if (Array.isArray(value) && value[0]) {
        return value[0].value || value[0].selected || fallback;
      }

      if (value && typeof value === 'object') {
        if (Array.isArray(value.selected) && value.selected[0]) {
          return value.selected[0].value || fallback;
        }

        return value.value || value.selected || fallback;
      }

      return value || fallback;
    }

    function toBool(value, fallback) {
      if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on') {
        return true;
      }

      if (value === false || value === 'false' || value === 0 || value === '0' || value === 'off') {
        return false;
      }

      return fallback;
    }

    function replaceBodyClass(prefix, value) {
      Array.from(document.body.classList).forEach(function (className) {
        if (className.indexOf(prefix) === 0) {
          document.body.classList.remove(className);
        }
      });

      document.body.classList.add(prefix + value);
    }

    function getQuickViewPosition() {
      const raw = String(normalizeSettingValue(config.buttonPosition, 'wishlist_icon'));

      if (
        raw === 'below_add_to_cart' ||
        raw === 'below-add-to-cart' ||
        raw === 'inside_card' ||
        raw === 'inside-card'
      ) {
        return 'below_add_to_cart';
      }

      if (
        document.body.classList.contains('veloura-quick-view-position-below_add_to_cart') ||
        document.body.classList.contains('veloura-quick-view-position-below-add-to-cart') ||
        document.body.classList.contains('veloura-quick-view-position-inside_card')
      ) {
        return 'below_add_to_cart';
      }

      return 'wishlist_icon';
    }

    function getQuickViewStyle() {
      const bodyClass = Array.from(document.body.classList).find(function (className) {
        return className.indexOf('veloura-quick-view-style-') === 0;
      });

      if (bodyClass) {
        return bodyClass.replace('veloura-quick-view-style-', '');
      }

      const raw = String(normalizeSettingValue(config.buttonStyle, 'glass'));

      if (['glass', 'solid', 'outline', 'soft'].indexOf(raw) !== -1) {
        return raw;
      }

      return 'glass';
    }

    const position = getQuickViewPosition();
    const buttonStyle = getQuickViewStyle();

    replaceBodyClass('veloura-quick-view-position-', position);
    replaceBodyClass('veloura-quick-view-style-', buttonStyle);

    function stripHtml(value) {
      const div = document.createElement('div');
      div.innerHTML = value || '';
      return cleanText(div.textContent || div.innerText || '');
    }

    function formatMoneyValue(value) {
      if (value === 0 || value === '0') {
        return '0';
      }

      if (!value) {
        return '';
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return cleanText(String(value));
      }

      if (typeof value === 'object') {
        return cleanText(
          value.formatted ||
            value.format ||
            value.text ||
            value.display ||
            value.amount_with_currency ||
            value.price_format ||
            value.price ||
            value.sale_price ||
            value.amount ||
            value.value ||
            ''
        );
      }

      return '';
    }

    function extractPriceFromText(text) {
      const value = cleanText(text);

      if (!value) {
        return '';
      }

      const matches = value.match(
        /(?:ر\.?س|SAR|﷼|ريال)?\s*[0-9٠-٩]+(?:[.,٬][0-9٠-٩]+)?\s*(?:ر\.?س|SAR|﷼|ريال)?/gi
      );

      if (matches && matches.length) {
        return cleanText(matches.join(' '));
      }

      return '';
    }

    function getBestPriceText(root) {
      const selectors = [
        '.s-product-card-content-sub',
        '.s-product-card-content-price',
        '.s-product-card-price',
        '.s-product-card-sale-price',
        '.s-product-card-regular-price',
        '[class*="price"]',
        '[class*="Price"]',
        'ins',
        'del'
      ];

      for (const selector of selectors) {
        const elements = root.querySelectorAll(selector);

        for (const element of elements) {
          const text = extractPriceFromText(element.innerText || element.textContent);

          if (text) {
            return text;
          }
        }
      }

      return '';
    }

    function getCardRoot(node) {
      if (!node) return null;

      if (node.classList && node.classList.contains('s-product-card-entry')) {
        return node;
      }

      return node.querySelector('.s-product-card-entry') || node;
    }

    function getAttr(node, names) {
      if (!node) return '';

      for (const name of names) {
        const value = node.getAttribute && node.getAttribute(name);
        if (value) return value;
      }

      return '';
    }

    function getProductId(root, url) {
      const fromRoot =
        getAttr(root, ['product-id', 'data-product-id', 'data-id', 'product']) ||
        (root.dataset && (root.dataset.productId || root.dataset.id));

      if (fromRoot && /^\d+$/.test(String(fromRoot))) {
        return String(fromRoot);
      }

      const addButton = root.querySelector(
        'salla-add-product-button, [product-id], [data-product-id]'
      );

      const fromAddButton =
        getAttr(addButton, ['product-id', 'data-product-id', 'data-id']) ||
        (addButton &&
          addButton.dataset &&
          (addButton.dataset.productId || addButton.dataset.id));

      if (fromAddButton && /^\d+$/.test(String(fromAddButton))) {
        return String(fromAddButton);
      }

      if (url) {
        const match =
          String(url).match(/\/p(\d+)/i) ||
          String(url).match(/[?&]product(?:_id)?=(\d+)/i);

        if (match && match[1]) {
          return match[1];
        }
      }

      return '';
    }

    function getProductData(card) {
      const root = getCardRoot(card);

      const titleLink =
        root.querySelector('.s-product-card-content-title a') ||
        root.querySelector('.s-product-card-content h3 a') ||
        root.querySelector('a[href*="/products/"]') ||
        root.querySelector('a[href*="/p"]');

      const image =
        root.querySelector('.s-product-card-image img') ||
        root.querySelector('img');

      const url = titleLink && titleLink.href ? titleLink.href : '#';

      return {
        id: getProductId(root, url),
        name: cleanText(titleLink && titleLink.textContent) || 'المنتج',
        url: url,
        image: image && (image.currentSrc || image.src) ? image.currentSrc || image.src : '',
        price: getBestPriceText(root),
        description: ''
      };
    }

    function normalizeProductResponse(response) {
      const product = response && (response.data || response.product || response);

      if (!product || typeof product !== 'object') {
        return null;
      }

      const image =
        product.image ||
        product.thumbnail ||
        product.main_image ||
        (Array.isArray(product.images) &&
          product.images[0] &&
          (product.images[0].url || product.images[0].image || product.images[0])) ||
        '';

      const price =
        formatMoneyValue(product.price) ||
        formatMoneyValue(product.sale_price) ||
        formatMoneyValue(product.regular_price) ||
        formatMoneyValue(product.final_price) ||
        formatMoneyValue(product.formatted_price) ||
        formatMoneyValue(product.price_format) ||
        '';

      const url = product.url || product.html_url || product.link || '';

      return {
        id: product.id || product.product_id || '',
        name: product.name || product.title || '',
        url: typeof url === 'string' ? url : '',
        image: typeof image === 'string' ? image : image && image.url ? image.url : '',
        price: price,
        description: stripHtml(
          product.description ||
            product.short_description ||
            product.subtitle ||
            ''
        )
      };
    }

    async function fetchProductDetails(productId) {
      if (!productId || !window.salla || !salla.product || !salla.product.getDetails) {
        return null;
      }

      const attempts = [
        function () {
          return salla.product.getDetails(productId);
        },
        function () {
          return salla.product.getDetails({ id: productId });
        },
        function () {
          return salla.product.getDetails({ product_id: productId });
        }
      ];

      for (const attempt of attempts) {
        try {
          const response = await attempt();
          const normalized = normalizeProductResponse(response);

          if (normalized) {
            return normalized;
          }
        } catch (error) {}
      }

      return null;
    }

    async function fetchProductFromPage(url) {
      if (!url || url === '#') {
        return null;
      }

      try {
        const response = await fetch(url, {
          credentials: 'same-origin'
        });

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        let jsonProduct = null;

        doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
          try {
            const parsed = JSON.parse(script.textContent || '{}');

            if (parsed['@type'] === 'Product') {
              jsonProduct = parsed;
            }

            if (Array.isArray(parsed['@graph'])) {
              const productNode = parsed['@graph'].find(function (item) {
                return item['@type'] === 'Product';
              });

              if (productNode) {
                jsonProduct = productNode;
              }
            }
          } catch (error) {}
        });

        const metaDescription =
          doc.querySelector('meta[property="og:description"]') ||
          doc.querySelector('meta[name="description"]');

        const metaImage =
          doc.querySelector('meta[property="og:image"]') ||
          doc.querySelector('meta[name="twitter:image"]');

        const title =
          (jsonProduct && jsonProduct.name) ||
          cleanText(doc.querySelector('h1') && doc.querySelector('h1').textContent) ||
          '';

        const description =
          (jsonProduct && jsonProduct.description) ||
          (metaDescription && metaDescription.getAttribute('content')) ||
          '';

        const image =
          (jsonProduct && jsonProduct.image && Array.isArray(jsonProduct.image)
            ? jsonProduct.image[0]
            : jsonProduct && jsonProduct.image) ||
          (metaImage && metaImage.getAttribute('content')) ||
          '';

        let price = '';

        if (jsonProduct && jsonProduct.offers) {
          const offers = Array.isArray(jsonProduct.offers)
            ? jsonProduct.offers[0]
            : jsonProduct.offers;

          price =
            formatMoneyValue(offers.price) ||
            formatMoneyValue(offers.lowPrice) ||
            formatMoneyValue(offers.highPrice);
        }

        return {
          name: cleanText(title),
          url: url,
          image: image || '',
          price: price || '',
          description: cleanText(description)
        };
      } catch (error) {
        return null;
      }
    }

    function ensureModal() {
      let modal = document.querySelector('.veloura-quick-view-modal');

      if (modal) {
        return modal;
      }

      modal = document.createElement('div');
      modal.className = 'veloura-quick-view-modal';
      modal.setAttribute('aria-hidden', 'true');

      modal.innerHTML = `
        <div class="veloura-quick-view-modal__overlay" data-veloura-qv-close></div>

        <div class="veloura-quick-view-modal__dialog" role="dialog" aria-modal="true">
          <button type="button" class="veloura-quick-view-modal__close" data-veloura-qv-close aria-label="إغلاق">
            ×
          </button>

          <div class="veloura-quick-view-modal__grid">
            <div class="veloura-quick-view-modal__media">
              <img class="veloura-quick-view-modal__image" src="" alt="">
            </div>

            <div class="veloura-quick-view-modal__content">
              <span class="veloura-quick-view-modal__loading">جاري تحميل التفاصيل...</span>
              <h3 class="veloura-quick-view-modal__title"></h3>
              <div class="veloura-quick-view-modal__price"></div>
              <p class="veloura-quick-view-modal__description"></p>

              <a class="veloura-quick-view-modal__link" href="#">
                ${config.productLinkText || 'عرض تفاصيل المنتج'}
              </a>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.addEventListener('click', function (event) {
        if (event.target && event.target.hasAttribute('data-veloura-qv-close')) {
          closeModal();
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeModal();
        }
      });

      return modal;
    }

    function renderModal(data, loading) {
      const modal = ensureModal();

      const image = modal.querySelector('.veloura-quick-view-modal__image');
      const title = modal.querySelector('.veloura-quick-view-modal__title');
      const price = modal.querySelector('.veloura-quick-view-modal__price');
      const description = modal.querySelector('.veloura-quick-view-modal__description');
      const link = modal.querySelector('.veloura-quick-view-modal__link');
      const loadingEl = modal.querySelector('.veloura-quick-view-modal__loading');

      loadingEl.style.display = loading ? '' : 'none';

      title.textContent = data.name || 'المنتج';

      price.textContent = data.price || '';
      price.style.display = data.price ? '' : 'none';

      description.textContent = data.description || '';
      description.style.display = data.description ? '' : 'none';

      link.href = data.url || '#';
      link.textContent = config.productLinkText || 'عرض تفاصيل المنتج';

      if (config.showProductLink === false || config.showProductLink === 'false') {
        link.style.display = 'none';
      } else {
        link.style.display = '';
      }

      if (data.image) {
        image.src = data.image;
        image.alt = data.name || '';
        image.parentElement.style.display = '';
      } else {
        image.removeAttribute('src');
        image.alt = '';
        image.parentElement.style.display = 'none';
      }
    }

    async function openModal(cardData) {
      const modal = ensureModal();

      renderModal(cardData, !!cardData.id);

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('veloura-quick-view-lock');

      const details =
        (await fetchProductDetails(cardData.id)) ||
        (await fetchProductFromPage(cardData.url));

      if (details) {
        renderModal(
          {
            id: details.id || cardData.id,
            name: details.name || cardData.name,
            url: details.url || cardData.url,
            image: details.image || cardData.image,
            price: details.price || cardData.price,
            description: details.description || cardData.description
          },
          false
        );
      } else {
        renderModal(cardData, false);
      }
    }

    function closeModal() {
      const modal = document.querySelector('.veloura-quick-view-modal');

      if (!modal) {
        return;
      }

      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('veloura-quick-view-lock');
    }

    function createButton(card) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'veloura-quick-view-btn';
      button.setAttribute('aria-label', config.buttonText || 'عرض سريع');

      const showIcon = toBool(config.showIcon, true);
      const iconClass = String(normalizeSettingValue(config.icon, 'sicon-eye') || 'sicon-eye');

      if (position === 'below_add_to_cart') {
        button.classList.add('is-under-cart');

        button.innerHTML = `
          ${showIcon ? `<i class="${iconClass}" aria-hidden="true"></i>` : ''}
          <span>${config.buttonText || 'عرض سريع'}</span>
        `;
      } else {
        button.classList.add('is-icon-only');
        button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        openModal(getProductData(card));
      });

      return button;
    }

    function injectButton(card) {
      const root = getCardRoot(card);

      if (!root || root.querySelector('.veloura-quick-view-btn')) {
        return;
      }

      const button = createButton(root);

      if (position === 'below_add_to_cart') {
        const wrapper = document.createElement('div');
        wrapper.className = 'veloura-quick-view-under-cart-wrap';
        wrapper.appendChild(button);

        const footer = root.querySelector('.s-product-card-content-footer');
        const addToCart = root.querySelector('salla-add-product-button');
        const content = root.querySelector('.s-product-card-content') || root;

        if (footer && footer.parentNode) {
          footer.parentNode.insertBefore(wrapper, footer.nextSibling);
        } else if (addToCart && addToCart.parentNode) {
          addToCart.parentNode.insertBefore(wrapper, addToCart.nextSibling);
        } else {
          content.appendChild(wrapper);
        }

        return;
      }

      const imageBox = root.querySelector('.s-product-card-image');

      if (imageBox) {
        imageBox.classList.add('veloura-quick-view-image-host');
        imageBox.appendChild(button);
      } else {
        root.appendChild(button);
      }
    }

    function scanCards() {
      document
        .querySelectorAll('product-card, .s-product-card-entry')
        .forEach(function (card) {
          injectButton(card);
        });
    }

    scanCards();

    const observer = new MutationObserver(scanCards);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();