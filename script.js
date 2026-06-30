/* =====================================================================
   HAPPY BIRTHDAY PAPA JI — script.js
   Organized in small, independent modules so any section can be
   edited or removed without breaking the others.
===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPhotoFallbacks();
  initRevealAnimations();
  initDotNav();
  initGarlandProgress();
  initMusicToggle();
  initPetalField();
  initGallery();
  initTimelineFill();
  initTypewriterLetter();
  initGiftBox();
  initFinaleConfetti();
});

/* ---------------------------------------------------------------------
   1. PHOTO FALLBACKS
   If an <img> placeholder file (photo1.jpg etc.) doesn't exist yet,
   swap it for a friendly on-brand placeholder instead of a broken icon.
--------------------------------------------------------------------- */
function initPhotoFallbacks() {
  document.querySelectorAll('img[data-placeholder-text]').forEach((img) => {
    img.addEventListener('error', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'photo-fallback';
      wrapper.textContent = img.dataset.placeholderText || 'Add a photo here';
      img.replaceWith(wrapper);
    });
  });
}

/* ---------------------------------------------------------------------
   2. SCROLL REVEAL ANIMATIONS (.reveal-up / .reveal-side)
--------------------------------------------------------------------- */
function initRevealAnimations() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-side');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   3. SIDE DOT NAVIGATION — highlights the section currently in view
--------------------------------------------------------------------- */
function initDotNav() {
  const dots = document.querySelectorAll('.dot-nav .dot');
  if (!dots.length) return;
  const sections = Array.from(dots).map((dot) =>
    document.querySelector(dot.getAttribute('href'))
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target);
          dots.forEach((d) => d.classList.remove('active'));
          if (dots[index]) dots[index].classList.add('active');
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((s) => s && observer.observe(s));
}

/* ---------------------------------------------------------------------
   4. GARLAND SCROLL PROGRESS — fills the top thread as you scroll
--------------------------------------------------------------------- */
function initGarlandProgress() {
  const fill = document.getElementById('garlandFill');
  if (!fill) return;
  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------------------------------------------------------------
   5. MUSIC TOGGLE
   Browsers block audio until a user gesture, so playback only ever
   starts from this click handler. Missing audio file fails silently.
--------------------------------------------------------------------- */
function initMusicToggle() {
  const btn = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  audio.volume = 0.25; // keep background music low-volume, as requested

  function startMusic() {
    if (!audio.paused) return;
    audio.play().then(() => {
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Pause background music');
    }).catch(() => {
      // EDIT: add audio/background-music.mp3 to enable music playback
      console.info('Add a music file at background-music.mp3 to enable playback.');
    });
  }

  function stopMusic() {
    audio.pause();
    btn.classList.remove('playing');
    btn.setAttribute('aria-label', 'Play background music');
  }

  // Browsers block audio until a real user gesture happens — there is no
  // way to truly autoplay on page load. The closest practical option is to
  // start music on the visitor's very first tap/click/scroll/keypress
  // anywhere on the page, so it begins almost immediately without them
  // needing to find the music button first.
  const autoStartEvents = ['pointerdown', 'keydown', 'scroll'];
  function autoStart() {
    startMusic();
    autoStartEvents.forEach((evt) => document.removeEventListener(evt, autoStart));
  }
  autoStartEvents.forEach((evt) =>
    document.addEventListener(evt, autoStart, { once: true, passive: true })
  );

  // The button still works normally as a manual play/pause toggle.
  btn.addEventListener('click', () => {
    if (audio.paused) {
      startMusic();
    } else {
      stopMusic();
    }
  });
}

/* ---------------------------------------------------------------------
   6. AMBIENT PETAL FIELD
   A lightweight canvas particle system: drifting marigold petals with
   occasional hearts near the hero, tied to the site's real palette
   instead of generic rainbow confetti.
--------------------------------------------------------------------- */
function initPetalField() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let particles = [];
  const palette = ['#C68A2E', '#D6A23E', '#C97B6C', '#E3B08C'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makePetal() {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      size: 6 + Math.random() * 8,
      speedY: 0.4 + Math.random() * 0.6,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: palette[Math.floor(Math.random() * palette.length)],
      sway: Math.random() * Math.PI * 2,
      isHeart: Math.random() < 0.18,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = p.color;
    if (p.isHeart) {
      const s = p.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.6, -s * 0.2, -s * 1.3, 0, -s * 0.4);
      ctx.bezierCurveTo(s * 0.2, -s * 1.3, s, -s * 0.6, 0, s * 0.3);
      ctx.fill();
    } else {
      // simple marigold petal: a soft ellipse "leaf" shape
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y += p.speedY;
      p.sway += 0.02;
      p.x += p.speedX + Math.sin(p.sway) * 0.4;
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      drawPetal(p);
    });
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);

  // Keep the count low — this is ambient atmosphere, not the main event.
  const count = window.innerWidth < 700 ? 10 : 18;
  particles = Array.from({ length: count }, makePetal);

  if (!reduceMotion) {
    requestAnimationFrame(tick);
  }
}

