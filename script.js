/* ─────────────────────────────────────────
   ANDERSON HONORATO — LINK TREE
   script.js — Interações & Efeitos
   ───────────────────────────────────────── */

/* ── Cursor glow suave ── */
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(74,244,232,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.12s ease, top 0.12s ease, opacity 0.4s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
        ticking = false;
      });
      ticking = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
})();

/* ── Ripple click nos link-cards ── */
document.querySelectorAll('.link-card, .model-card, .social-btn').forEach(el => {
  el.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(74,244,232,0.12);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-anim 0.55s ease forwards;
      pointer-events: none;
      z-index: 10;
    `;

    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

/* ── Inject ripple keyframe ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(style);

/* ── Tilt 3D suave nos link-cards (desktop only) ── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-3px) scale(1.01) rotateX(${-dy * 3}deg) rotateY(${dx * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── Intersection Observer: entrada suave ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.dev-card, .model-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  observer.observe(el);
});

/* ── Avatar: video fallback para foto ── */
const video = document.querySelector('.avatar-video');
const photo = document.querySelector('.avatar-photo');

if (video) {
  video.addEventListener('error', () => {
    video.style.display = 'none';
    if (photo) photo.style.zIndex = '1';
  });

  // Se o src não existir ou estiver vazio, esconde o vídeo
  if (!video.src || video.src === window.location.href) {
    video.style.display = 'none';
  }
}
