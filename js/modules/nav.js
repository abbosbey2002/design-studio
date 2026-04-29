// Header glass effect, auto theme switching, mobile drawer, scroll progress.
export function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // ---------- Scroll progress bar ----------
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  // ---------- Mobile drawer (cloned from desktop nav) ----------
  buildMobileDrawer(header);

  // ---------- Scrolled state ----------
  let lastScroll = -1;
  let ticking = false;

  function updateScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (y !== lastScroll) {
      header.classList.toggle('is-scrolled', y > 24);

      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, (y / docH) * 100) : 0;
      progress.style.width = pct + '%';

      lastScroll = y;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });

  updateScroll();

  // ---------- Auto-theme via IntersectionObserver ----------
  // Sections that should flip the navbar to "dark" mode while at the top of viewport.
  const darkSections = document.querySelectorAll('[data-nav-theme="dark"]');
  if (darkSections.length) {
    let darkCount = 0;
    const navOffset = 72; // approx navbar height

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) darkCount++;
        else darkCount = Math.max(0, darkCount - 1);
      });
      header.classList.toggle('is-dark', darkCount > 0);
    }, {
      // Trigger when section's top crosses just below the navbar
      // and untrigger when section's top leaves the top viewport zone.
      rootMargin: `-${navOffset}px 0px -${Math.max(window.innerHeight - navOffset - 1, 0)}px 0px`,
      threshold: 0,
    });

    darkSections.forEach((s) => io.observe(s));
  }
}

function buildMobileDrawer(header) {
  // If already built, skip
  if (document.querySelector('.mobile-drawer')) return;

  const desktopNav = header.querySelector('nav');
  if (!desktopNav) return;

  // Hamburger toggle
  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span>';
  header.appendChild(toggle);

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-drawer-backdrop';
  document.body.appendChild(backdrop);

  // Drawer
  const drawer = document.createElement('aside');
  drawer.className = 'mobile-drawer';
  drawer.setAttribute('aria-hidden', 'true');

  const drawerNav = document.createElement('nav');
  // Clone visible link items from desktop nav (excluding the lang toggle)
  desktopNav.querySelectorAll('a').forEach((a) => {
    const link = a.cloneNode(true);
    link.classList.remove('nav-link-hide-mobile');
    drawerNav.appendChild(link);
  });
  drawer.appendChild(drawerNav);

  // Footer of drawer
  const drawerFooter = document.createElement('div');
  drawerFooter.className = 'mobile-drawer-footer';

  // Clone the language toggle so it stays in sync with the existing one
  const desktopLang = desktopNav.querySelector('.lang-toggle');
  if (desktopLang) {
    const langClone = desktopLang.cloneNode(true);
    drawerFooter.appendChild(langClone);
    // Wire cloned lang buttons to the existing handlers
    langClone.querySelectorAll('button[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const original = desktopNav.querySelector(`.lang-toggle button[data-lang="${btn.dataset.lang}"]`);
        if (original) original.click();
        closeMenu();
      });
    });
  }

  const contact = document.createElement('a');
  contact.href = 'mailto:hello@studio-abdukarim.com';
  contact.style.color = '#fff';
  contact.style.opacity = '0.85';
  contact.textContent = 'hello@studio-abdukarim.com';
  drawerFooter.appendChild(contact);

  drawer.appendChild(drawerFooter);
  document.body.appendChild(drawer);

  // Open / close
  function openMenu() {
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeMenu() {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }
  function toggleMenu() {
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
  }

  toggle.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', closeMenu);
  drawerNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
  });

  // Close drawer when resizing past breakpoint
  let mql = window.matchMedia('(min-width: 769px)');
  mql.addEventListener('change', (e) => { if (e.matches) closeMenu(); });
}
