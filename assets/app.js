document.addEventListener('DOMContentLoaded', function () {
    // DOM is fully loaded, now you can add your JavaScript

    // 1. Mouse Wheel Event
    let canScroll = true, scrollController = null;
    document.addEventListener('wheel', function (e) {
        if (!document.querySelector('.outer-nav').classList.contains('is-vis')) {
            e.preventDefault();
            const delta = e.deltaY || e.detail * 20;

            if (delta > 50 && canScroll) {
                canScroll = false;
                clearTimeout(scrollController);
                scrollController = setTimeout(function () {
                    canScroll = true;
                }, 800);
                updateHelper(1);
            } else if (delta < -50 && canScroll) {
                canScroll = false;
                clearTimeout(scrollController);
                scrollController = setTimeout(function () {
                    canScroll = true;
                }, 800);
                updateHelper(-1);
            }
        }
    });

    // 2. Navigation Item Click
    document.querySelectorAll('.side-nav li, .outer-nav li').forEach(function (item) {
        item.addEventListener('click', function () {
            if (!this.classList.contains('is-active')) {
                const curActive = this.parentNode.querySelector('.is-active');
                const curPos = Array.from(this.parentNode.children).indexOf(curActive);
                const nextPos = Array.from(this.parentNode.children).indexOf(this);
                const lastItem = this.parentNode.children.length - 1;

                updateNavs(nextPos);
                updateContent(curPos, nextPos, lastItem);
            }
        });
    });

    // 3. CTA Button Click
    document.querySelector('.cta').addEventListener('click', function () {
        const curActive = document.querySelector('.side-nav .is-active');
        const curPos = Array.from(document.querySelector('.side-nav').children).indexOf(curActive);
        const lastItem = document.querySelector('.side-nav').children.length - 1;
        const nextPos = lastItem;

        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
    });

    // 4. Swipe Support (Touch Event)
    const targetElement = document.getElementById('viewport');
    let startTouch = 0;

    targetElement.addEventListener('touchstart', function (e) {
        startTouch = e.touches[0].clientY;
    });

    targetElement.addEventListener('touchend', function (e) {
        const endTouch = e.changedTouches[0].clientY;
        if (startTouch - endTouch > 50) {
            updateHelper({ type: 'swipeup' });
        } else if (endTouch - startTouch > 50) {
            updateHelper({ type: 'swipedown' });
        }
    });

    // 5. Keyboard Arrow Key Event
    document.addEventListener('keyup', function (e) {
        if (!document.querySelector('.outer-nav').classList.contains('is-vis')) {
            e.preventDefault();
            updateHelper(e);
        }
    });

    // 6. Helper Function (Used in many places)
    function updateHelper(param) {
        const curActive = document.querySelector('.side-nav .is-active');
        const curPos = Array.from(document.querySelector('.side-nav').children).indexOf(curActive);
        const lastItem = document.querySelector('.side-nav').children.length - 1;
        let nextPos = 0;

        if (param.type === "swipeup" || param.keyCode === 40 || param > 0) {
            if (curPos !== lastItem) {
                nextPos = curPos + 1;
                updateNavs(nextPos);
                updateContent(curPos, nextPos, lastItem);
            } else {
                updateNavs(nextPos);
                updateContent(curPos, nextPos, lastItem);
            }
        } else if (param.type === "swipedown" || param.keyCode === 38 || param < 0) {
            if (curPos !== 0) {
                nextPos = curPos - 1;
                updateNavs(nextPos);
                updateContent(curPos, nextPos, lastItem);
            } else {
                nextPos = lastItem;
                updateNavs(nextPos);
                updateContent(curPos, nextPos, lastItem);
            }
        }
    }

    // 7. Update Navigation
    function updateNavs(nextPos) {
        document.querySelectorAll('.side-nav, .outer-nav').forEach(function (nav) {
            [...nav.children].forEach(function (item) {
                item.classList.remove('is-active');
            });
            nav.children[nextPos].classList.add('is-active');
        });
    }

    // 8. Update Content
    function updateContent(curPos, nextPos, lastItem) {
        const sections = document.querySelectorAll('.main-content .section');
        sections.forEach(function (section) {
            section.classList.remove('section-is-active');
        });

        sections[nextPos].classList.add('section-is-active');
        sections.forEach(function (section) {
            section.classList.remove('section-next', 'section-prev');
        });

        if ((curPos === lastItem && nextPos === 0) || (curPos === 0 && nextPos === lastItem)) {
            sections.forEach(function (section) {
                section.classList.remove('section-next', 'section-prev');
            });
        } else if (curPos < nextPos) {
            sections[curPos].classList.add('section-next');
        } else {
            sections[curPos].classList.add('section-prev');
        }

        if (nextPos !== 0 && nextPos !== lastItem) {
            document.querySelector('.header-cta').classList.add('is-active');
        } else {
            document.querySelector('.header-cta').classList.remove('is-active');
        }
    }

    // 9. Outer Navigation
    function outerNav() {
        document.querySelector('.header-nav-toggle').addEventListener('click', function () {
            document.querySelector('.perspective').classList.add('perspective-modalview');
            setTimeout(function () {
                document.querySelector('.perspective').classList.add('effect-rotate-left-animate');
            }, 25);
            document.querySelector('.outer-nav').classList.add('is-vis');
            document.querySelectorAll('.outer-nav li, .outer-nav-return').forEach(function (item) {
                item.classList.add('is-vis');
            });
        });

        document.querySelectorAll('.outer-nav-return, .outer-nav li').forEach(function (item) {
            item.addEventListener('click', function () {
                document.querySelector('.perspective').classList.remove('effect-rotate-left-animate');
                setTimeout(function () {
                    document.querySelector('.perspective').classList.remove('perspective-modalview');
                }, 400);
                document.querySelector('.outer-nav').classList.remove('is-vis');
                document.querySelectorAll('.outer-nav li, .outer-nav-return').forEach(function (item) {
                    item.classList.remove('is-vis');
                });
            });
        });
    }

    let currentIndex = 0;

    function updateSliderPosition() {
        const slider = document.querySelector('.slider');
        const items = Array.from(slider.children);
        const totalWorks = items.length;

        // Clear all previous classes
        items.forEach(item => {
            item.classList.remove('slider-item-left', 'slider-item-center', 'slider-item-right');
        });

        // Calculate new positions
        const leftIndex = (currentIndex - 1 + totalWorks) % totalWorks;
        const centerIndex = currentIndex;
        const rightIndex = (currentIndex + 1) % totalWorks;

        // Apply classes
        items[leftIndex].classList.add('slider-item-left');
        items[centerIndex].classList.add('slider-item-center');
        items[rightIndex].classList.add('slider-item-right');
    }

    // Initial setup when page loads
    updateSliderPosition();

    // Navigation buttons
    document.querySelectorAll('.slider-prev, .slider-next').forEach(function (button) {
        button.addEventListener('click', function () {
            const slider = document.querySelector('.slider');
            const items = Array.from(slider.children);
            const totalWorks = items.length;

            slider.style.opacity = 0;

            setTimeout(function () {
                if (button.classList.contains('slider-next')) {
                    currentIndex = (currentIndex + 1) % totalWorks;
                } else {
                    currentIndex = (currentIndex - 1 + totalWorks) % totalWorks;
                }

                updateSliderPosition();
                slider.style.opacity = 1;
            }, 400);
        });
    });

    // 11. Transition Labels
    document.querySelectorAll('.work-request-information input').forEach(function (input) {
        input.addEventListener('focusout', function () {
            if (this.value === "") {
                this.classList.remove('has-value');
            } else {
                this.classList.add('has-value');
            }
            window.scrollTo(0, 0);  // Correct mobile device window position
        });
    });

    // Call the necessary functions
    outerNav();
});