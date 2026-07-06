const leaderboardList = document.getElementById('leaderboardList');
let previousSnapshot = '';
let previousEntries = [];

function renderRow(entry, index, isNew = false) {
  const initials = `${entry.first_name?.charAt(0) || ''}${entry.last_name?.charAt(0) || ''}`.toUpperCase();
  const item = document.createElement('li');
  item.className = `leaderboard-item${isNew ? ' is-new' : ''}`;
  item.style.animationDelay = `${index * 70}ms`;
  item.innerHTML = `
    <div class="leaderboard-rank">#${index + 1}</div>
    <div class="leaderboard-player">
      <div class="leaderboard-avatar">${initials}</div>
      <div>
        <strong>${entry.first_name} ${entry.last_name}</strong>
        <span>${entry.email}</span>
      </div>
    </div>
    <div class="leaderboard-score">${entry.score}</div>
  `;
  return item;
}

function syncLeaderboard(entries) {
  const currentChildren = Array.from(leaderboardList.children);
  const needed = entries.length ? entries : [{ type: 'empty' }];

  if (!entries.length) {
    if (currentChildren.length !== 1 || currentChildren[0].className !== 'empty-state') {
      leaderboardList.innerHTML = '<li class="empty-state">No runs recorded yet.</li>';
    }
    previousEntries = [];
    return;
  }

  const fragment = document.createDocumentFragment();
  const max = Math.max(currentChildren.length, entries.length);

  for (let index = 0; index < max; index += 1) {
    const entry = entries[index];
    if (!entry) {
      continue;
    }

    const existing = currentChildren[index];
    const isNew = !previousEntries.some((prev) => prev.email === entry.email && prev.score === entry.score && prev.first_name === entry.first_name && prev.last_name === entry.last_name);

    if (existing && existing.classList.contains('leaderboard-item')) {
      existing.innerHTML = renderRow(entry, index, isNew).innerHTML;
      existing.className = `leaderboard-item${isNew ? ' is-new' : ''}`;
      existing.style.animationDelay = `${index * 70}ms`;
      fragment.appendChild(existing);
    } else {
      fragment.appendChild(renderRow(entry, index, true));
    }
  }

  leaderboardList.innerHTML = '';
  leaderboardList.appendChild(fragment);
  previousEntries = entries;
}

async function loadLeaderboard() {
  try {
    const response = await fetch('api.php?mode=leaderboard');
    const data = await response.json();

    const entries = (data.entries || []).slice(0, 10);
    const snapshot = entries.length
      ? JSON.stringify(entries)
      : '__empty__';

    if (snapshot === previousSnapshot) {
      return;
    }

    previousSnapshot = snapshot;

    leaderboardList.classList.add('updating');
    syncLeaderboard(entries);

    window.setTimeout(() => leaderboardList.classList.remove('updating'), 450);
  } catch (error) {
    if (previousSnapshot !== '__error__') {
      previousSnapshot = '__error__';
      leaderboardList.innerHTML = '<li class="empty-state">Leaderboard unavailable.</li>';
      previousEntries = [];
    }
  }
}

loadLeaderboard();
setInterval(loadLeaderboard, 5000);