/* ---------------------------------------------------------------------
   7. MEMORY GALLERY + LIGHTBOX
--------------------------------------------------------------------- */
function initGallery() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  if (!items.length || !lightbox) return;

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function openAt(index) {
    currentIndex = (index + items.length) % items.length;
    const img = items[currentIndex].querySelector('img');
    lightboxImg.src = img ? img.src : '';
    lightboxImg.alt = img ? img.alt : '';
    lightboxCaption.textContent = items[currentIndex].dataset.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => openAt(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => openAt(currentIndex - 1));
  nextBtn.addEventListener('click', () => openAt(currentIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') openAt(currentIndex - 1);
    if (e.key === 'ArrowRight') openAt(currentIndex + 1);
  });
}

/* ---------------------------------------------------------------------
   8. TIMELINE FILL — the vertical line fills as it scrolls into view
--------------------------------------------------------------------- */
function initTimelineFill() {
  const section = document.getElementById('timeline');
  const fill = document.getElementById('timelineFill');
  if (!section || !fill) return;

  function update() {
    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height + viewportH;
    const scrolled = viewportH - rect.top;
    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    fill.style.height = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------------------------
   9. TYPEWRITER GRATITUDE LETTER
   Types out the letter body once it scrolls into view. The full text
   lives in the data-full-text attribute so it's easy to edit in HTML.
--------------------------------------------------------------------- */
function initTypewriterLetter() {
  const el = document.getElementById('letterBody');
  if (!el) return;
  const fullText = el.dataset.fullText || '';
  el.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '\u00A0';

  let started = false;

  function type() {
    let i = 0;
    el.appendChild(cursor);
    const speed = 18; // ms per character — tune for a faster/slower reveal
    const interval = setInterval(() => {
      if (i < fullText.length) {
        cursor.insertAdjacentText('beforebegin', fullText[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          type();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(el);
}

/* ---------------------------------------------------------------------
   10. INTERACTIVE GIFT BOX
--------------------------------------------------------------------- */
function initGiftBox() {
  const box = document.getElementById('giftBox');
  const reveal = document.getElementById('giftReveal');
  if (!box || !reveal) return;

  box.addEventListener('click', () => {
    const isOpen = box.classList.toggle('open');
    reveal.classList.toggle('show', isOpen);
    box.setAttribute('aria-label', isOpen ? 'Close your gift' : 'Open your gift');
  });
}

/* ---------------------------------------------------------------------
   11. FINALE CONFETTI + CELEBRATE AGAIN BUTTON
   A restrained confetti burst using the site's own palette — gold,
   rose, and cream — rather than a generic rainbow blast.
--------------------------------------------------------------------- */
function initFinaleConfetti() {
  const section = document.getElementById('finale');
  const canvas = document.getElementById('confetti-canvas');
  const button = document.getElementById('celebrateBtn');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#C68A2E', '#D6A23E', '#C97B6C', '#F2D9A8', '#FFFBF5'];
  let pieces = [];
  let running = false;
  let frame = 0;

  function resize() {
    canvas.width = section.clientWidth;
    canvas.height = section.clientHeight;
  }

  function makePiece() {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 80,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  function burst(count = 110) {
    resize();
    pieces = pieces.concat(Array.from({ length: count }, makePiece));
    frame = 0;
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }

  function loop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    pieces = pieces.filter((p) => p.y < canvas.height + 40);

    if (pieces.length > 0 && frame < 600) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.addEventListener('resize', resize);
  resize();

  if (!reduceMotion) {
    let hasFired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasFired) {
            hasFired = true;
            burst(140);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
  }

  if (button) {
    button.addEventListener('click', () => burst(140));
  }
}
