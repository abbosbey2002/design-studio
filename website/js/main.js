// Forge — IT studio site (i18n + form + nav)

const STORAGE_LANG = 'forge_lang';
const SUPPORTED_LANGS = ['uz', 'ru', 'en'];
const FALLBACK = 'uz';

let translations = {};
let currentLang = readLang();

function readLang() {
  // 1. URL param (?lang=ru) — highest priority, e.g. coming from Google hreflang
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && SUPPORTED_LANGS.includes(urlLang)) return urlLang;
  // 2. Saved preference
  const saved = localStorage.getItem(STORAGE_LANG);
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  // 3. Browser language
  const browser = (navigator.language || 'en').toLowerCase().split('-')[0];
  if (SUPPORTED_LANGS.includes(browser)) return browser;
  return FALLBACK;
}

async function loadLang(lang) {
  try {
    const res = await fetch(`./i18n/${lang}.json`);
    if (!res.ok) throw new Error('i18n load failed');
    translations = await res.json();
  } catch (err) {
    console.warn('i18n: keeping HTML defaults', err);
    translations = {};
  }
}

function getValue(path) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), translations);
}

function applyTranslations() {
  // text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = getValue(key);
    if (val == null) return;
    if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
    else el.textContent = val;
  });
  // attributes (e.g., placeholders) — format: "attr:key.path"
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const val = getValue(key);
      if (val != null) el.setAttribute(attr, val);
    });
  });

  // SEO meta tags swap
  const metaTitle = getValue('meta.title');
  const metaDesc = getValue('meta.description');
  const ogTitle = getValue('meta.og_title');
  const ogDesc = getValue('meta.og_description');

  if (metaTitle) document.title = metaTitle;
  if (metaDesc) setMeta('name', 'description', metaDesc);
  if (ogTitle) setMeta('property', 'og:title', ogTitle);
  if (ogDesc)  setMeta('property', 'og:description', ogDesc);
  if (ogTitle) setMeta('name', 'twitter:title', ogTitle);
  if (ogDesc)  setMeta('name', 'twitter:description', ogDesc);

  // og:locale
  const ogLocale = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' }[currentLang] || 'uz_UZ';
  setMeta('property', 'og:locale', ogLocale);

  // html lang attribute + active toggle
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-toggle button').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
}

function setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

async function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = FALLBACK;
  currentLang = lang;
  localStorage.setItem(STORAGE_LANG, lang);
  await loadLang(lang);
  applyTranslations();
}

async function initI18n() {
  await loadLang(currentLang);
  applyTranslations();
  document.querySelectorAll('.lang-toggle button').forEach((b) => {
    b.addEventListener('click', () => setLanguage(b.dataset.lang));
  });
}

// ---------- NAV ----------
function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  let ticking = false;
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min(100, (y / docH) * 100) : 0;
    progress.style.width = pct + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  buildDrawer(header);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

function buildDrawer(header) {
  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.innerHTML = '<span></span><span></span>';
  header.appendChild(toggle);

  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-drawer-backdrop';
  document.body.appendChild(backdrop);

  const drawer = document.createElement('aside');
  drawer.className = 'mobile-drawer';

  const nav = document.createElement('nav');
  const links = [
    { key: 'nav.services', label: 'Xizmatlar', href: '#services', n: '01' },
    { key: 'nav.work',     label: 'Ishlar',    href: '#work',     n: '02' },
    { key: 'nav.process',  label: 'Jarayon',   href: '#process',  n: '03' },
    { key: 'nav.pricing',  label: 'Narxlar',   href: '#pricing',  n: '04' },
    { key: 'nav.cta',      label: 'Aloqa',     href: '#contact',  n: '05' },
  ];
  links.forEach(({ key, label, href, n }) => {
    const a = document.createElement('a');
    a.href = href;
    a.innerHTML = `<span data-i18n="${key}">${label}</span><span class="num">${n}</span>`;
    nav.appendChild(a);
  });

  // Mobile lang toggle inside drawer
  const langDrawer = document.createElement('div');
  langDrawer.className = 'lang-toggle';
  langDrawer.style.marginTop = '32px';
  langDrawer.style.alignSelf = 'flex-start';
  langDrawer.innerHTML = `
    <button data-lang="uz">UZ</button>
    <button data-lang="ru">RU</button>
    <button data-lang="en">EN</button>
  `;
  langDrawer.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
    b.addEventListener('click', () => setLanguage(b.dataset.lang));
  });

  drawer.appendChild(nav);
  drawer.appendChild(langDrawer);
  document.body.appendChild(drawer);

  function open()  { document.body.classList.add('menu-open'); }
  function close() { document.body.classList.remove('menu-open'); }

  toggle.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? close() : open();
  });
  backdrop.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) close();
  });

  const mql = window.matchMedia('(min-width: 921px)');
  mql.addEventListener('change', (e) => { if (e.matches) close(); });
}

// ---------- TOAST ----------
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="ic">✓</span><span>${message}</span>`;
  container.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('is-visible')));
  setTimeout(() => {
    t.classList.remove('is-visible');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, 4000);
}

// ---------- FORM ----------
function initForm() {
  const form = document.getElementById('callbackForm');
  if (!form) return;

  // Format phone input as user types: 90 123 45 67
  const phoneInput = form.querySelector('input[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 9);
      const out = [];
      if (v.length > 0) out.push(v.slice(0, 2));
      if (v.length > 2) out.push(v.slice(2, 5));
      if (v.length > 5) out.push(v.slice(5, 7));
      if (v.length > 7) out.push(v.slice(7, 9));
      e.target.value = out.join(' ');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();

    if (!name || phone.replace(/\D/g, '').length < 7) {
      // gentle inline focus on missing field
      if (!name) form.querySelector('[name="name"]').focus();
      else phoneInput?.focus();
      return;
    }

    // Show success state
    form.classList.add('is-submitted');
    form.querySelector('.form-success').classList.add('is-visible');

    // Toast (translated)
    const toastMsg = getValue('form.toast') || 'Request received';
    showToast(toastMsg);

    // Reset link inside success state — go back to form
    form.querySelector('.form-success .reset')?.addEventListener('click', (ev) => {
      ev.preventDefault();
      form.reset();
      form.classList.remove('is-submitted');
      form.querySelector('.form-success').classList.remove('is-visible');
    }, { once: true });
  });

  // Newsletter form (small)
  const news = document.getElementById('newsForm');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = (currentLang === 'ru') ? 'Подписка оформлена'
                : (currentLang === 'en') ? 'Subscribed'
                : 'Obuna qabul qilindi';
      showToast(msg);
      news.reset();
    });
  }
}

// ---------- REVEALS ----------
function initReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 80 + i * 100);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal-up:not(.is-visible)').forEach((el) => {
    if (!el.closest('.hero')) io.observe(el);
  });
}

// ---------- BOOT ----------
async function init() {
  await initI18n();
  initNav();
  initForm();
  initReveals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
