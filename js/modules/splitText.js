// Split text into lines and characters for reveal animations.
// GSAP-free, vanilla. Wraps text in <span class="split-line"><span>...</span></span>
export function splitText(el, type = 'lines') {
  const text = el.textContent.trim();
  el.textContent = '';

  if (type === 'lines') {
    // Split by spaces, then group into lines after layout
    const words = text.split(/\s+/);
    const wrapper = document.createDocumentFragment();
    words.forEach((word, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'split-line';
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.transform = 'translateY(110%)';
      inner.style.transition = `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s`;
      inner.textContent = word;
      wrap.appendChild(inner);
      wrapper.appendChild(wrap);
      if (i < words.length - 1) wrapper.appendChild(document.createTextNode(' '));
    });
    el.appendChild(wrapper);
  } else if (type === 'words') {
    const words = text.split(/\s+/);
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.transitionDelay = `${i * 0.02}s`;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }
}

export function revealSplitLines(el) {
  const inners = el.querySelectorAll('.split-line > span');
  inners.forEach((s) => { s.style.transform = 'translateY(0)'; });
}

export function initSplitTextReveals() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Skip splitting in reduced-motion mode — show text as-is
  if (!reduced) {
    document.querySelectorAll('[data-split="lines"]').forEach((el) => splitText(el, 'lines'));
    document.querySelectorAll('[data-split="words"]').forEach((el) => splitText(el, 'words'));
  }

  // Reveal on load for [data-reveal-on-load]
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-reveal-on-load]').forEach((el) => revealSplitLines(el));
  });

  if (reduced) {
    // Make all reveal-up elements visible
    document.querySelectorAll('.reveal-up, [data-reveal-on-scroll]').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // IntersectionObserver for scroll-triggered reveals
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealSplitLines(entry.target);
        entry.target.querySelectorAll('.word').forEach((w) => w.classList.add('is-visible'));
        if (entry.target.classList.contains('reveal-up')) {
          entry.target.classList.add('is-visible');
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('[data-reveal-on-scroll], .reveal-up').forEach((el) => io.observe(el));
}
