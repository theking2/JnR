const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const playerForm = document.getElementById('playerForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const levelDisplay = document.getElementById('levelDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const leaderboardList = document.getElementById('leaderboardList');
const statusMessage = document.getElementById('statusMessage');
const fullscreenButton = document.getElementById('fullscreenButton');

const state = {
  running: false,
  gameOver: false,
  levelIndex: 0,
  score: 0,
  coins: 0,
  lastTime: 0,
  player: null,
  level: null,
  cameraX: 0,
  keys: {},
  playerData: null,
  animationFrameId: null,
};

const levels = [
  {
    goalX: 3300,
    platforms: [
      { x: 0, y: 760, w: 4200, h: 80 },
      { x: 240, y: 610, w: 220, h: 26 },
      { x: 580, y: 520, w: 220, h: 26 },
      { x: 980, y: 430, w: 220, h: 26 },
      { x: 1360, y: 550, w: 220, h: 26 },
      { x: 1760, y: 450, w: 220, h: 26 },
      { x: 2280, y: 360, w: 220, h: 26 },
      { x: 2700, y: 500, w: 340, h: 26 },
    ],
    hazards: [
      { x: 760, y: 734, w: 46, h: 26 },
      { x: 1450, y: 734, w: 46, h: 26 },
    ],
    coins: [
      { x: 280, y: 560 },
      { x: 640, y: 470 },
      { x: 1040, y: 380 },
      { x: 1840, y: 400 },
      { x: 2360, y: 320 },
      { x: 2870, y: 450 },
    ],
  },
  {
    goalX: 3600,
    platforms: [
      { x: 0, y: 760, w: 4200, h: 80 },
      { x: 300, y: 650, w: 180, h: 24 },
      { x: 700, y: 560, w: 220, h: 24 },
      { x: 1080, y: 470, w: 180, h: 24 },
      { x: 1380, y: 610, w: 200, h: 24 },
      { x: 1740, y: 520, w: 220, h: 24 },
      { x: 2140, y: 430, w: 200, h: 24 },
      { x: 2520, y: 610, w: 180, h: 24 },
      { x: 2920, y: 500, w: 260, h: 24 },
    ],
    hazards: [
      { x: 560, y: 734, w: 44, h: 26 },
      { x: 1220, y: 734, w: 44, h: 26 },
      { x: 1980, y: 734, w: 44, h: 26 },
    ],
    coins: [
      { x: 360, y: 600 },
      { x: 770, y: 510 },
      { x: 1150, y: 420 },
      { x: 1470, y: 560 },
      { x: 1800, y: 470 },
      { x: 2230, y: 380 },
      { x: 2580, y: 560 },
      { x: 3040, y: 450 },
    ],
  },
  {
    goalX: 3900,
    platforms: [
      { x: 0, y: 760, w: 4200, h: 80 },
      { x: 220, y: 640, w: 180, h: 24 },
      { x: 500, y: 560, w: 180, h: 24 },
      { x: 790, y: 470, w: 220, h: 24 },
      { x: 1120, y: 610, w: 180, h: 24 },
      { x: 1410, y: 500, w: 180, h: 24 },
      { x: 1710, y: 420, w: 220, h: 24 },
      { x: 2060, y: 610, w: 180, h: 24 },
      { x: 2360, y: 520, w: 220, h: 24 },
      { x: 2700, y: 430, w: 220, h: 24 },
      { x: 3060, y: 610, w: 220, h: 24 },
      { x: 3400, y: 520, w: 220, h: 24 },
    ],
    hazards: [
      { x: 620, y: 734, w: 46, h: 26 },
      { x: 1310, y: 734, w: 46, h: 26 },
      { x: 1950, y: 734, w: 46, h: 26 },
      { x: 2460, y: 734, w: 46, h: 26 },
    ],
    coins: [
      { x: 260, y: 590 },
      { x: 540, y: 510 },
      { x: 840, y: 420 },
      { x: 1160, y: 560 },
      { x: 1490, y: 450 },
      { x: 1800, y: 370 },
      { x: 2160, y: 560 },
      { x: 2480, y: 470 },
      { x: 2830, y: 380 },
      { x: 3190, y: 560 },
      { x: 3560, y: 470 },
    ],
  },
];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createPlayer() {
  return {
    x: 80,
    y: 620,
    width: 36,
    height: 44,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
  };
}

function resetLevelCoins() {
  levels.forEach((level) => {
    level.coins.forEach((coin) => {
      coin.collected = false;
    });
  });
}

function resetGameState() {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  state.running = false;
  state.gameOver = false;
  state.levelIndex = 0;
  state.score = 0;
  state.coins = 0;
  state.lastTime = 0;
  state.keys = {};
  state.player = createPlayer();
  state.level = levels[0];
  state.cameraX = 0;
  state.playerData = null;
  resetLevelCoins();
  scoreDisplay.textContent = '0';
  levelDisplay.textContent = '1';
}

async function startGame() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();

  if (!firstName || !lastName || !email) {
    showMessage('Please complete your name and email first.');
    return;
  }

  try {
    const response = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        score: 1,
        preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || 'This email address is already enrolled.');
      return;
    }
  } catch (error) {
    showMessage('Could not check enrollment.');
    return;
  }

  resetGameState();

  localStorage.setItem('neonRunner:firstName', firstName);
  localStorage.setItem('neonRunner:lastName', lastName);
  localStorage.setItem('neonRunner:email', email);
  state.playerData = { firstName, lastName, email };

  state.running = true;
  overlay.classList.remove('active');
  showMessage('Run started. Reach the green portal to clear the level.');
  state.animationFrameId = requestAnimationFrame(loop);
}

