import { initCursor } from './modules/cursor.js';
import { initMagnetic } from './modules/magnetic.js';
import { initSplitTextReveals } from './modules/splitText.js';
import { initParallax, initImageReveal } from './modules/parallax.js';
import { initMarquee } from './modules/marquee.js';
import { initI18n } from './modules/i18n.js';
import { initSmoothScroll } from './modules/smoothScroll.js';
import { initPageTransitions } from './modules/pageTransitions.js';

async function init() {
  // Register GSAP plugins if loaded
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  await initI18n();
  initSmoothScroll();
  initCursor();
  initSplitTextReveals();
  initParallax();
  initImageReveal();
  initMarquee();
  initMagnetic();
  initPageTransitions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
