(function () {
  'use strict';

  function onReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  onReady(function () {
    const config = window.velouraQuickView || {};

    if (config.enabled === false || config.enabled === 'false') {
      return;
    }

    function cleanText(value) {
      return (value || '').replace(/\s+/g, ' ').trim();
    }

    function getCardRoot(element) {
      if (!element) return null;

      if (element.classList && element.classList.contains('s-product-card-entry')) {
        return element;
      }

      return element.querySelector('.s-product-card-entry') || element;
    }

    function getProductData(card) {
      const root = getCardRoot(card);

      const titleLink =
        root.querySelector('.s-product-card-content-title a') ||
        root.querySelector('.s-product-card-content h3 a') ||
        root.querySelector('a[href*="/products/"]');

      const image =
        root.querySelector('.s-product-card-image img') ||
        root.querySelector('img');

      const price =
        root.querySelector('.s-product-card-sale-price') ||
        root.querySelector('.s-product-card-price') ||
        root.querySelector('.s-product-card-content-price') ||
        root.querySelector('[class*="price"]') ||
        root.querySelector('[class*="Price"]');

      return {
        name: cleanText(titleLink && titleLink.textContent) || 'المنتج',
        url: titleLink && titleLink.href ? titleLink.href : '#',
        image: image && (image.currentSrc || image.src) ? image.currentSrc || image.src : '',
        price: cleanText(price && price.textContent)
      };
    }

    function createModal() {
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
              <h3 class="veloura-quick-view-modal__title"></h3>
              <div class="veloura-quick-view-modal__price"></div>

              <a class="veloura-quick-view-modal__link" href="#">
                ${config.productLinkText || 'عرض تفاصيل المنتج'}
              </a>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.addEventListener('click', function (event) {
        if (event.target.hasAttribute('data-veloura-qv-close')) {
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

    function openModal(data) {
      const modal = createModal();

      const image = modal.querySelector('.veloura-quick-view-modal__image');
      const title = modal.querySelector('.veloura-quick-view-modal__title');
      const price = modal.querySelector('.veloura-quick-view-modal__price');
      const link = modal.querySelector('.veloura-quick-view-modal__link');

      title.textContent = data.name || 'المنتج';
      price.textContent = data.price || '';

      if (data.url) {
        link.href = data.url;
      }

      if (config.showProductLink === false || config.showProductLink === 'false') {
        link.style.display = 'none';
      } else {
        link.style.display = '';
        link.textContent = config.productLinkText || 'عرض تفاصيل المنتج';
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

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('veloura-quick-view-lock');
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

      const showIcon = config.showIcon !== false && config.showIcon !== 'false';
      const iconClass = config.icon || 'sicon-eye';

      button.innerHTML = `
        ${showIcon ? `<i class="${iconClass}" aria-hidden="true"></i>` : ''}
        <span>${config.buttonText || 'عرض سريع'}</span>
      `;

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

      const imageBox = root.querySelector('.s-product-card-image');
      const content = root.querySelector('.s-product-card-content') || root;
      const footer = root.querySelector('.s-product-card-content-footer');

      if (document.body.classList.contains('veloura-quick-view-position-inside_card')) {
        button.classList.add('is-inside-card');

        if (footer && footer.parentNode) {
          footer.parentNode.insertBefore(button, footer);
        } else {
          content.appendChild(button);
        }

        return;
      }

      if (imageBox) {
        imageBox.classList.add('veloura-quick-view-image-host');
        imageBox.appendChild(button);
      } else {
        button.classList.add('is-inside-card');
        content.insertBefore(button, content.firstChild);
      }
    }

    function scanCards() {
      const cards = document.querySelectorAll('product-card, .s-product-card-entry');

      cards.forEach(function (card) {
        injectButton(card);
      });
    }

    scanCards();

    const observer = new MutationObserver(function () {
      scanCards();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();