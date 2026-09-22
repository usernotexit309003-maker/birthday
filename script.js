const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  if (id === 's5') startConfetti();
  if (id === 's7') setTimeout(() => showScreen('s8'), 5000); // let the handwriting finish, then show the final card
  if (id === 's8') setTimeout(() => showScreen('s1'), 7000); // loop back to start
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

// --- Screen 3: choose a penguin -> each one leads to its own mini word-game ---
const penguinPaths = [
  {
    // 0: Cool Penguin
    title: '😎 Cool Penguin asks...',
    intro: 'What word am I? Something royal you deserve to wear today.',
    answer: 'CROWN',
    hints: [
      "It's small, shiny, and sits on top of your head — only on your special day.",
      '👑 (yes, that\'s basically the answer)',
      '5 letters, starts with C.',
      "It's CROWN — you're basically royalty today. 👑"
    ],
    emoji: '👑',
    compliment: "Correct! Crowning you Birthday Royalty 👑 — reign responsibly."
  },
  {
    // 1: Chaos Penguin
    title: '🤪 Chaos Penguin asks...',
    intro: 'What word am I? What today officially is, whether you like it or not.',
    answer: 'PARTY',
    hints: [
      'It involves cake, chaos, and zero rules.',
      '🎉 (yes, that\'s basically the answer)',
      '5 letters, starts with P.',
      "It's PARTY — and you're the guest of honor. 🎉"
    ],
    emoji: '🎉',
    compliment: "Correct! The PARTY has officially started, and you're the main character."
  },
  {
    // 2: Soft Penguin
    title: '🥹 Soft Penguin asks...',
    intro: 'What word am I? What you fill with warmth every time you smile.',
    answer: 'HEART',
    hints: [
      'It beats for the people you love — including yourself, today.',
      '❤️ (yes, that\'s basically the answer)',
      '5 letters, starts with H.',
      "It's HEART — and yours is one of the good ones. ❤️"
    ],
    emoji: '🥹',
    compliment: "Correct! Confirmed: you have the kindest HEART around."
  }
];

let currentPenguin = null;
let hintsShown = 0;

const gameTitle = document.getElementById('gameTitle');
const gameIntro = document.getElementById('gameIntro');
const hintLine = document.getElementById('hintLine');
const hintBtn = document.getElementById('hintBtn');
const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const wrongMsg = document.getElementById('wrongMsg');
const modal = document.getElementById('complimentModal');
const modalEmoji = document.getElementById('modalEmoji');
const modalText = document.getElementById('modalText');
const modalContinueBtn = document.getElementById('modalContinueBtn');

document.querySelectorAll('#s3 .pick').forEach(p => {
  p.addEventListener('click', () => {
    currentPenguin = penguinPaths[parseInt(p.dataset.index, 10)];
    hintsShown = 0;
    gameTitle.textContent = currentPenguin.title;
    gameIntro.textContent = currentPenguin.intro;
    hintLine.textContent = 'Hint 1 will appear here once you ask.';
    hintBtn.textContent = 'Show a hint (0/4)';
    hintBtn.disabled = false;
    guessInput.value = '';
    wrongMsg.classList.remove('show');
    showScreen('s3game');
  });
});

hintBtn.addEventListener('click', () => {
  if (!currentPenguin || hintsShown >= 4) return;
  hintLine.textContent = currentPenguin.hints[hintsShown];
  hintsShown++;
  hintBtn.textContent = `Show a hint (${hintsShown}/4)`;
  if (hintsShown >= 4) hintBtn.disabled = true;
});

function checkAnswer() {
  if (!currentPenguin) return;
  const guess = guessInput.value.trim().toUpperCase();
  if (guess === currentPenguin.answer) {
    wrongMsg.classList.remove('show');
    modalEmoji.textContent = currentPenguin.emoji;
    modalText.textContent = currentPenguin.compliment;
    modal.classList.add('show');
  } else {
    wrongMsg.classList.add('show');
    guessInput.classList.remove('shake');
    void guessInput.offsetWidth; // restart animation
    guessInput.classList.add('shake');
  }
}
checkBtn.addEventListener('click', checkAnswer);
guessInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkAnswer(); });

modalContinueBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  showScreen('s4');
});

// --- Heart nav buttons (screens 4-8) ---
document.querySelectorAll('.heart-nav').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.next));
});

// --- Background music (starts on the first tap anywhere, since browsers block autoplay with sound) ---
const bgMusic = document.getElementById('bgMusic');
const muteBtn = document.getElementById('muteBtn');
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  bgMusic.volume = 0.35;
  bgMusic.play().then(() => {
    muteBtn.textContent = '🔊';
  }).catch(() => {
    musicStarted = false; // no audio file yet, or browser blocked it — stays muted
  });
}
document.body.addEventListener('click', startMusic, { once: true });

muteBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play().then(() => { muteBtn.textContent = '🔊'; }).catch(() => {});
  } else {
    bgMusic.pause();
    muteBtn.textContent = '🔇';
  }
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
