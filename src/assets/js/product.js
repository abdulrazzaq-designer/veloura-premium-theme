import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

class Product extends BasePage {
    onReady() {
        app.watchElements({
            totalPrice: '.total-price',
            productWeight: '.product-weight',
            beforePrice: '.before-price',
            startingPriceTitle: '.starting-price-title',
            productSku: '.product-sku',
        });

        this.initVelouraProductPageGuard();
        this.initProductOptionValidations();
        this.initVelouraCouponCopy();
        this.initVelouraMobileStickyBar();

        const velouraProductPage = document.querySelector('.veloura-product-page');
        const velouraZoomAllowed =
            !velouraProductPage ||
            velouraProductPage.classList.contains('veloura-product-zoom-enabled');

        const themeZoomEnabled =
            typeof imageZoom !== 'undefined' && imageZoom;

        if (themeZoomEnabled && velouraZoomAllowed) {
            this.initImagesZooming();
            window.addEventListener('resize', () => this.initImagesZooming());
        }
    }

    initVelouraProductPageGuard() {
        document.documentElement.classList.add('veloura-is-product-page');
        document.body?.classList.add('veloura-is-product-page');

        const hideFloatingMenu = () => {
            document
                .querySelectorAll([
                    '.veloura-mobile-floating-menu',
                    '.veloura-floating-menu',
                    '.veloura-bottom-navigation',
                    '.veloura-mobile-bottom-menu',
                    '.mobile-floating-menu',
                    '.mobile-bottom-menu',
                    '.mobile-bottom-nav',
                    '.bottom-nav',
                    '.floating-menu',
                    '#veloura-mobile-floating-menu',
                    '[data-veloura-mobile-floating-menu]',
                ].join(','))
                .forEach((menu) => {
                    menu.setAttribute('hidden', 'hidden');
                    menu.setAttribute('aria-hidden', 'true');
                    menu.style.setProperty('display', 'none', 'important');
                    menu.style.setProperty('visibility', 'hidden', 'important');
                    menu.style.setProperty('opacity', '0', 'important');
                    menu.style.setProperty('pointer-events', 'none', 'important');
                });
        };

        hideFloatingMenu();

        if (this.velouraFloatingMenuObserver) {
            this.velouraFloatingMenuObserver.disconnect();
        }

        this.velouraFloatingMenuObserver = new MutationObserver(hideFloatingMenu);
        this.velouraFloatingMenuObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    initProductOptionValidations() {
        document.querySelector('.product-form')?.addEventListener('change', function () {
            this.reportValidity() && salla.product.getPrice(new FormData(this));
        });
    }

    initImagesZooming() {
        const slider = document.querySelector('salla-slider.details-slider');

        if (!slider) {
            return;
        }

        const existingZoom = document.querySelector(
            '.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass'
        );

        if (window.innerWidth < 1024 || existingZoom) {
            return;
        }

        setTimeout(() => {
            const image = document.querySelector(
                '.image-slider .magnify-wrapper.swiper-slide-active img'
            );

            if (!image || !image.id) {
                return;
            }

            zoom(image.id, 2);
        }, 250);

        if (slider.dataset.velouraZoomReady === '1') {
            return;
        }

        slider.dataset.velouraZoomReady = '1';

        slider.addEventListener('slideChange', () => {
            setTimeout(() => {
                const existingZoom = document.querySelector(
                    '.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass'
                );

                if (window.innerWidth < 1024 || existingZoom) {
                    return;
                }

                const image = document.querySelector(
                    '.image-slider .magnify-wrapper.swiper-slide-active img'
                );

                if (!image || !image.id) {
                    return;
                }

                zoom(image.id, 2);
            }, 250);
        });
    }

    initVelouraCouponCopy() {
        document.querySelectorAll('.veloura-product-coupon__code').forEach(button => {
            if (button.dataset.velouraCouponReady === '1') {
                return;
            }

            button.dataset.velouraCouponReady = '1';

            button.addEventListener('click', async () => {
                const code =
                    button.getAttribute('data-code') ||
                    button.textContent.trim();

                if (!code) {
                    return;
                }

                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(code);
                    } else {
                        const input = document.createElement('input');
                        input.value = code;
                        document.body.appendChild(input);
                        input.select();
                        document.execCommand('copy');
                        input.remove();
                    }

                    const oldText = button.textContent;
                    button.classList.add('is-copied');
                    button.textContent = 'تم النسخ';

                    setTimeout(() => {
                        button.textContent = oldText;
                        button.classList.remove('is-copied');
                    }, 1200);
                } catch (error) {
                    console.warn('Veloura coupon copy failed:', error);
                }
            });
        });
    }

    initVelouraMobileStickyBar() {
    const productPage = document.querySelector('.veloura-product-page');
    const stickyBar = document.querySelector('.veloura-product-page .sticky-product-bar');

    if (!productPage || !stickyBar) {
        return;
    }

    if (stickyBar.dataset.velouraMobileStickyReady === '1') {
        return;
    }

    stickyBar.dataset.velouraMobileStickyReady = '1';

    const placeholder = document.createElement('div');
    placeholder.className = 'veloura-sticky-product-placeholder';
    stickyBar.parentNode.insertBefore(placeholder, stickyBar);

    const quantityClasses = [
        'veloura-product-qty-modern',
        'veloura-product-qty-mini_left'
    ];

    const syncQuantityClass = () => {
        stickyBar.classList.remove(...quantityClasses);

        quantityClasses.forEach(cls => {
            if (productPage.classList.contains(cls)) {
                stickyBar.classList.add(cls);
            }
        });

        if (!stickyBar.classList.contains('veloura-product-qty-modern') &&
            !stickyBar.classList.contains('veloura-product-qty-mini_left')) {
            stickyBar.classList.add('veloura-product-qty-modern');
        }
    };

    const restoreStickyBar = () => {
        if (placeholder.parentNode && stickyBar.parentNode !== placeholder.parentNode) {
            placeholder.parentNode.insertBefore(stickyBar, placeholder.nextSibling);
        }

        document.documentElement.classList.remove('veloura-product-sticky-active');
        document.body.classList.remove('veloura-product-sticky-active');
        stickyBar.classList.remove('veloura-product-sticky-fixed');
    };

    const moveStickyBar = () => {
        const isMobile = window.innerWidth <= 767;
        const stickyEnabled = productPage.classList.contains('veloura-product-mobile-sticky-enabled');

        syncQuantityClass();

        if (!isMobile || !stickyEnabled) {
            restoreStickyBar();
            return;
        }

        if (stickyBar.parentNode !== document.body) {
            document.body.appendChild(stickyBar);
        }

        document.documentElement.classList.add('veloura-product-sticky-active');
        document.body.classList.add('veloura-product-sticky-active');
        stickyBar.classList.add('veloura-product-sticky-fixed');
    };

    moveStickyBar();

    window.addEventListener('resize', moveStickyBar);
    window.addEventListener('orientationchange', moveStickyBar);
}

    registerEvents() {
        salla.event.on('product::price.updated.failed', () => {
            app.element('.price-wrapper')?.classList.add('hidden');

            const outOfStock = app.element('.out-of-stock');

            if (!outOfStock) {
                return;
            }

            outOfStock.classList.remove('hidden');
            outOfStock.classList.remove('scale-pulse');

            void outOfStock.offsetWidth;

            outOfStock.classList.add('scale-pulse');
        });

        salla.product.event.onPriceUpdated((res) => {
            app.element('.out-of-stock')?.classList.add('hidden');
            app.element('.price-wrapper')?.classList.remove('hidden');

            let data = res.data;
            let is_on_sale = data.has_sale_price && data.regular_price > data.price;

            app.startingPriceTitle?.classList.add('hidden');

            app.productWeight.forEach((el) => {
                el.innerHTML = data.weight || '';
            });

            app.totalPrice.forEach((el) => {
                el.innerHTML = salla.money(data.price);
            });

            app.beforePrice.forEach((el) => {
                el.innerHTML = salla.money(data.regular_price);
            });

            app.productSku.forEach((el) => {
                el.innerHTML = data.sku || '';
            });

            app.toggleClassIf('.price_is_on_sale', 'showed', 'hidden', () => is_on_sale);
            app.toggleClassIf('.starting-or-normal-price', 'hidden', 'showed', () => is_on_sale);

            document.querySelectorAll('.total-price, .product-weight').forEach(el => {
                el.classList.remove('scale-pulse');
                void el.offsetWidth;
                el.classList.add('scale-pulse');
            });
        });

        app.onClick('#btn-show-more', e =>
            app.all('#more-content', div => {
                e.target.classList.add('is-expanded');
                div.style = `max-height:${div.scrollHeight}px`;
            }) || e.target.remove()
        );
    }
}

Product.initiateWhenReady(['product.single']);