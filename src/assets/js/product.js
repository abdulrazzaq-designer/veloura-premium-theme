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

        this.initVelouraProductCleanup();
        this.initProductOptionValidations();
        this.initVelouraCouponCopy();
        this.initVelouraDescriptionReadMore();

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

    initVelouraProductCleanup() {
        const productPage = document.querySelector('.veloura-product-page');

        if (!productPage) {
            return;
        }

        document.documentElement.classList.add('veloura-is-product-page');
        document.body.classList.add('veloura-is-product-page');

        this.hideVelouraFloatingMenu();
        this.normalizeVelouraProductBar();

        if (!window.__velouraProductFloatingObserver) {
            window.__velouraProductFloatingObserver = new MutationObserver(() => {
                this.hideVelouraFloatingMenu();
                this.normalizeVelouraProductBar();
            });

            window.__velouraProductFloatingObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        // حماية إضافية: إذا بقي بلوك السعر القديم خارج كرت السعر، نخفيه حتى لا يظهر السعر مرتين.
        document
            .querySelectorAll('.veloura-product-page .main-content > .flex.whitespace-nowrap.gap-4.items-center')
            .forEach((element) => {
                if (!element.closest('.veloura-product-price-card') && !element.closest('.price-wrapper')) {
                    element.classList.add('veloura-hidden-legacy-price');
                }
            });
    }

    hideVelouraFloatingMenu() {
        document.documentElement.classList.add('veloura-is-product-page');
        document.body.classList.add('veloura-is-product-page');
        document.body.style.setProperty('padding-bottom', '0', 'important');

        const selectors = [
            '.veloura-mobile-floating-menu',
            '.veloura-floating-menu',
            '.mobile-floating-menu',
            '.mobile-bottom-menu',
            '.bottom-nav',
            '.s-bottom-nav',
            '.floating-menu',
            '.mobile-nav-floating',
            '.store-footer-bar',
            '#veloura-mobile-floating-menu',
            '[data-veloura-mobile-floating-menu]',
            '[data-floating-menu]',
        ];

        document.querySelectorAll(selectors.join(',')).forEach((element) => {
            if (element.closest('.veloura-product-page')) {
                return;
            }

            element.setAttribute('aria-hidden', 'true');
            element.classList.add('veloura-force-hidden-on-product');
            element.style.setProperty('display', 'none', 'important');
            element.style.setProperty('visibility', 'hidden', 'important');
            element.style.setProperty('opacity', '0', 'important');
            element.style.setProperty('pointer-events', 'none', 'important');
            element.style.setProperty('transform', 'translateY(120%)', 'important');
        });
    }

    normalizeVelouraProductBar() {
        const productPage = document.querySelector('.veloura-product-page');

        if (!productPage) {
            return;
        }

        productPage.style.setProperty('padding-bottom', '0', 'important');

        productPage
            .querySelectorAll('.sticky-product-bar, .veloura-product-sticky-bar, .veloura-product-actions-card')
            .forEach((bar) => {
                bar.style.setProperty('position', 'static', 'important');
                bar.style.setProperty('left', 'auto', 'important');
                bar.style.setProperty('right', 'auto', 'important');
                bar.style.setProperty('top', 'auto', 'important');
                bar.style.setProperty('bottom', 'auto', 'important');
                bar.style.setProperty('z-index', 'auto', 'important');
                bar.style.setProperty('width', '100%', 'important');
                bar.style.setProperty('margin', '14px 0 0', 'important');
                bar.style.setProperty('transform', 'none', 'important');
            });

        productPage
            .querySelectorAll('salla-add-product-button[support-sticky-bar]')
            .forEach((button) => button.removeAttribute('support-sticky-bar'));
    }

    initProductOptionValidations() {
        const form = document.querySelector('.product-form');

        if (!form || form.dataset.velouraOptionsReady === '1') {
            return;
        }

        form.dataset.velouraOptionsReady = '1';

        form.addEventListener('change', () => {
            if (form.reportValidity()) {
                salla.product.getPrice(new FormData(form));
            }
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

    initVelouraDescriptionReadMore() {
        const button = document.querySelector('#btn-show-more');
        const content = document.querySelector('#more-content');

        if (!button || !content || button.dataset.velouraReadMoreReady === '1') {
            return;
        }

        button.dataset.velouraReadMoreReady = '1';

        button.addEventListener('click', (event) => {
            event.preventDefault();

            button.classList.add('is-expanded');
            content.style.maxHeight = `${content.scrollHeight}px`;

            const description = content.closest('.product__description');
            description?.classList.remove('is-collapsed');

            setTimeout(() => button.remove(), 250);
        });
    }

    updatePriceUI(data) {
        if (!data) {
            return;
        }

        const isOnSale = data.has_sale_price && Number(data.regular_price) > Number(data.price);
        const price = salla.money(data.price);
        const regularPrice = salla.money(data.regular_price);

        app.productWeight.forEach((element) => {
            element.innerHTML = data.weight || '';
        });

        app.productSku.forEach((element) => {
            element.innerHTML = data.sku || '';
        });

        document.querySelectorAll('.price-wrapper').forEach((wrapper) => {
            const saleWrapper = wrapper.querySelector('.price_is_on_sale');
            const normalWrapper = wrapper.querySelector('.starting-or-normal-price');
            const totalPrice = wrapper.querySelectorAll('.total-price');
            const beforePrice = wrapper.querySelectorAll('.before-price');
            const startingTitle = wrapper.querySelectorAll('.starting-price-title');

            totalPrice.forEach((element) => {
                element.innerHTML = price;
            });

            beforePrice.forEach((element) => {
                element.innerHTML = regularPrice;
            });

            startingTitle.forEach((element) => {
                element.classList.add('hidden');
            });

            if (saleWrapper) {
                saleWrapper.classList.toggle('hidden', !isOnSale);
                saleWrapper.classList.toggle('showed', isOnSale);
            }

            if (normalWrapper) {
                normalWrapper.classList.toggle('hidden', isOnSale);
                normalWrapper.classList.toggle('showed', !isOnSale);
                normalWrapper.classList.toggle('flex', !isOnSale);
            }
        });

        document.querySelectorAll('.veloura-product-sticky-price-summary strong').forEach((element) => {
            element.innerHTML = price;
        });

        document.querySelectorAll('.total-price, .product-weight').forEach(element => {
            element.classList.remove('scale-pulse');
            void element.offsetWidth;
            element.classList.add('scale-pulse');
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

            this.updatePriceUI(res?.data);
        });
    }
}

Product.initiateWhenReady(['product.single']);
