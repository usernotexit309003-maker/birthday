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

// --- Screen 3: choose a penguin -> each one leads to its own mini word-game ---
const penguinPaths = [
  {
    // 0: Cool Penguin
    title: '😎 Cool Penguin says...',
    intro: "Solve this and I'll let you pass. Maybe.",
    answer: 'AWESOME',
    hints: [
      "It's how your friends would describe you in one word.",
      "Starts with the letter A.",
      "Rhymes with \"gruesome\", but way more fun.",
      "It's basically your permanent personality setting."
    ],
    emoji: '🎉',
    compliment: "Correct! You really are AWESOME — certified by the Cool Penguin himself, and he doesn't certify just anyone."
  },
  {
    // 1: Chaos Penguin
    title: '🤪 Chaos Penguin demands...',
    intro: 'One word. No pressure. (Full pressure.)',
    answer: 'LEGEND',
    hints: [
      'Bollywood movies wish their plot twists were this good.',
      "6 letters, starts with L.",
      "Rhymes with nothing, because you're one of a kind.",
      "What people call you when you're not in the room. In a good way."
    ],
    emoji: '🔥',
    compliment: "Correct! Officially declared a LEGEND by the Chaos Penguin Council. There was chaos. There was a council. You won."
  },
  {
    // 2: Soft Penguin
    title: '🥹 Soft Penguin whispers...',
    intro: 'A gentle little riddle, just for you.',
    answer: 'AMAZING',
    hints: [
      'What your smile does to a room.',
      '7 letters, starts with A.',
      "Synonyms include incredible, wonderful, stunning — pick one, it's still true.",
      "It's simply... you."
    ],
    emoji: '🥹',
    compliment: "Correct! Confirmed: you are AMAZING, no cap, no notes."
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
