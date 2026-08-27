// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navEl = document.querySelector('.site-header nav');

navToggle.addEventListener('click', () => {
  const isOpen = navEl.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navEl.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll-reveal for sections
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame = null;
function updateScrollMotion() {
  scrollFrame = null;
  if (reducedMotion.matches) return;
  const hero = document.querySelector('.hero');
  const heroGrid = document.querySelector('.hero-grid');
  if (!hero || !heroGrid) return;
  const progress = Math.min(Math.max(window.scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
  heroGrid.style.setProperty('--hero-shift', `${progress * 42}px`);
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollMotion);
}, { passive: true });
reducedMotion.addEventListener('change', updateScrollMotion);
updateScrollMotion();

const typingParts = [
  [document.querySelector('.typing-prefix'), "hi, i'm "],
  [document.querySelector('.typing-name'), 'Sanskruti'],
  [document.querySelector('.typing-suffix'), '.']
];

function typeGreeting() {
  if (reducedMotion.matches) {
    typingParts.forEach(([element, text]) => { element.textContent = text; });
    return;
  }
  let partIndex = 0;
  let characterIndex = 0;
  function typeNextCharacter() {
    const [element, text] = typingParts[partIndex];
    element.textContent += text[characterIndex];
    characterIndex += 1;
    if (characterIndex >= text.length) {
      partIndex += 1;
      characterIndex = 0;
    }
    if (partIndex < typingParts.length) window.setTimeout(typeNextCharacter, 75);
  }
  typeNextCharacter();
}
typeGreeting();

// Active nav link on scroll
const sections = document.querySelectorAll('main .section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = document.querySelector(`.nav-link[data-target="${entry.target.id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

sections.forEach(section => navObserver.observe(section));

// Experience tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    tabPanels.forEach(p => p.classList.remove('active'));
    document.querySelector(`.tab-panel[data-panel="${target}"]`).classList.add('active');
  });
});

const portraitCanvas = document.getElementById('portraitCanvas');
const portraitContext = portraitCanvas.getContext('2d');
const portraitPoints = [];
const portraitImage = new Image();
portraitImage.src = 'IMG_20210818_183920_091.jpg';
let portraitPointer = { x: 0.5, y: 0.5 };

function createPortrait() {
  const bounds = portraitCanvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const size = Math.max(280, Math.floor(bounds.width));
  portraitCanvas.width = size * pixelRatio;
  portraitCanvas.height = size * pixelRatio;
  portraitContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  portraitPoints.length = 0;
  const spacing = size < 360 ? 6 : 7;
  const sampleCanvas = document.createElement('canvas');
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  sampleCanvas.width = size;
  sampleCanvas.height = size;
  const sourceSize = Math.min(portraitImage.naturalWidth, portraitImage.naturalHeight);
  const sourceX = (portraitImage.naturalWidth - sourceSize) * 0.5;
  const sourceY = Math.max(0, portraitImage.naturalHeight * 0.23);
  sampleContext.drawImage(portraitImage, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
  const pixels = sampleContext.getImageData(0, 0, size, size).data;
  for (let y = spacing; y < size; y += spacing) {
    for (let x = spacing; x < size; x += spacing) {
      const pixelIndex = (y * size + x) * 4;
      const brightness = (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / 3;
      const detail = brightness < 218 || y > size * 0.48;
      if (detail) portraitPoints.push({ x, y, brightness });
    }
  }
}

function drawPortrait() {
  const size = portraitCanvas.width / (window.devicePixelRatio || 1);
  portraitContext.clearRect(0, 0, size, size);
  const pointerX = portraitPointer.x * size;
  const pointerY = portraitPointer.y * size;
  portraitPoints.forEach(point => {
    const influence = Math.max(0, 1 - Math.hypot(point.x - pointerX, point.y - pointerY) / 130);
    const wave = Math.sin((point.x + point.y) * 0.045 + performance.now() * 0.0012) * 1.5;
    portraitContext.fillStyle = `hsl(${166 - point.brightness * 0.04} 72% ${35 + (255 - point.brightness) * 0.13}%)`;
    portraitContext.globalAlpha = 0.45 + influence * 0.55;
    portraitContext.fillRect(point.x + (point.x - pointerX) * influence * 0.12, point.y + (point.y - pointerY) * influence * 0.12 + wave, 1.05 + influence * 1.8, 1.05 + influence * 1.8);
  });
  portraitContext.globalAlpha = 1;
  requestAnimationFrame(drawPortrait);
}

portraitCanvas.addEventListener('pointermove', event => {
  const bounds = portraitCanvas.getBoundingClientRect();
  portraitPointer = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
});
portraitCanvas.addEventListener('pointerleave', () => { portraitPointer = { x: 0.5, y: 0.5 }; });
window.addEventListener('resize', createPortrait);
portraitImage.addEventListener('load', createPortrait);
if (portraitImage.complete) createPortrait();
drawPortrait();