function loop(timestamp) {
  if (!state.running) return;
  const delta = Math.min((timestamp - (state.lastTime || timestamp)) / 16.67, 1.8);
  state.lastTime = timestamp;
  update(delta);
  render();
  state.animationFrameId = requestAnimationFrame(loop);
}

function update(delta) {
  const player = state.player;
  const level = state.level;

  const move = (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D'] ? 1 : 0) - (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A'] ? 1 : 0);
  const speed = 5.4 * delta;
  player.vx = move * speed;
  if (move !== 0) player.facing = move;

  if ((state.keys['ArrowUp'] || state.keys['w'] || state.keys['W'] || state.keys[' '] || state.keys['Spacebar']) && player.onGround) {
    player.vy = -11.8;
    player.onGround = false;
  }

  player.vy += 0.35 * delta;
  const prevX = player.x;
  const prevY = player.y;
  player.x += player.vx * 1.2;
  player.y += player.vy * 1.2;

  const groundY = 760;
  player.onGround = false;

  for (const platform of level.platforms) {
    const prevBottom = prevY + player.height;
    const currentBottom = player.y + player.height;
    const prevTop = prevY;
    const currentTop = player.y;

    const overlapsX = player.x + player.width > platform.x && player.x < platform.x + platform.w;
    const overlapsY = currentBottom > platform.y && currentTop < platform.y + platform.h;

    if (overlapsX && overlapsY) {
      const prevWasAbove = prevBottom <= platform.y + 4;
      const isLanding = player.vy >= 0 && prevWasAbove;

      if (isLanding) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.onGround = true;
        break;
      }

      if (player.vy < 0 && currentBottom >= platform.y && prevTop <= platform.y + platform.h) {
        player.y = platform.y + platform.h;
        player.vy = 0.2;
      }
    }
  }

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  player.x = Math.max(0, Math.min(player.x, 4200 - player.width));

  levelDisplay.textContent = state.levelIndex + 1;
  scoreDisplay.textContent = state.score;

  state.cameraX = Math.max(0, Math.min(player.x - window.innerWidth * 0.3, 4200 - window.innerWidth));

  for (const coin of level.coins) {
    if (coin.collected) continue;

    const collected = Math.abs(player.x + player.width * 0.5 - (coin.x + 16)) < 22 && Math.abs(player.y + player.height * 0.5 - (coin.y + 16)) < 24;
    if (collected) {
      coin.collected = true;
      state.coins += 1;
      addScore(120);
    }
  }

  for (const hazard of level.hazards) {
    if (player.x + player.width > hazard.x && player.x < hazard.x + hazard.w && player.y + player.height > hazard.y && player.y < hazard.y + hazard.h) {
      endGame('The neon spike caught you.');
      return;
    }
  }

  if (player.x >= level.goalX) {
    advanceLevel();
  }
}

