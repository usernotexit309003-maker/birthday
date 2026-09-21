const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  if (id === 's5') startConfetti();
  if (id === 's7') setTimeout(() => showScreen('s1'), 6000); // loop back to start
}

// --- Screen 1: gift ---
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const cardOne = yesBtn.closest('.card');

yesBtn.addEventListener('click', () => showScreen('s3'));

function dodgeNo() {
  const bounds = cardOne.getBoundingClientRect();
  const btnW = noBtn.offsetWidth, btnH = noBtn.offsetHeight;
  const maxX = bounds.width - btnW - 20;
  const maxY = bounds.height - btnH - 20;
  const x = 20 + Math.random() * Math.max(maxX - 20, 10);
  const y = 60 + Math.random() * Math.max(maxY - 60, 10);
  noBtn.style.position = 'absolute';
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';
  // make YES a little more inviting each time
  const scale = Math.min(1 + (parseFloat(yesBtn.dataset.grow || 0) + 1) * 0.06, 1.5);
  yesBtn.dataset.grow = (parseFloat(yesBtn.dataset.grow || 0) + 1);
  yesBtn.style.transform = `scale(${scale})`;
}
noBtn.addEventListener('mouseenter', dodgeNo);
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showScreen('s2');
});
// touch devices: dodge on touchstart near button too
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodgeNo(); });

// --- Screen 2: try again ---
document.getElementById('tryAgainBtn').addEventListener('click', () => {
  noBtn.style.position = '';
  noBtn.style.left = '';
  noBtn.style.top = '';
  yesBtn.style.transform = '';
  yesBtn.dataset.grow = 0;
  showScreen('s1');
});

// --- Screen 3: choose a penguin (any choice -> hug screen) ---
document.querySelectorAll('#s3 .pick').forEach(p => {
  p.addEventListener('click', () => showScreen('s4'));
});

// --- Heart nav buttons (screens 4-8) ---
document.querySelectorAll('.heart-nav').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.next));
});

// --- Confetti (canvas, vanilla JS, no libraries) ---
let confettiRunning = false;
function startConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  const canvas = document.getElementById('confetti');
  const card = canvas.closest('.card');
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = card.clientWidth; canvas.height = card.clientHeight; };
  resize();

  const colors = ['#e2543a', '#ffd166', '#e0457a', '#6ec6ca', '#8bd17c'];
  const pieces = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height,
    r: 4 + Math.random() * 5,
    c: colors[Math.floor(Math.random() * colors.length)],
    vy: 1.5 + Math.random() * 2.5,
    vx: -1 + Math.random() * 2,
    rot: Math.random() * 360,
    vr: -4 + Math.random() * 8
  }));

  let frames = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      ctx.restore();
    });
    frames++;
    if (frames < 260 && document.getElementById('s5').classList.contains('active')) {
      requestAnimationFrame(tick);
    } else {
      confettiRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  tick();
}
