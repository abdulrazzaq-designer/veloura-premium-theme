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
        this.initVelouraSliderFix();
        this.initVelouraPurchaseButtons();

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


    initVelouraSliderFix() {
        const slider = document.querySelector('salla-slider.details-slider');

        if (!slider) {
            return;
        }

        const prepareImage = (img) => {
            if (!img) {
                return;
            }

            img.loading = 'eager';
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.display = 'block';
            img.removeAttribute('hidden');

            const dataSrc = img.getAttribute('data-src');
            const dataSrcset = img.getAttribute('data-srcset');

            if (!img.getAttribute('src') && dataSrc) {
                img.setAttribute('src', dataSrc);
            }

            if (!img.getAttribute('srcset') && dataSrcset) {
                img.setAttribute('srcset', dataSrcset);
            }

            if (typeof img.decode === 'function') {
                img.decode().catch(() => {});
            }
        };

        const refreshSlides = () => {
            slider.querySelectorAll('[slot="items"] img, [slot="thumbs"] img').forEach(prepareImage);

            const activeImage = slider.querySelector(
                '.swiper-slide-active img, [slot="items"] .swiper-slide-active img'
            );
            prepareImage(activeImage);

            const swiper = slider.swiper || slider.slider || null;

            swiper?.update?.();
            swiper?.updateSlides?.();
            swiper?.updateAutoHeight?.(0);
        };

        const refreshSoon = () => {
            window.requestAnimationFrame(refreshSlides);
            window.setTimeout(refreshSlides, 60);
            window.setTimeout(refreshSlides, 180);
        };

        refreshSoon();
        slider.addEventListener('slideChange', refreshSoon);
        slider.addEventListener('afterInit', refreshSoon);
        slider.addEventListener('load', refreshSoon, true);
        window.addEventListener('resize', refreshSoon);

        const observer = new MutationObserver(refreshSoon);
        observer.observe(slider, { childList: true, subtree: true });
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

        app.onClick('#btn-show-more', e => {
            const button = e.currentTarget || e.target;
            const content = document.querySelector('#more-content');

            if (!button || !content) {
                return;
            }

            if (!button.dataset.moreText) {
                button.dataset.moreText = button.textContent.trim() || 'عرض المزيد';
            }

            const isExpanded = button.classList.toggle('is-expanded');

            content.style.maxHeight = isExpanded
                ? `${content.scrollHeight}px`
                : '8.5rem';

            button.textContent = isExpanded
                ? 'عرض أقل'
                : button.dataset.moreText;

            button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        });
    }
}

Product.initiateWhenReady(['product.single']);