function addScore(amount) {
  if (amount <= 0) return;
  state.score += amount;
  scoreDisplay.textContent = state.score;
}

function advanceLevel() {
  if (state.levelIndex < levels.length - 1) {
    state.levelIndex += 1;
    state.level = levels[state.levelIndex];
    state.player = createPlayer();
    state.player.x = 80;
    state.player.y = 620;
    state.cameraX = 0;
    addScore(900);
    showMessage(`Level ${state.levelIndex + 1} incoming.`);
    return;
  }
  endGame('All three levels cleared.');
}

function endGame(message) {
  state.running = false;
  state.gameOver = true;
  overlay.classList.add('active');
  showMessage(message);
  if (state.playerData) {
    submitScore();
  }
}

function submitScore() {
  const payload = {
    firstName: state.playerData.firstName,
    lastName: state.playerData.lastName,
    email: state.playerData.email,
    score: state.score,
  };

  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then(() => loadLeaderboard())
    .catch(() => showMessage('Score could not be stored right now.'));
}

async function loadLeaderboard() {
  try {
    const response = await fetch('api.php?mode=leaderboard');
    const data = await response.json();
    leaderboardList.innerHTML = '';
    if (!data.entries || !data.entries.length) {
      leaderboardList.innerHTML = '<li>No scores yet.</li>';
      return;
    }
    data.entries.slice(0, 8).forEach((entry, index) => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>#${index + 1}</strong> ${entry.first_name} ${entry.last_name} — <span>${entry.score}</span>`;
      leaderboardList.appendChild(item);
    });
  } catch (error) {
    leaderboardList.innerHTML = '<li>Leaderboard unavailable.</li>';
  }
}

function render() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#08110d');
  sky.addColorStop(1, '#030606');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(-state.cameraX, 0);

  ctx.fillStyle = '#18221c';
  ctx.fillRect(0, 760, 4200, 80);

  for (const platform of state.level.platforms) {
    ctx.fillStyle = '#0d1715';
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = 'rgba(140, 191, 53, 0.2)';
    ctx.fillRect(platform.x, platform.y, platform.w, 6);
  }

  for (const hazard of state.level.hazards) {
    ctx.fillStyle = '#ff4f4f';
    ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
  }

  for (const coin of state.level.coins) {
    if (coin.collected) continue;
    ctx.fillStyle = '#ffe37c';
    ctx.beginPath();
    ctx.arc(coin.x + 16, coin.y + 16, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#9ee050';
  ctx.fillRect(state.level.goalX, 710, 56, 50);
  ctx.fillStyle = '#2f4e16';
  ctx.fillRect(state.level.goalX + 18, 720, 20, 40);

  const player = state.player;
  ctx.fillStyle = '#dff3b2';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#8cbf35';
  ctx.fillRect(player.x + 8, player.y + 8, 14, 12);
  ctx.fillRect(player.x + 20, player.y + 8, 8, 12);
  ctx.fillRect(player.x + 8, player.y + 20, player.width - 16, 10);
  ctx.fillStyle = '#050607';
  ctx.fillRect(player.x + 8, player.y + 20, 6, 10);

  ctx.restore();
}

function showMessage(message) {
  statusMessage.textContent = message;
  statusMessage.classList.add('visible');
  window.clearTimeout(showMessage.timeout);
  showMessage.timeout = window.setTimeout(() => statusMessage.classList.remove('visible'), 1800);
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('keydown', (event) => {
  state.keys[event.key] = true;
  if (event.key === ' ') event.preventDefault();
});

document.addEventListener('keyup', (event) => {
  state.keys[event.key] = false;
});

playerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  startGame();
});

fullscreenButton.addEventListener('click', async () => {
  const target = document.documentElement;
  if (!document.fullscreenElement) {
    await target.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
});

(function init() {
  resizeCanvas();
  firstNameInput.value = localStorage.getItem('neonRunner:firstName') || '';
  lastNameInput.value = localStorage.getItem('neonRunner:lastName') || '';
  emailInput.value = localStorage.getItem('neonRunner:email') || '';
  state.level = levels[0];
  state.player = createPlayer();
  state.player.x = 80;
  state.player.y = 620;
  state.cameraX = 0;
  render();
  loadLeaderboard();
})();
