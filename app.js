/* =========================================================
   THIỆP MỜI KỈ YẾU · app.js
   ---------------------------------------------------------
   ✏️  BẢN ĐỒ CHỈNH SỬA NHANH

   [3]  Thời gian sự kiện  → CONFIG.eventStart / eventEnd
   [3b] Mốc đếm ngược     → CONFIG.countdownTo
   [10] Nút xác nhận      → hiệu ứng vàng (không cần link)
   [11] Nhạc nền           → CONFIG.musicFile / musicVolume

   Còn lại (tên lớp, tiêu đề, địa điểm, lời ngỏ, footer...)
   sửa trực tiếp trong index.html — mỗi chỗ có đánh số ✏️[n].
   ========================================================= */
'use strict';

const CONFIG = {
  /* ✏️ [3] THỜI GIAN SỰ KIỆN (giữ đúng định dạng 2 chữ số, +07:00 là giờ Việt Nam) */
  eventStart: '2026-12-12T09:13:00+07:00',
  eventEnd:   '2026-12-12T11:09:00+07:00',

  /* ✏️ [3b] MỐC ĐẾM NGƯỢC (đồng hồ trên thiệp đếm về thời điểm này) */
  countdownTo: '2026-12-12T09:15:00+07:00',

  /* ✏️ [11] NHẠC NỀN: file trong thư mục assets/, tự phát và lặp lại khi trang còn mở.
     Muốn đổi bài: thay file trong assets/ rồi sửa đúng tên ở đây. */
  musicFile: 'otherside-kuraine.mp3',
  musicVolume: 0.5,   /* âm lượng 0 → 1 */

  /* Hiệu ứng nặng hay nhẹ: true = tắt bớt hạt bay cho máy yếu */
  lowEffects: false
};

/* =========================================================
   TIỆN ÍCH
   ========================================================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. TEXTURE PIXEL (sinh bằng canvas, không cần file ảnh)
   ========================================================= */
const TEXTURES = {
  grassTop: {
    seed: 5, base: '#5f9a3c',
    tones: ['#6cb149', '#579038', '#7cc253', '#4f8a34', '#66a743']
  },
  grassSide: {
    seed: 13, base: '#8a5f38',
    tones: ['#9c6b3f', '#7a5230', '#94643a', '#6b4726', '#a06f42'],
    grass: { tones: ['#5f9a3c', '#6cb149', '#548c34', '#7cc253'], rows: 3 }
  },
  dirt: {
    seed: 23, base: '#8a5f38',
    tones: ['#9c6b3f', '#7a5230', '#94643a', '#6b4726', '#a06f42']
  },
  stone: {
    seed: 31, base: '#6f7784',
    tones: ['#78808e', '#666e7b', '#828a98', '#5d6470', '#737b88']
  },
  paper: {
    seed: 41, base: '#f2e2c0',
    tones: ['#f6e8ca', '#eddcb7', '#f0dfbe', '#e9d6ae', '#f4e5c6']
  }
};

function makeTexture(def, size = 16) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  const rand = rng(def.seed);

  g.fillStyle = def.base;
  g.fillRect(0, 0, size, size);

  /* nhiễu pixel: tô ngẫu nhiên ~45% điểm ảnh */
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (rand() < 0.45) {
        g.fillStyle = def.tones[(rand() * def.tones.length) | 0];
        g.fillRect(x, y, 1, 1);
      }
    }
  }

  /* vài cụm 2px cho đỡ bị "nhiễu tĩnh" */
  for (let i = 0; i < 14; i++) {
    g.fillStyle = def.tones[(rand() * def.tones.length) | 0];
    g.fillRect((rand() * size) | 0, (rand() * size) | 0, 2, 1);
  }

  /* lớp cỏ phía trên của "grass side" với mép lởm chởm */
  if (def.grass) {
    for (let x = 0; x < size; x++) {
      const h = def.grass.rows + (rand() < 0.45 ? 1 : 0) + (rand() < 0.18 ? 1 : 0);
      for (let y = 0; y < h; y++) {
        g.fillStyle = def.grass.tones[(rand() * def.grass.tones.length) | 0];
        g.fillRect(x, y, 1, 1);
      }
      /* bóng đổ mảnh dưới lớp cỏ */
      g.fillStyle = 'rgba(40,60,30,.28)';
      g.fillRect(x, h, 1, 1);
    }
  }

  return canvas.toDataURL('image/png');
}

