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
            stickySummaryPrice: '.veloura-product-sticky-price-summary strong',
        });

        this.initVelouraProductPageState();
        this.initProductOptionValidations();
        this.initVelouraCouponCopy();
        this.initVelouraSliderFix();
        this.syncVelouraPriceBlocks();

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



    syncVelouraPriceBlocks(data = null) {
        const page = document.querySelector('.veloura-product-page');

        if (!page) {
            return;
        }

        const price = data?.price ?? null;
        const regularPrice = data?.regular_price ?? null;
        const hasSale = data
            ? Boolean(data.has_sale_price && Number(regularPrice) > Number(price))
            : page.querySelector('.price_is_on_sale .before-price');

        page.querySelectorAll('.price_is_on_sale').forEach((el) => {
            el.classList.toggle('hidden', !hasSale);
        });

        page.querySelectorAll('.starting-or-normal-price').forEach((el) => {
            el.classList.toggle('hidden', !!hasSale);
        });
    }

    initVelouraSliderFix() {
        const slider = document.querySelector('salla-slider.details-slider');

        if (!slider) {
            return;
        }

        const refreshSlides = () => {
            document
                .querySelectorAll('.image-slider .swiper-slide img')
                .forEach((img) => {
                    img.style.opacity = '1';
                    img.style.visibility = 'visible';
                    img.removeAttribute('hidden');
                });

            const swiper = slider.swiper || slider.slider || null;

            if (swiper?.update) {
                swiper.update();
            }

            if (swiper?.updateAutoHeight) {
                swiper.updateAutoHeight(0);
            }
        };

        setTimeout(refreshSlides, 250);
        slider.addEventListener('slideChange', () => setTimeout(refreshSlides, 100));
        window.addEventListener('resize', () => setTimeout(refreshSlides, 100));
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

            const data = res.data;
            const isOnSale = data.has_sale_price && data.regular_price > data.price;

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

            app.stickySummaryPrice?.forEach((el) => {
                el.innerHTML = salla.money(data.price);
            });

            app.toggleClassIf('.price_is_on_sale', 'showed', 'hidden', () => isOnSale);
            app.toggleClassIf('.starting-or-normal-price', 'hidden', 'showed', () => isOnSale);
            this.syncVelouraPriceBlocks(data);

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
