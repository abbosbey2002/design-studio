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

// Image reveal — clip-path based
export function initImageReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('[data-reveal-image]');
  items.forEach((el) => {
    el.style.clipPath = 'inset(100% 0 0 0)';
    el.style.transition = 'clip-path 1.4s cubic-bezier(0.76, 0, 0.24, 1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.clipPath = 'inset(0 0 0 0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach((el) => io.observe(el));
}
