// Infinite horizontal marquee. Duplicates content for seamless loop.
export function initMarquee() {
  const tracks = document.querySelectorAll('[data-marquee]');
  tracks.forEach((track) => {
    const speed = parseFloat(track.dataset.marquee) || 60; // pixels per second
    const reverse = track.dataset.marqueeReverse === 'true';

    // Duplicate content for seamless loop
    const original = track.innerHTML;
    track.innerHTML = original + original;

    let offset = 0;
    let lastTime = performance.now();
    let paused = false;

    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });

    function tick(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!paused) {
        offset += speed * dt * (reverse ? 1 : -1);
        const halfWidth = track.scrollWidth / 2;
        if (offset <= -halfWidth) offset += halfWidth;
        if (offset >= 0 && reverse) offset -= halfWidth;
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
