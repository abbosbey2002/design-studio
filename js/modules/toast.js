// Lightweight toast: showToast({ title, message, duration })
let container;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function showToast({ title = '', message = '', duration = 4500, icon = '✓' } = {}) {
  const root = ensureContainer();

  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div>${message}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;
  root.appendChild(el);

  // Force reflow then animate in
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));

  let timer;
  const dismiss = () => {
    clearTimeout(timer);
    el.classList.remove('is-visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  };

  el.querySelector('.toast-close').addEventListener('click', dismiss);
  if (duration > 0) timer = setTimeout(dismiss, duration);

  return { dismiss };
}
