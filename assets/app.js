document.addEventListener("DOMContentLoaded", function () {
  // ============================================================
  // HERO CANVAS BACKGROUND
  // ============================================================
  (function () {
    const canvas = document.getElementById("hero-bg");
    if (!canvas) return;
    const hero = canvas.parentElement;
    const ctx = canvas.getContext("2d");

    let W, H, particles;
    const mouse = { x: -999, y: -999 };
    const COLS = ["rgba(15,51,255,", "rgba(134,134,172,", "rgba(255,255,255,"];

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
      init();
    }

    function init() {
      const GRID = 32;
      particles = [];
      const cols = Math.ceil(W / GRID) + 1;
      const rows = Math.ceil(H / GRID) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          particles.push({
            x: c * GRID,
            y: r * GRID,
            ox: c * GRID,
            oy: r * GRID,
            vx: 0,
            vy: 0,
            size: Math.random() < 0.12 ? 1.8 : 0.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.6,
            ci: Math.floor(Math.random() * COLS.length),
          });
        }
      }
    }

    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // base background
      ctx.fillStyle = "#060610";
      ctx.fillRect(0, 0, W, H);

      // blue glow — top left
      const g1 = ctx.createRadialGradient(
        W * 0.15,
        H * 0.3,
        0,
        W * 0.15,
        H * 0.3,
        W * 0.55,
      );
      g1.addColorStop(0, "rgba(15,51,255,0.12)");
      g1.addColorStop(1, "rgba(6,6,16,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // purple glow — bottom right
      const g2 = ctx.createRadialGradient(
        W * 0.8,
        H * 0.7,
        0,
        W * 0.8,
        H * 0.7,
        W * 0.4,
      );
      g2.addColorStop(0, "rgba(134,134,172,0.07)");
      g2.addColorStop(1, "rgba(6,6,16,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // particles
      particles.forEach(function (p) {
        const dx = mouse.x - p.ox;
        const dy = mouse.y - p.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const REPEL = 80;

        if (dist < REPEL) {
          const force = (REPEL - dist) / REPEL;
          p.vx -= (dx / dist) * force * 1.8;
          p.vy -= (dy / dist) * force * 1.8;
        }

        // spring return
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x = p.ox + p.vx;
        p.y = p.oy + p.vy;

        const pulse = Math.sin(t * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = p.size > 1 ? 0.5 + pulse * 0.5 : 0.15 + pulse * 0.2;

        // core dot
        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.size * (p.size > 1 ? 0.8 + pulse * 0.4 : 1),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = COLS[p.ci] + alpha + ")";
        ctx.fill();

        // halo on bright nodes
        if (p.size > 1 && pulse > 0.7) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = COLS[p.ci] + (0.04 * (pulse - 0.7)) / 0.3 + ")";
          ctx.fill();
        }
      });

      t += 0.02;
      requestAnimationFrame(draw);
    }

    hero.addEventListener("mousemove", function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    hero.addEventListener("mouseleave", function () {
      mouse.x = -999;
      mouse.y = -999;
    });

    window.addEventListener("resize", resize);
    resize();
    draw();
  })();

  // ============================================================
  // 1. MOUSE WHEEL NAVIGATION
  // ============================================================
  let canScroll = true,
    scrollController = null;

  document.addEventListener(
    "wheel",
    function (e) {
      if (!document.querySelector(".outer-nav").classList.contains("is-vis")) {
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
    },
    { passive: false },
  );

  // ============================================================
  // 2. NAVIGATION ITEM CLICK
  // ============================================================
  document
    .querySelectorAll(".side-nav li, .outer-nav li")
    .forEach(function (item) {
      item.addEventListener("click", function () {
        if (!this.classList.contains("is-active")) {
          const curActive = this.parentNode.querySelector(".is-active");
          const curPos = Array.from(this.parentNode.children).indexOf(
            curActive,
          );
          const nextPos = Array.from(this.parentNode.children).indexOf(this);
          const lastItem = this.parentNode.children.length - 1;

          updateNavs(nextPos);
          updateContent(curPos, nextPos, lastItem);
        }
      });
    });

  // ============================================================
  // 3. CTA BUTTON CLICK
  // ============================================================
  document.querySelector(".cta").addEventListener("click", function () {
    const curActive = document.querySelector(".side-nav .is-active");
    const curPos = Array.from(
      document.querySelector(".side-nav").children,
    ).indexOf(curActive);
    const lastItem = document.querySelector(".side-nav").children.length - 1;
    const nextPos = lastItem;

    updateNavs(nextPos);
    updateContent(curPos, nextPos, lastItem);
  });

  // ============================================================
  // 4. SWIPE SUPPORT (TOUCH)
  // ============================================================
  const targetElement = document.getElementById("viewport");
  let startTouch = 0;

  targetElement.addEventListener("touchstart", function (e) {
    startTouch = e.touches[0].clientY;
  });

  targetElement.addEventListener("touchend", function (e) {
    const endTouch = e.changedTouches[0].clientY;
    if (startTouch - endTouch > 50) {
      updateHelper({ type: "swipeup" });
    } else if (endTouch - startTouch > 50) {
      updateHelper({ type: "swipedown" });
    }
  });

  // ============================================================
  // 5. KEYBOARD ARROW KEY NAVIGATION
  // ============================================================
  document.addEventListener("keyup", function (e) {
    if (!document.querySelector(".outer-nav").classList.contains("is-vis")) {
      e.preventDefault();
      updateHelper(e);
    }
  });

  // ============================================================
  // 6. HELPER — DETERMINE NEXT POSITION
  // ============================================================
  function updateHelper(param) {
    const curActive = document.querySelector(".side-nav .is-active");
    const curPos = Array.from(
      document.querySelector(".side-nav").children,
    ).indexOf(curActive);
    const lastItem = document.querySelector(".side-nav").children.length - 1;
    let nextPos = 0;

    if (param.type === "swipeup" || param.keyCode === 40 || param > 0) {
      if (curPos !== lastItem) {
        nextPos = curPos + 1;
      } else {
        nextPos = 0;
      }
      updateNavs(nextPos);
      updateContent(curPos, nextPos, lastItem);
    } else if (
      param.type === "swipedown" ||
      param.keyCode === 38 ||
      param < 0
    ) {
      if (curPos !== 0) {
        nextPos = curPos - 1;
      } else {
        nextPos = lastItem;
      }
      updateNavs(nextPos);
      updateContent(curPos, nextPos, lastItem);
    }
  }

  // ============================================================
  // 7. UPDATE NAVIGATION STATE
  // ============================================================
  function updateNavs(nextPos) {
    document.querySelectorAll(".side-nav, .outer-nav").forEach(function (nav) {
      Array.from(nav.children).forEach(function (item) {
        item.classList.remove("is-active");
      });
      nav.children[nextPos].classList.add("is-active");
    });
  }

  // ============================================================
  // 8. UPDATE CONTENT SECTIONS
  // ============================================================
  function updateContent(curPos, nextPos, lastItem) {
    const sections = document.querySelectorAll(".main-content .section");

    sections.forEach(function (section) {
      section.classList.remove(
        "section-is-active",
        "section-next",
        "section-prev",
      );
    });

    sections[nextPos].classList.add("section-is-active");

    if (
      !(
        (curPos === lastItem && nextPos === 0) ||
        (curPos === 0 && nextPos === lastItem)
      )
    ) {
      if (curPos < nextPos) {
        sections[curPos].classList.add("section-next");
      } else {
        sections[curPos].classList.add("section-prev");
      }
    }

    if (nextPos !== 0 && nextPos !== lastItem) {
      document.querySelector(".header-cta").classList.add("is-active");
    } else {
      document.querySelector(".header-cta").classList.remove("is-active");
    }
  }

  // ============================================================
  // 9. OUTER (HAMBURGER) NAVIGATION
  // ============================================================
  function outerNav() {
    document
      .querySelector(".header-nav-toggle")
      .addEventListener("click", function () {
        document
          .querySelector(".perspective")
          .classList.add("perspective-modalview");
        setTimeout(function () {
          document
            .querySelector(".perspective")
            .classList.add("effect-rotate-left-animate");
        }, 25);
        document.querySelector(".outer-nav").classList.add("is-vis");
        document
          .querySelectorAll(".outer-nav li, .outer-nav-return")
          .forEach(function (item) {
            item.classList.add("is-vis");
          });
      });

    document
      .querySelectorAll(".outer-nav-return, .outer-nav li")
      .forEach(function (item) {
        item.addEventListener("click", function () {
          document
            .querySelector(".perspective")
            .classList.remove("effect-rotate-left-animate");
          setTimeout(function () {
            document
              .querySelector(".perspective")
              .classList.remove("perspective-modalview");
          }, 400);
          document.querySelector(".outer-nav").classList.remove("is-vis");
          document
            .querySelectorAll(".outer-nav li, .outer-nav-return")
            .forEach(function (el) {
              el.classList.remove("is-vis");
            });
        });
      });
  }

  // ============================================================
  // 10. PORTFOLIO SLIDER
  // ============================================================
  let currentIndex = 0;

  function updateSliderPosition() {
    const slider = document.querySelector(".slider");
    const items = Array.from(slider.children);
    const totalWorks = items.length;

    items.forEach(function (item) {
      item.classList.remove(
        "slider-item-left",
        "slider-item-center",
        "slider-item-right",
      );
    });

    const leftIndex = (currentIndex - 1 + totalWorks) % totalWorks;
    const centerIndex = currentIndex;
    const rightIndex = (currentIndex + 1) % totalWorks;

    items[leftIndex].classList.add("slider-item-left");
    items[centerIndex].classList.add("slider-item-center");
    items[rightIndex].classList.add("slider-item-right");
  }

  updateSliderPosition();

  document
    .querySelectorAll(".slider-prev, .slider-next")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        const slider = document.querySelector(".slider");
        const totalWorks = Array.from(slider.children).length;

        slider.style.opacity = 0;

        setTimeout(function () {
          if (button.classList.contains("slider-next")) {
            currentIndex = (currentIndex + 1) % totalWorks;
          } else {
            currentIndex = (currentIndex - 1 + totalWorks) % totalWorks;
          }
          updateSliderPosition();
          slider.style.opacity = 1;
        }, 400);
      });
    });

  // ============================================================
  // 11. FLOATING LABEL INPUTS
  // ============================================================
  document
    .querySelectorAll(".work-request-information input")
    .forEach(function (input) {
      input.addEventListener("focusout", function () {
        if (this.value === "") {
          this.classList.remove("has-value");
        } else {
          this.classList.add("has-value");
        }
        window.scrollTo(0, 0);
      });
    });

  // ============================================================
  // INIT
  // ============================================================
  outerNav();
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card-tilt");

  console.log("cards found:", cards.length); // DEBUG

  cards.forEach((card) => {
    const glow = card.querySelector(".card-glow");

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 🔥 STRONGER tilt so you can SEE it
      const rotateX = ((y - centerY) / centerY) * -15;
      const rotateY = ((x - centerX) / centerX) * 15;

      card.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.04)
      `;

      // 🔥 MUCH stronger glow so it's obvious
      glow.style.background = `
        radial-gradient(
          circle at ${x}px ${y}px,
          rgba(79, 172, 254, 0.7),
          transparent 60%
        )
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
      `;

      glow.style.background = `
        radial-gradient(
          circle at 50% 50%,
          rgba(79, 172, 254, 0.35),
          transparent 60%
        )
      `;
    });
  });
});
