/* ===========================================
   ANDERSON HONORATO — Link Tree script.js
   =========================================== */

/* ── 1. TEMA CLARO / ESCURO ── */
const html      = document.documentElement;
const themBtn   = document.getElementById('themeToggle');
const saved     = localStorage.getItem('theme');
const sysDark   = window.matchMedia('(prefers-color-scheme: dark)').matches;
html.dataset.theme = saved || (sysDark ? 'dark' : 'light');

themBtn.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('theme', next);
});


/* ── 2. MEDIA SWITCHER — foto ↔ avatar ── */
const facePhoto  = document.getElementById('facePhoto');
const faceAvatar = document.getElementById('faceAvatar');
const dotPhoto   = document.getElementById('dotPhoto');
const dotAvatar  = document.getElementById('dotAvatar');
const video      = document.getElementById('avatarVideo');
const switcher   = document.getElementById('mediaSwitcher');

let videoReady   = false;
let showingPhoto = true;
let switchTimer  = null;

// Duração padrão caso o vídeo não informe
const PHOTO_HOLD  = 4000;  // ms que a foto fica visível
const AVATAR_HOLD = 0;     // 0 = espera o vídeo terminar naturalmente

function showPhoto() {
  showingPhoto = true;
  facePhoto.classList.add('active');
  faceAvatar.classList.remove('active');
  dotPhoto.classList.add('active');
  dotAvatar.classList.remove('active');
  video.pause();
  video.currentTime = 0;
  clearTimeout(switchTimer);
  switchTimer = setTimeout(showAvatar, PHOTO_HOLD);
}

function showAvatar() {
  if (!videoReady) { switchTimer = setTimeout(showAvatar, 500); return; }
  showingPhoto = false;
  faceAvatar.classList.add('active');
  facePhoto.classList.remove('active');
  dotAvatar.classList.add('active');
  dotPhoto.classList.remove('active');
  video.currentTime = 0;
  video.play().catch(() => {});
}

// Quando o vídeo termina, volta para foto
video.addEventListener('ended', showPhoto);

// Quando metadados carregam, libera uso do vídeo
video.addEventListener('loadedmetadata', () => {
  videoReady = true;
  // Inicia ciclo: começa na foto
  switchTimer = setTimeout(showAvatar, PHOTO_HOLD);
});

// Se falhar (sem arquivo), esconde o dot do avatar
video.addEventListener('error', () => {
  dotAvatar.style.display = 'none';
  clearTimeout(switchTimer);
});

// Clique manual no card alterna
switcher.addEventListener('click', () => {
  clearTimeout(switchTimer);
  if (showingPhoto) showAvatar();
  else              showPhoto();
});

// Foto: se não carregar, mantém emoji placeholder
const photoImg = document.querySelector('.photo-img');
if (photoImg) {
  photoImg.addEventListener('error', () => {
    photoImg.style.display = 'none';
    facePhoto.classList.add('no-photo');
  });
}


