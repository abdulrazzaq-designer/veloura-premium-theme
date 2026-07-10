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

        this.initVelouraProductPageFixes();
        this.initProductOptionValidations();
        this.initVelouraCouponCopy();

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

    initVelouraProductPageFixes() {
        const productPage = document.querySelector('.veloura-product-page');

        if (!productPage) {
            return;
        }

        document.documentElement.classList.add('veloura-is-product-page');
        document.body.classList.add('veloura-is-product-page');

        const applyFixes = () => {
            this.hideVelouraFloatingMenus();
            this.disableVelouraStickyProductBar(productPage);
            this.hideVelouraLegacyPriceRows(productPage);
            this.normalizeVelouraProductOptions(productPage);
        };

        applyFixes();
        window.setTimeout(applyFixes, 150);
        window.setTimeout(applyFixes, 600);
        window.setTimeout(applyFixes, 1500);

        if (this.velouraProductObserver) {
            this.velouraProductObserver.disconnect();
        }

        this.velouraProductObserver = new MutationObserver(() => applyFixes());
        this.velouraProductObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    hideVelouraFloatingMenus() {
        const selectors = [
            '.veloura-mobile-floating-menu',
            '.veloura-floating-menu',
            '.mobile-floating-menu',
            '.mobile-bottom-menu',
            '.bottom-nav',
            '.floating-menu',
            '#veloura-mobile-floating-menu',
            '#mobile-floating-menu',
            '[data-veloura-mobile-floating-menu]',
            '[data-mobile-floating-menu]'
        ];

        document.querySelectorAll(selectors.join(',')).forEach((menu) => {
            menu.classList.add('veloura-hidden-on-product');
            menu.setAttribute('aria-hidden', 'true');
            menu.style.setProperty('display', 'none', 'important');
            menu.style.setProperty('visibility', 'hidden', 'important');
            menu.style.setProperty('opacity', '0', 'important');
            menu.style.setProperty('pointer-events', 'none', 'important');
        });

        document.body.style.setProperty('padding-bottom', '0px', 'important');
        document.documentElement.style.setProperty('padding-bottom', '0px', 'important');
    }

    disableVelouraStickyProductBar(productPage) {
        productPage
            .querySelectorAll('.sticky-product-bar, .veloura-product-sticky-bar, .veloura-product-actions-card')
            .forEach((bar) => {
                bar.classList.add('veloura-sticky-disabled');
                bar.style.setProperty('position', 'static', 'important');
                bar.style.setProperty('left', 'auto', 'important');
                bar.style.setProperty('right', 'auto', 'important');
                bar.style.setProperty('top', 'auto', 'important');
                bar.style.setProperty('bottom', 'auto', 'important');
                bar.style.setProperty('z-index', 'auto', 'important');
                bar.style.setProperty('transform', 'none', 'important');
                bar.style.setProperty('width', '100%', 'important');
                bar.style.setProperty('margin', '14px 0 0', 'important');
            });
    }

    hideVelouraLegacyPriceRows(productPage) {
        const hasNewPriceCard = productPage.querySelector('.veloura-product-price-card');
        const mainContent = productPage.querySelector('.main-content');

        if (!hasNewPriceCard || !mainContent) {
            return;
        }

        Array.from(mainContent.children).forEach((child) => {
            const isNewPriceCard = child.classList.contains('veloura-product-price-card');
            const looksLikeLegacyPrice =
                child.classList.contains('flex') &&
                child.classList.contains('whitespace-nowrap') &&
                child.querySelector('.line-through, .text-red-800, .font-bold.text-xl');

            if (looksLikeLegacyPrice && !isNewPriceCard) {
                child.classList.add('veloura-hidden-legacy-price');
                child.style.setProperty('display', 'none', 'important');
            }
        });
    }

    normalizeVelouraProductOptions(productPage) {
        productPage
            .querySelectorAll('.s-product-options-wrapper, salla-product-options, .product-options, .product-options-wrapper')
            .forEach((wrapper) => {
                wrapper.classList.add('veloura-options-normalized');
                wrapper.style.removeProperty('height');
                wrapper.style.removeProperty('min-height');
                wrapper.style.setProperty('width', '100%', 'important');
                wrapper.style.setProperty('max-width', '100%', 'important');
            });

        productPage
            .querySelectorAll('.s-product-options-option, .product-option, .option-item')
            .forEach((option) => {
                option.classList.add('veloura-option-normalized');
                option.style.removeProperty('grid-template-columns');
                option.style.removeProperty('height');
                option.style.removeProperty('min-height');
                option.style.setProperty('display', 'block', 'important');
                option.style.setProperty('width', '100%', 'important');
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

            this.initVelouraProductPageFixes();
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