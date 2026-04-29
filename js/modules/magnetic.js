// Magnetic effect — element follows cursor when nearby
export function initMagnetic() {
  if (window.innerWidth <= 1024) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('[data-magnetic]');
  items.forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    let raf;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = 'translate(0, 0)';
      setTimeout(() => { el.style.transition = ''; }, 600);
    });
  });
}
