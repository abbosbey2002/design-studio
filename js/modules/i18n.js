// Lightweight i18n: data-i18n="key.path" → translation from JSON
const STORAGE_KEY = 'studio_lang';
const FALLBACK = 'en';

let translations = {};
let currentLang = localStorage.getItem(STORAGE_KEY) || FALLBACK;

function getBase() {
  if (window.__I18N_BASE__) return window.__I18N_BASE__;
  // auto-detect: root pages → ./i18n, /work/foo.html → ../i18n
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const isFile = window.location.pathname.endsWith('.html');
  const folders = isFile ? depth - 1 : depth;
  return folders > 0 ? '../'.repeat(folders) + 'i18n' : './i18n';
}

async function loadLang(lang) {
  try {
    const res = await fetch(`${getBase()}/${lang}.json`);
    if (!res.ok) throw new Error('i18n load failed');
    translations = await res.json();
  } catch (err) {
    console.warn('i18n: falling back to inline defaults', err);
    translations = {};
  }
}

function getValue(path) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), translations);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = getValue(key);
    if (val != null) {
      // If element has data-i18n-html, set innerHTML (allows <em>, <br>)
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    // format: "attr:key.path,attr2:key2"
    const map = el.dataset.i18nAttr.split(',');
    map.forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const val = getValue(key);
      if (val != null) el.setAttribute(attr, val);
    });
  });

  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

export async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  await loadLang(lang);
  applyTranslations();
}

export async function initI18n() {
  await loadLang(currentLang);
  applyTranslations();

  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

export function getLang() { return currentLang; }