/* ── 3. BOLHAS COM FÍSICA ── */
(function initBubbles() {
  const canvas = document.getElementById('bubblesCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, bubbles = [];
  let mouseX = -999, mouseY = -999;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function getColor() {
    const dark = html.dataset.theme === 'dark';
    return dark ? 'rgba(255,255,255,' : 'rgba(0,0,0,';
  }

  class Bubble {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.r  = 6 + Math.random() * 18;
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + this.r + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(0.25 + Math.random() * 0.5);
      this.op = 0.04 + Math.random() * 0.08;
    }
    update() {
      // Repulsão do mouse
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const repel = 90;
      if (dist < repel && dist > 0) {
        const force = (repel - dist) / repel;
        this.vx += (dx / dist) * force * 0.6;
        this.vy += (dy / dist) * force * 0.6;
      }
      // Atrito
      this.vx *= 0.97;
      this.vy *= 0.97;
      // Drift natural para cima
      this.vy -= 0.004;
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -this.r * 2) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = getColor() + this.op + ')';
      ctx.lineWidth   = 1;
      ctx.stroke();
      // Brilho interno
      const g = ctx.createRadialGradient(
        this.x - this.r*0.3, this.y - this.r*0.3, this.r*0.05,
        this.x, this.y, this.r
      );
      g.addColorStop(0, getColor() + (this.op*0.8) + ')');
      g.addColorStop(1, getColor() + '0)');
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  // Cria ~28 bolhas
  for (let i = 0; i < 28; i++) bubbles.push(new Bubble());

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  document.addEventListener('touchmove', e => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    bubbles.forEach(b => { b.update(); b.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ── 4. SHOCK EFFECT nos botões ── */
(function initShock() {

  class ShockParticle {
    constructor(x, y, color) {
      this.x  = x; this.y = y;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6;
      this.life = 1;
      this.decay = 0.03 + Math.random() * 0.03;
      this.r = 1.5 + Math.random() * 2;
      this.color = color;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.92;
      this.vy *= 0.92;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgb(${this.color})`;
      ctx.fill();
      ctx.restore();
    }
  }

  class ShockArc {
    constructor(ox, oy, tx, ty, color) {
      this.ox = ox; this.oy = oy;
      this.tx = tx; this.ty = ty;
      this.life = 1;
      this.decay = 0.08 + Math.random() * 0.08;
      this.color = color;
      this.segments = 8 + Math.floor(Math.random()*6);
    }
    update() { this.life -= this.decay; }
    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life) * 0.7;
      ctx.strokeStyle = `rgb(${this.color})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.ox, this.oy);
      let px = this.ox, py = this.oy;
      for (let i = 1; i <= this.segments; i++) {
        const t  = i / this.segments;
        const nx = this.ox + (this.tx - this.ox) * t + (Math.random()-0.5)*18;
        const ny = this.oy + (this.ty - this.oy) * t + (Math.random()-0.5)*18;
        ctx.lineTo(nx, ny);
        px = nx; py = ny;
      }
      ctx.lineTo(this.tx, this.ty);
      ctx.stroke();
      ctx.restore();
    }
  }

  document.querySelectorAll('.shock-btn').forEach(btn => {
    const canvas = btn.querySelector('.shock-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], arcs = [], raf = null, active = false;

    function resize() {
      const r = btn.getBoundingClientRect();
      canvas.width  = r.width;
      canvas.height = r.height;
    }

    function getShockColor() {
      return html.dataset.theme === 'dark' ? '100,180,255' : '80,80,200';
    }

    function spawnShock(mx, my) {
      const w = canvas.width, h = canvas.height;
      // Partículas no ponto do mouse
      for (let i = 0; i < 12; i++) {
        particles.push(new ShockParticle(mx, my, getShockColor()));
      }
      // Arcos elétricos do mouse para bordas aleatórias
      const targets = [
        [0, Math.random()*h], [w, Math.random()*h],
        [Math.random()*w, 0], [Math.random()*w, h]
      ];
      targets.forEach(([tx,ty]) => {
        if (Math.random() > 0.4)
          arcs.push(new ShockArc(mx, my, tx, ty, getShockColor()));
      });
    }

    function loop() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles = particles.filter(p => p.life > 0);
      arcs      = arcs.filter(a => a.life > 0);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      arcs.forEach(a => { a.update(); a.draw(ctx); });
      if (particles.length || arcs.length) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }

    btn.addEventListener('mouseenter', () => {
      resize();
      active = true;
    });

    btn.addEventListener('mousemove', e => {
      if (!active) return;
      const r  = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      // Spawn a cada move (throttle)
      if (Math.random() > 0.55) spawnShock(mx, my);
      if (!raf) raf = requestAnimationFrame(loop);
    });

    btn.addEventListener('mouseleave', () => {
      active = false;
      // Deixa as partículas existentes terminarem
      if (!raf && (particles.length || arcs.length))
        raf = requestAnimationFrame(loop);
    });
  });
})();


/* ── 5. TOOLTIP GLOBAL ── */
(function initTooltip() {
  const tip = document.getElementById('tooltip');
  let hideTimer;

  document.querySelectorAll('[data-tip]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      clearTimeout(hideTimer);
      tip.textContent = el.dataset.tip;
      tip.classList.add('show');
      positionTip(e);
    });

    el.addEventListener('mousemove', positionTip);

    el.addEventListener('mouseleave', () => {
      tip.classList.remove('show');
    });
  });

  function positionTip(e) {
    const pad = 14;
    let x = e.clientX + pad;
    let y = e.clientY - 36;
    // Evita sair da tela
    if (x + 240 > window.innerWidth)  x = e.clientX - 240;
    if (y < 0) y = e.clientY + pad;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }
})();


/* ── 6. RIPPLE nos botões ── */
document.querySelectorAll('.btn:not(.btn--soon)').forEach(el => {
  el.addEventListener('click', function (e) {
    const r    = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(0,0,0,0.07);
      transform:scale(0);animation:rpl .55s ease forwards;z-index:6;
    `;
    el.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
});

const _s = document.createElement('style');
_s.textContent = '@keyframes rpl{to{transform:scale(2.5);opacity:0;}}';
document.head.appendChild(_s);