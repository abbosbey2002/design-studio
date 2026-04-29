// Static-friendly page transition overlay.
// On link click → slide overlay UP from bottom → navigate.
// On load → slide overlay DOWN out of view.

const TRANSITION_MS = 700;

function createOverlay() {
  let el = document.querySelector('.page-overlay');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'page-overlay';
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    background: 'var(--ink)',
    zIndex: '9000',
    transform: 'translateY(100%)',
    transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
    pointerEvents: 'none',
  });

  // Logo or label inside overlay
  const inner = document.createElement('div');
  inner.style.cssText = `
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg);
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  inner.textContent = 'Studio Abdukarim';
  el.appendChild(inner);
  document.body.appendChild(el);
  return el;
}

function isInternalLink(a) {
  if (!a) return false;
  if (a.target === '_blank') return false;
  if (a.hasAttribute('download')) return false;
  const href = a.getAttribute('href');
  if (!href) return false;
  if (href.startsWith('#')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      return new URL(href).origin === window.location.origin;
    } catch { return false; }
  }
  return true;
}

export function initPageTransitions() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const overlay = createOverlay();
  const inner = overlay.firstChild;

  // Outro: slide overlay in
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!isInternalLink(a)) return;
    if (a.hasAttribute('data-no-transition')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();
    overlay.style.transform = 'translateY(0)';
    setTimeout(() => { inner.style.opacity = '1'; }, TRANSITION_MS / 2);
    setTimeout(() => {
      window.location.href = a.href;
    }, TRANSITION_MS);
  });

  // Intro: on load, animate overlay out (start above, slide down)
  // Setup intro: place overlay covering screen, then animate down
  overlay.style.transition = 'none';
  overlay.style.transform = 'translateY(0)';
  inner.style.opacity = '1';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`;
      inner.style.opacity = '0';
      overlay.style.transform = 'translateY(-100%)';
      // After intro, reset position to bottom for next outro
      setTimeout(() => {
        overlay.style.transition = 'none';
        overlay.style.transform = 'translateY(100%)';
        requestAnimationFrame(() => {
          overlay.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`;
        });
      }, TRANSITION_MS + 50);
    });
  });

  // Browser back-button handling
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      overlay.style.transition = 'none';
      overlay.style.transform = 'translateY(100%)';
      inner.style.opacity = '0';
    }
  });
}
