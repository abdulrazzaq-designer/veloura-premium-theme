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

        this.initVelouraProductPageState();
        this.initProductOptionValidations();
        this.initVelouraCouponCopy();
        this.initVelouraPurchaseCount();
        this.initVelouraPurchaseButtons();
        this.initVelouraReadMore();

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

    initVelouraProductPageState() {
        const page = document.querySelector('.veloura-product-page');

        if (!page) {
            return;
        }

        document.documentElement.classList.add('veloura-is-product-page');
        document.body.classList.add('veloura-is-product-page');

        const stickyEnabled = page.classList.contains(
            'veloura-product-mobile-sticky-enabled'
        );

        document.body.classList.toggle(
            'veloura-product-sticky-active',
            stickyEnabled
        );
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


    initVelouraPurchaseCount() {
        document
            .querySelectorAll('[data-veloura-purchase-count]')
            .forEach((counter) => {
                if (counter.dataset.velouraCountReady === '1') {
                    return;
                }

                counter.dataset.velouraCountReady = '1';

                const number = counter.querySelector(
                    '.veloura-product-purchase-count__number'
                );

                const target = Number.parseInt(
                    counter.getAttribute('data-count') || '0',
                    10
                );

                if (!number || !Number.isFinite(target)) {
                    return;
                }

                if (!counter.classList.contains('is-animated')) {
                    number.textContent = String(Math.max(0, target));
                    return;
                }

                const finalValue = Math.max(0, target);
                const duration = 900;
                const startedAt = performance.now();

                const render = (now) => {
                    const progress = Math.min(
                        1,
                        (now - startedAt) / duration
                    );

                    const eased = 1 - Math.pow(1 - progress, 3);
                    number.textContent = String(
                        Math.round(finalValue * eased)
                    );

                    if (progress < 1) {
                        window.requestAnimationFrame(render);
                    }
                };

                window.requestAnimationFrame(render);
            });
    }

    initVelouraPurchaseButtons() {
        const component = document.querySelector(
            '.veloura-product-page salla-add-product-button.sticky-product-bar__btn'
        );

        if (!component) {
            return;
        }

        const normalize = () => {
            const main = component.querySelector('.s-add-product-button-main');

            if (!main) {
                return;
            }

            main.style.setProperty('display', 'flex', 'important');
            main.style.setProperty('width', '100%', 'important');
            main.style.setProperty('gap', '12px', 'important');
            main.style.setProperty('direction', 'rtl', 'important');

            Array.from(main.children).forEach((child) => {
                child.style.setProperty('flex', '1 1 0', 'important');
                child.style.setProperty('width', '0', 'important');
                child.style.setProperty('min-width', '0', 'important');
                child.style.setProperty('max-width', 'none', 'important');
            });

            component.querySelectorAll('salla-mini-checkout-widget').forEach((widget) => {
                widget.style.setProperty('--salla-fast-checkout-button-height', '46px');
                widget.style.setProperty('--salla-fast-checkout-button-width', '100%');
                widget.style.setProperty('--salla-fast-checkout-button-border-radius', '9999px');
            });
        };

        normalize();

        const observer = new MutationObserver(normalize);
        observer.observe(component, { childList: true, subtree: true });

        window.setTimeout(normalize, 250);
        window.setTimeout(normalize, 800);
    }

    initVelouraReadMore() {
        const button = document.querySelector('#btn-show-more');
        const content = document.querySelector('#more-content');

        if (!button || !content || button.dataset.velouraReadMoreReady === '1') {
            return;
        }

        button.dataset.velouraReadMoreReady = '1';

        const textNode = button.querySelector('.veloura-product-read-more__text');
        const moreText = button.dataset.moreText || 'عرض المزيد';
        const lessText = button.dataset.lessText || 'عرض أقل';
        const rootFontSize = parseFloat(
            window.getComputedStyle(document.documentElement).fontSize
        ) || 16;
        const collapsedHeight = 8.5 * rootFontSize;

        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 440ms cubic-bezier(.22, .61, .36, 1)';
        content.style.maxHeight = `${collapsedHeight}px`;

        const setButtonText = (expanded) => {
            if (textNode) {
                textNode.textContent = expanded ? lessText : moreText;
            } else {
                button.textContent = expanded ? lessText : moreText;
            }

            button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();

            const willExpand = !button.classList.contains('is-expanded');
            const currentHeight = content.getBoundingClientRect().height;

            content.style.maxHeight = `${currentHeight}px`;
            void content.offsetHeight;

            button.classList.toggle('is-expanded', willExpand);
            content.classList.toggle('is-expanded', willExpand);
            setButtonText(willExpand);

            window.requestAnimationFrame(() => {
                const targetHeight = willExpand
                    ? content.scrollHeight
                    : collapsedHeight;

                content.style.maxHeight = `${targetHeight}px`;
            });
        });

        content.addEventListener('transitionend', (event) => {
            if (event.propertyName !== 'max-height') {
                return;
            }

            if (button.classList.contains('is-expanded')) {
                content.style.maxHeight = `${content.scrollHeight}px`;
            }
        });

        window.addEventListener('resize', () => {
            content.style.maxHeight = button.classList.contains('is-expanded')
                ? `${content.scrollHeight}px`
                : `${collapsedHeight}px`;
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
            document.querySelectorAll('.price-wrapper').forEach((el) => el.classList.add('hidden'));

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
            document.querySelectorAll('.out-of-stock').forEach((el) => el.classList.add('hidden'));
            document.querySelectorAll('.price-wrapper').forEach((el) => el.classList.remove('hidden'));

            const data = res.data;
            const price = Number(data.price || 0);
            const regularPrice = Number(data.regular_price || 0);
            const isOnSale = Boolean(data.has_sale_price || regularPrice > price) && regularPrice > price;

            app.startingPriceTitle?.classList.add('hidden');

            app.productWeight.forEach((el) => {
                el.innerHTML = data.weight || '';
            });

            app.totalPrice.forEach((el) => {
                el.innerHTML = salla.money(data.price);
            });

            app.beforePrice.forEach((el) => {
                el.innerHTML = salla.money(data.regular_price);
                el.classList.toggle('hidden', !isOnSale);
            });

            app.productSku.forEach((el) => {
                el.innerHTML = data.sku || '';
            });

    
            document.querySelectorAll('.total-price, .product-weight').forEach(el => {
                el.classList.remove('scale-pulse');
                void el.offsetWidth;
                el.classList.add('scale-pulse');
            });
        });


    }
}

Product.initiateWhenReady(['product.single']);
س