function applyTextures() {
  const root = document.documentElement.style;
  const map = {
    '--tex-grass-top': 'grassTop',
    '--tex-grass-side': 'grassSide',
    '--tex-dirt': 'dirt',
    '--tex-stone': 'stone',
    '--tex-paper': 'paper'
  };
  Object.entries(map).forEach(([cssVar, key]) => {
    try {
      root.setProperty(cssVar, `url("${makeTexture(TEXTURES[key])}")`);
    } catch (err) {
      /* trình duyệt chặn canvas -> dùng màu phẳng, không sao */
    }
  });
}

/* =========================================================
   2. CẢNH NỀN: đồi, sao, đom đóm
   ========================================================= */
function buildHills() {
  const layers = [
    { id: 'hillsFar',  seed: 11, base: 0.34, amp: 0.55, quant: 10, blocks: 34 },
    { id: 'hillsMid',  seed: 29, base: 0.24, amp: 0.62, quant: 12, blocks: 28 },
    { id: 'hillsNear', seed: 47, base: 0.16, amp: 0.58, quant: 14, blocks: 22 }
  ];

  layers.forEach(layer => {
    const host = document.getElementById(layer.id);
    if (!host) return;

    const rand = rng(layer.seed);
    let values = Array.from({ length: layer.blocks }, () => rand());

    /* làm mượt để thành đồi chứ không phải răng cưa */
    for (let pass = 0; pass < 2; pass++) {
      values = values.map((v, i) => {
        const prev = values[(i - 1 + values.length) % values.length];
        const next = values[(i + 1) % values.length];
        return (prev + v * 2 + next) / 4;
      });
    }

    const max = host.clientHeight || 220;
    const frag = document.createDocumentFragment();

    values.forEach(v => {
      const block = document.createElement('div');
      block.className = 'hill';
      const raw = (layer.base + v * layer.amp) * max;
      const snapped = Math.max(layer.quant, Math.round(raw / layer.quant) * layer.quant);
      block.style.height = snapped + 'px';
      frag.appendChild(block);
    });

    host.appendChild(frag);
  });
}

function buildStars() {
  const host = document.getElementById('stars');
  if (!host) return;
  const rand = rng(97);
  const count = 18;

  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    const size = 2 + Math.round(rand() * 2);
    s.style.left = (rand() * 100).toFixed(2) + '%';
    s.style.top = (rand() * 44).toFixed(2) + '%';
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.animationDuration = (4 + rand() * 4).toFixed(1) + 's';
    s.style.animationDelay = (-rand() * 6).toFixed(1) + 's';
    host.appendChild(s);
  }
}

function buildFireflies() {
  if (reduceMotion || CONFIG.lowEffects) return;
  const host = document.getElementById('fireflies');
  if (!host) return;
  const rand = rng(53);
  const count = window.innerWidth < 700 ? 7 : 12;

  for (let i = 0; i < count; i++) {
    const f = document.createElement('span');
    f.className = 'firefly';
    f.style.left = (4 + rand() * 92).toFixed(2) + '%';
    f.style.bottom = (10 + rand() * 22).toFixed(2) + '%';
    f.style.animationDuration = (7 + rand() * 7).toFixed(1) + 's';
    f.style.animationDelay = (-rand() * 10).toFixed(1) + 's';
    host.appendChild(f);
  }
}

/* =========================================================
   3. NHẠC NỀN (file mp3, tự lặp lại khi trang còn mở)
   ========================================================= */
const Music = (function () {
  let el = null;

  function ensure() {
    if (el) return el;
    if (!CONFIG.musicFile) return null;

    el = new Audio(CONFIG.musicFile);
    el.loop = true;            /* hết bài thì quay lại từ đầu, phát mãi khi còn mở trang */
    el.preload = 'auto';
    el.volume = Math.min(1, Math.max(0, Number(CONFIG.musicVolume) || 0.5));

    el.addEventListener('play', syncButton);
    el.addEventListener('pause', syncButton);
    el.addEventListener('error', function () {
      console.warn('[Nhạc nền] Không tải được file:', CONFIG.musicFile);
      syncButton();
    });

    return el;
  }

  function start() {
    const audio = ensure();
    if (!audio || !audio.paused) return;
    audio.play().then(syncButton).catch(function (err) {
      console.warn('[Nhạc nền] Trình duyệt chặn phát tự động:', err && err.name);
      syncButton();
    });
  }

  function toggle() {
    const audio = ensure();
    if (!audio) return;
    if (audio.paused) start();
    else audio.pause();
  }

  function syncButton() {
    const btn = document.getElementById('soundBtn');
    const icon = document.getElementById('soundIcon');
    if (!btn || !icon) return;
    const on = !!el && !el.paused;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    icon.setAttribute('href', on ? '#i-sound-on' : '#i-sound-off');
  }

  return { start, toggle, syncButton };
})();

