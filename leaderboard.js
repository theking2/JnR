const leaderboardList = document.getElementById('leaderboardList');
let previousSnapshot = '';

function renderEntries(entries) {
  return entries
    .map((entry, index) => {
      const initials = `${entry.first_name?.charAt(0) || ''}${entry.last_name?.charAt(0) || ''}`.toUpperCase();
      return `
        <li class="leaderboard-item" style="animation-delay:${index * 70}ms">
          <div class="leaderboard-rank">#${index + 1}</div>
          <div class="leaderboard-player">
            <div class="leaderboard-avatar">${initials}</div>
            <div>
              <strong>${entry.first_name} ${entry.last_name}</strong>
              <span>${entry.email}</span>
            </div>
          </div>
          <div class="leaderboard-score">${entry.score}</div>
        </li>
      `;
    })
    .join('');
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

    leaderboardList.innerHTML = entries.length
      ? renderEntries(entries)
      : '<li class="empty-state">No runs recorded yet.</li>';

    window.setTimeout(() => leaderboardList.classList.remove('updating'), 450);
  } catch (error) {
    if (previousSnapshot !== '__error__') {
      previousSnapshot = '__error__';
      leaderboardList.innerHTML = '<li class="empty-state">Leaderboard unavailable.</li>';
    }
  }
}

loadLeaderboard();
setInterval(loadLeaderboard, 5000);
