// Parallax scroll using GSAP ScrollTrigger when available, else fallback to scroll listener
export function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  if (window.gsap && window.ScrollTrigger) {
    const { gsap, ScrollTrigger } = window;
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || -0.2;
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.dataset.parallaxTrigger ? document.querySelector(el.dataset.parallaxTrigger) : el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
    return;
  }

  // Fallback (vanilla)
  function update() {
    const winH = window.innerHeight;
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || -0.2;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > winH) return;
      const progress = (rect.top - winH) / (winH + rect.height);
      el.style.transform = `translate3d(0, ${progress * speed * 200}px, 0)`;
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Image reveal — clip-path based.
// Applies the clip to the INNER image/fill so the wrapper's gradient bg stays
// visible even if the observer (or the image itself) never fires.
export function initImageReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('[data-reveal-image]');
  if (!items.length) return;

  const targets = new Map(); // wrapper -> inner element to clip
  items.forEach((el) => {
    const inner =
      el.querySelector('img, .work-media-fill, .full-bleed-fill') || el;
    inner.style.clipPath = 'inset(100% 0 0 0)';
    inner.style.willChange = 'clip-path';
    inner.style.transition = 'clip-path 1.4s cubic-bezier(0.76, 0, 0.24, 1)';
    targets.set(el, inner);

    // If an <img> errors out (e.g. picsum offline), drop it so the gradient bg shows.
    if (inner.tagName === 'IMG') {
      inner.addEventListener('error', () => {
        inner.style.display = 'none';
      }, { once: true });
    }
  });

  const reveal = (wrapper) => {
    const t = targets.get(wrapper);
    if (t) t.style.clipPath = 'inset(0 0 0 0)';
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  items.forEach((el) => io.observe(el));

  // Safety net: if the IO somehow misses an element that's already on-screen
  // by the time JS finishes booting, force-reveal anything visible.
  requestAnimationFrame(() => {
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight && r.bottom > 0;
      if (inView) {
        reveal(el);
        io.unobserve(el);
      }
    });
  });
}