/* =========================================================
   4. MỞ THIỆP
   ========================================================= */
let opened = false;

function openInvite() {
  if (opened) return;
  opened = true;

  const splash = document.getElementById('splash');
  document.body.classList.remove('is-loading', 'no-scroll');
  document.body.classList.add('is-open');

  if (splash) {
    splash.classList.add('is-closing');
    window.setTimeout(() => { splash.hidden = true; }, 760);
  }

  Music.start();
}

function setupSplash() {
  const splash = document.getElementById('splash');
  const btn = document.getElementById('openBtn');
  if (!splash || !btn) return;

  btn.addEventListener('click', openInvite);

  document.addEventListener('keydown', e => {
    if (opened) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      openInvite();
    }
  });
}

/* =========================================================
   4b. NÚT "XÁC NHẬN THAM DỰ" → hoá vàng kim loại khi bấm
   ========================================================= */
function setupGoldButton() {
  const btn = document.querySelector('[data-rsvp]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    btn.classList.add('is-gold');
    btn.setAttribute('aria-pressed', 'true');
  });
}

/* =========================================================
   5. NỘI DUNG: ngày giờ, bản đồ, đếm ngược
   ========================================================= */
function fillContent() {
  const start = new Date(CONFIG.eventStart);
  const end = new Date(CONFIG.eventEnd);
  if (isNaN(start.getTime())) return;

  const dateText = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(start);

  const timeFmt = { hour: '2-digit', minute: '2-digit', hour12: false };
  const startTime = new Intl.DateTimeFormat('vi-VN', timeFmt).format(start);
  const endTime = isNaN(end.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', timeFmt).format(end);

  const timeRange = endTime ? `${startTime} – ${endTime}` : startTime;

  $$('[data-bind="date"]').forEach(el => { el.textContent = dateText; });
  $$('[data-bind="time"]').forEach(el => { el.textContent = timeRange; });
  $$('[data-bind="datetime"]').forEach(el => { el.textContent = `${startTime} · ${dateText}`; });
}

function startCountdown() {
  const units = {
    days: $('[data-unit="days"]'),
    hours: $('[data-unit="hours"]'),
    minutes: $('[data-unit="minutes"]'),
    seconds: $('[data-unit="seconds"]')
  };
  if (!units.days) return;

  const target = new Date(CONFIG.countdownTo || CONFIG.eventStart).getTime();
  if (isNaN(target)) return;

  const note = document.getElementById('countNote');
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();

    if (diff <= 0) {
      Object.values(units).forEach(el => { el.textContent = '00'; });
      if (note) note.textContent = 'Sự kiện đã diễn ra — cảm ơn bạn đã đồng hành!';
      return;
    }

    const sec = Math.floor(diff / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    units.days.textContent = String(d).padStart(2, '0');
    units.hours.textContent = pad(h);
    units.minutes.textContent = pad(m);
    units.seconds.textContent = pad(s);
  }

  tick();
  window.setInterval(tick, 1000);
}

/* =========================================================
   6. HIỆN DẦN KHI CUỘN
   ========================================================= */
function setupReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => io.observe(el));

  /* lưới an toàn: nếu vì lý do gì đó observer không chạy, cuộn vẫn hiện nội dung */
  let queued = false;
  function fallback() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      items.forEach(el => {
        if (el.classList.contains('in')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add('in');
      });
    });
  }
  window.addEventListener('scroll', fallback, { passive: true });
  window.addEventListener('resize', fallback);
  fallback();
}

/* =========================================================
   7. KHỞI ĐỘNG
   ========================================================= */
function init() {
  /* Nội dung & điều hướng chạy trước: lỡ phần trang trí có lỗi thì thiệp vẫn đọc được */
  fillContent();
  startCountdown();
  setupReveal();
  setupSplash();
  setupGoldButton();

  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) soundBtn.addEventListener('click', Music.toggle);
  Music.syncButton();

  /* Phần trang trí */
  try { applyTextures(); } catch (err) { /* giữ màu phẳng */ }
  try { buildHills(); } catch (err) { /* bỏ qua */ }
  try { buildStars(); } catch (err) { /* bỏ qua */ }
  try { buildFireflies(); } catch (err) { /* bỏ qua */ }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
