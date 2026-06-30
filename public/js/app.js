// FWC 2026 Bracket Predictor - Frontend Logic

const TEAMS = {
  "Canada": { name: "Canada", flag: "ca" },
  "South Africa": { name: "South Africa", flag: "za" },
  "Germany": { name: "Germany", flag: "de" },
  "Paraguay": { name: "Paraguay", flag: "py" },
  "Netherlands": { name: "Netherlands", flag: "nl" },
  "Morocco": { name: "Morocco", flag: "ma" },
  "Brazil": { name: "Brazil", flag: "br" },
  "Japan": { name: "Japan", flag: "jp" },
  "France": { name: "France", flag: "fr" },
  "Sweden": { name: "Sweden", flag: "se" },
  "Côte d'Ivoire": { name: "Côte d'Ivoire", flag: "ci" },
  "Norway": { name: "Norway", flag: "no" },
  "Mexico": { name: "Mexico", flag: "mx" },
  "Ecuador": { name: "Ecuador", flag: "ec" },
  "England": { name: "England", flag: "gb-eng" },
  "DR Congo": { name: "DR Congo", flag: "cd" },
  "USA": { name: "USA", flag: "us" },
  "Bosnia and Herzegovina": { name: "Bosnia and Herzegovina", flag: "ba" },
  "Belgium": { name: "Belgium", flag: "be" },
  "Senegal": { name: "Senegal", flag: "sn" },
  "Portugal": { name: "Portugal", flag: "pt" },
  "Croatia": { name: "Croatia", flag: "hr" },
  "Spain": { name: "Spain", flag: "es" },
  "Austria": { name: "Austria", flag: "at" },
  "Switzerland": { name: "Switzerland", flag: "ch" },
  "Algeria": { name: "Algeria", flag: "dz" },
  "Argentina": { name: "Argentina", flag: "ar" },
  "Cape Verde": { name: "Cape Verde", flag: "cv" },
  "Colombia": { name: "Colombia", flag: "co" },
  "Ghana": { name: "Ghana", flag: "gh" },
  "Australia": { name: "Australia", flag: "au" },
  "Egypt": { name: "Egypt", flag: "eg" }
};

const BRACKET_STRUCTURE = {
  // Round of 32
  "73": { nextMatch: 89, slot: "home", round: "r32", t1: "South Africa", t2: "Canada", date: "June 28" },
  "75": { nextMatch: 89, slot: "away", round: "r32", t1: "Netherlands", t2: "Morocco", date: "June 29" },
  "74": { nextMatch: 90, slot: "home", round: "r32", t1: "Germany", t2: "Paraguay", date: "June 29" },
  "77": { nextMatch: 90, slot: "away", round: "r32", t1: "France", t2: "Sweden", date: "June 30" },
  "83": { nextMatch: 93, slot: "home", round: "r32", t1: "Portugal", t2: "Croatia", date: "July 2" },
  "84": { nextMatch: 93, slot: "away", round: "r32", t1: "Spain", t2: "Austria", date: "July 2" },
  "81": { nextMatch: 94, slot: "home", round: "r32", t1: "USA", t2: "Bosnia and Herzegovina", date: "July 1" },
  "82": { nextMatch: 94, slot: "away", round: "r32", t1: "Belgium", t2: "Senegal", date: "July 1" },
  
  "76": { nextMatch: 91, slot: "home", round: "r32", t1: "Brazil", t2: "Japan", date: "June 29" },
  "78": { nextMatch: 91, slot: "away", round: "r32", t1: "Côte d'Ivoire", t2: "Norway", date: "June 30" },
  "79": { nextMatch: 92, slot: "home", round: "r32", t1: "Mexico", t2: "Ecuador", date: "June 30" },
  "80": { nextMatch: 92, slot: "away", round: "r32", t1: "England", t2: "DR Congo", date: "July 1" },
  "85": { nextMatch: 95, slot: "home", round: "r32", t1: "Switzerland", t2: "Algeria", date: "July 2" },
  "87": { nextMatch: 95, slot: "away", round: "r32", t1: "Colombia", t2: "Ghana", date: "July 3" },
  "86": { nextMatch: 96, slot: "home", round: "r32", t1: "Argentina", t2: "Cape Verde", date: "July 3" },
  "88": { nextMatch: 96, slot: "away", round: "r32", t1: "Australia", t2: "Egypt", date: "July 3" },

  // Round of 16
  "89": { nextMatch: 97, slot: "home", round: "r16", date: "July 4" },
  "90": { nextMatch: 97, slot: "away", round: "r16", date: "July 4" },
  "91": { nextMatch: 99, slot: "home", round: "r16", date: "July 5" },
  "92": { nextMatch: 99, slot: "away", round: "r16", date: "July 5" },
  "93": { nextMatch: 98, slot: "home", round: "r16", date: "July 6" },
  "94": { nextMatch: 98, slot: "away", round: "r16", date: "July 6" },
  "95": { nextMatch: 100, slot: "home", round: "r16", date: "July 7" },
  "96": { nextMatch: 100, slot: "away", round: "r16", date: "July 7" },

  // Quarterfinals
  "97": { nextMatch: 101, slot: "home", round: "qf", date: "July 9" },
  "98": { nextMatch: 101, slot: "away", round: "qf", date: "July 10" },
  "99": { nextMatch: 102, slot: "home", round: "qf", date: "July 11" },
  "100": { nextMatch: 102, slot: "away", round: "qf", date: "July 11" },

  // Semifinals
  "101": { nextMatch: 104, slot: "home", loserMatch: 103, loserSlot: "home", round: "sf", date: "July 14" },
  "102": { nextMatch: 104, slot: "away", loserMatch: 103, loserSlot: "away", round: "sf", date: "July 15" },

  // Third Place & Final
  "103": { round: "third", date: "July 18" },
  "104": { round: "final", date: "July 19" }
};

// Symmetrical UI Columns mapping (which match goes where)
const LEFT_R32 = ["74", "77", "73", "75", "83", "84", "81", "82"];
const LEFT_R16 = ["90", "89", "93", "94"];
const LEFT_QF = ["97", "98"];
const LEFT_SF = ["101"];

const RIGHT_R32 = ["76", "78", "79", "80", "86", "88", "85", "87"];
const RIGHT_R16 = ["91", "92", "96", "95"];
const RIGHT_QF = ["99", "100"];
const RIGHT_SF = ["102"];

// App State
let globalData = null; // Official results, settings, users
let predictions = {}; // User's active picks
let isViewingUser = false; // Are we showing another user's static predictions?
let viewedUsername = ""; // The username we are viewing

// Fetch data on load
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await fetchGlobalData();
  
  // Check URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get('user');
  
  if (userParam) {
    loadUserBracket(userParam);
  } else {
    loadBuildMode();
  }
}

async function fetchGlobalData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Failed to load server data');
    globalData = await res.json();
    populateLeaderboard(globalData.users);
  } catch (error) {
    console.error('Error fetching global data:', error);
  }
}

// Switch between views
function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const targetView = document.getElementById(`view-${viewName}`);
  const targetBtn = document.getElementById(`nav-${viewName}`);
  
  if (targetView) targetView.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
}

// Populate Leaderboard Standings
function populateLeaderboard(users) {
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '';
  
  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="table-loading">No predictions submitted yet. Be the first to build a bracket!</td></tr>`;
    return;
  }
  
  users.forEach((user, index) => {
    const rank = index + 1;
    let rankHtml = `<span class="rank-badge">${rank}</span>`;
    if (rank === 1) rankHtml = `<span class="rank-badge rank-1">🏆</span>`;
    else if (rank === 2) rankHtml = `<span class="rank-badge rank-2">🥈</span>`;
    else if (rank === 3) rankHtml = `<span class="rank-badge rank-3">🥉</span>`;
    
    const date = new Date(user.submittedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rankHtml}</td>
      <td style="font-weight: 600;">${escapeHTML(user.username)}</td>
      <td class="points-col">${user.score} pts</td>
      <td class="time-col">${date}</td>
    `;
    tr.onclick = () => {
      // Load user's bracket and switch view
      loadUserBracket(user.username);
    };
    tbody.appendChild(tr);
  });
}

function filterLeaderboard() {
  const query = document.getElementById('search-user').value.toLowerCase();
  const filtered = globalData.users.filter(u => u.username.toLowerCase().includes(query));
  populateLeaderboard(filtered);
}

// Load normal bracket building mode
function loadBuildMode() {
  isViewingUser = false;
  viewedUsername = "";
  predictions = {};
  
  // Pre-fill predictions with already locked official results
  if (globalData && globalData.officialResults) {
    for (const matchId in globalData.officialResults) {
      if (globalData.officialResults[matchId].winner) {
        predictions[matchId] = globalData.officialResults[matchId].winner;
      }
    }
  }

  // Update URL to remove ?user query param
  window.history.pushState({}, document.title, window.location.pathname);

  // Update Header UI
  document.getElementById('bracket-view-title').innerText = "Build Your Bracket";
  document.getElementById('bracket-view-desc').innerText = "Select predictions by clicking on the teams. Fill out the entire tree to submit!";
  document.getElementById('btn-submit-bracket').classList.remove('hidden');
  document.getElementById('btn-reset-bracket').classList.remove('hidden');
  document.getElementById('btn-back-to-build').classList.add('hidden');

  renderBracket();
  switchView('bracket');
}

// Load a specific user's bracket (Read-only comparisons)
async function loadUserBracket(username) {
  try {
    const res = await fetch(`/api/brackets/${encodeURIComponent(username)}`);
    if (!res.ok) {
      alert('User bracket not found.');
      loadBuildMode();
      return;
    }
    const userData = await res.json();
    
    isViewingUser = true;
    viewedUsername = userData.username;
    predictions = userData.predictions;
    
    // Set URL parameter
    window.history.pushState({}, document.title, `${window.location.pathname}?user=${encodeURIComponent(username)}`);
    
    // Update Header UI
    document.getElementById('bracket-view-title').innerText = `${userData.username}'s Predictions`;
    document.getElementById('bracket-view-desc').innerText = `Points Collected: ${userData.score} pts. Correct picks are highlighted in green, wrong in red.`;
    document.getElementById('btn-submit-bracket').classList.add('hidden');
    document.getElementById('btn-reset-bracket').classList.add('hidden');
    document.getElementById('btn-back-to-build').classList.remove('hidden');
    
    renderBracket();
    switchView('bracket');
  } catch (error) {
    console.error('Error loading user bracket:', error);
    loadBuildMode();
  }
}

// Reset predictions
function resetBracket() {
  if (confirm("Are you sure you want to reset all your predictions? (Completed real-world matches will remain locked)")) {
    predictions = {};
    if (globalData && globalData.officialResults) {
      for (const matchId in globalData.officialResults) {
        if (globalData.officialResults[matchId].winner) {
          predictions[matchId] = globalData.officialResults[matchId].winner;
        }
      }
    }
    renderBracket();
  }
}

// Get the teams for a specific match. Returns { t1: "Team 1", t2: "Team 2", isPlaceholder: boolean }
function getMatchTeams(matchId) {
  const struct = BRACKET_STRUCTURE[matchId];
  
  // If Round of 32, teams are hardcoded
  if (struct.round === "r32") {
    return { t1: struct.t1, t2: struct.t2, isPlaceholder: false };
  }
  
  // Otherwise, get teams based on previous match winners
  let t1 = null;
  let t2 = null;
  let isPlaceholder = false;
  
  if (struct.round === "r16") {
    // Find the two R32 matches that lead here
    const r32Matches = Object.keys(BRACKET_STRUCTURE).filter(k => BRACKET_STRUCTURE[k].nextMatch === parseInt(matchId));
    // Sort to keep consistent order (home vs away)
    r32Matches.sort((a, b) => BRACKET_STRUCTURE[a].slot === 'home' ? -1 : 1);
    
    t1 = predictions[r32Matches[0]] || null;
    t2 = predictions[r32Matches[1]] || null;
    
    if (!t1) { t1 = `Winner Match ${r32Matches[0]}`; isPlaceholder = true; }
    if (!t2) { t2 = `Winner Match ${r32Matches[1]}`; isPlaceholder = true; }
  } else if (struct.round === "qf") {
    const r16Matches = Object.keys(BRACKET_STRUCTURE).filter(k => BRACKET_STRUCTURE[k].nextMatch === parseInt(matchId));
    r16Matches.sort((a, b) => BRACKET_STRUCTURE[a].slot === 'home' ? -1 : 1);
    
    t1 = predictions[r16Matches[0]] || null;
    t2 = predictions[r16Matches[1]] || null;
    
    if (!t1) { t1 = `Winner Match ${r16Matches[0]}`; isPlaceholder = true; }
    if (!t2) { t2 = `Winner Match ${r16Matches[1]}`; isPlaceholder = true; }
  } else if (struct.round === "sf") {
    const qfMatches = Object.keys(BRACKET_STRUCTURE).filter(k => BRACKET_STRUCTURE[k].nextMatch === parseInt(matchId));
    qfMatches.sort((a, b) => BRACKET_STRUCTURE[a].slot === 'home' ? -1 : 1);
    
    t1 = predictions[qfMatches[0]] || null;
    t2 = predictions[qfMatches[1]] || null;
    
    if (!t1) { t1 = `Winner Match ${qfMatches[0]}`; isPlaceholder = true; }
    if (!t2) { t2 = `Winner Match ${qfMatches[1]}`; isPlaceholder = true; }
  } else if (struct.round === "third") {
    // Losers of SF 101 and 102
    // If winners are picked in SF, then losers are the other team!
    const sfTeams101 = getMatchTeams("101");
    const sfTeams102 = getMatchTeams("102");
    
    const win101 = predictions["101"];
    const win102 = predictions["102"];
    
    if (win101 && !sfTeams101.isPlaceholder) {
      t1 = (win101 === sfTeams101.t1) ? sfTeams101.t2 : sfTeams101.t1;
    } else {
      t1 = "Loser Match 101";
      isPlaceholder = true;
    }
    
    if (win102 && !sfTeams102.isPlaceholder) {
      t2 = (win102 === sfTeams102.t1) ? sfTeams102.t2 : sfTeams102.t1;
    } else {
      t2 = "Loser Match 102";
      isPlaceholder = true;
    }
  } else if (struct.round === "final") {
    // Winners of SF 101 and 102
    t1 = predictions["101"] || null;
    t2 = predictions["102"] || null;
    
    if (!t1) { t1 = "Winner Match 101"; isPlaceholder = true; }
    if (!t2) { t2 = "Winner Match 102"; isPlaceholder = true; }
  }
  
  return { t1, t2, isPlaceholder };
}

// Advance predictions downstream and clean up replaced teams
function handleTeamSelect(matchId, selectedTeam) {
  // If we are in static read-only viewing mode, do nothing!
  if (isViewingUser) return;
  
  const struct = BRACKET_STRUCTURE[matchId];
  if (!struct) return;
  
  const currentPick = predictions[matchId];
  
  // If match has official result locked by admin, prevent changing it in GUI
  if (globalData && globalData.officialResults[matchId] && globalData.officialResults[matchId].winner) {
    return; // Locked
  }

  if (currentPick === selectedTeam) {
    // Unselect
    predictions[matchId] = null;
    clearDownstreamPicks(matchId, selectedTeam);
  } else {
    // Select new team
    predictions[matchId] = selectedTeam;
    // Clear the previously selected team from downstream predictions
    if (currentPick) {
      clearDownstreamPicks(matchId, currentPick);
    }
  }
  
  renderBracket();
  
  // Auto-advance mobile tab when round is fully predicted
  checkAndAdvanceMobileRound(struct.round);
}

function clearDownstreamPicks(matchId, replacedTeam) {
  if (!replacedTeam) return;
  const struct = BRACKET_STRUCTURE[matchId];
  if (!struct) return;
  
  // Check regular next match
  const nextMatchId = struct.nextMatch;
  if (nextMatchId) {
    if (predictions[nextMatchId] === replacedTeam) {
      predictions[nextMatchId] = null;
      clearDownstreamPicks(nextMatchId, replacedTeam);
    }
  }
  
  // Check loser's third-place match
  const loserMatchId = struct.loserMatch;
  if (loserMatchId) {
    if (predictions[loserMatchId] === replacedTeam) {
      predictions[loserMatchId] = null;
      clearDownstreamPicks(loserMatchId, replacedTeam);
    }
  }
}

// FlagCDN Image Helper
function getFlagImg(teamName, isPlaceholder) {
  if (isPlaceholder || !TEAMS[teamName]) {
    return `<div class="team-flag" style="background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 8px; color: var(--text-muted);">?</div>`;
  }
  const flagCode = TEAMS[teamName].flag;
  return `<img src="https://flagcdn.com/w40/${flagCode}.png" alt="${teamName} flag" class="team-flag" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2730%27><rect width=%2740%27 height=%2730%27 fill=%27%23333%27/></svg>'">`;
}

// Generate Match HTML card
function renderMatchCard(matchId) {
  const struct = BRACKET_STRUCTURE[matchId];
  const { t1, t2, isPlaceholder } = getMatchTeams(matchId);
  const pick = predictions[matchId] || null;
  const official = globalData ? globalData.officialResults[matchId] : null;
  const isLocked = official && official.winner;
  
  let scoreText = struct.date;
  if (official && official.score) {
    scoreText = official.score;
  }
  
  // Helper to determine styling classes for each team row
  function getTeamRowClass(teamName, opponentName) {
    let classes = ["team-row"];
    
    // Check if team is placeholder (e.g. "Winner Match 73")
    if (isPlaceholder || teamName.startsWith("Winner Match") || teamName.startsWith("Loser Match")) {
      classes.push("placeholder-row");
      return classes.join(" ");
    }
    
    // Check if this team is the user's selected pick
    if (pick === teamName) {
      classes.push("selected-pick");
    }
    
    // If we are showing comparisons/results
    if (official && official.winner) {
      if (official.winner === teamName) {
        // If official winner matches user's pick
        if (pick === teamName) {
          classes.push("correct-pick");
        } else if (isViewingUser) {
          // If we are looking at user's bracket and they didn't pick it, show it's the correct pick but not highlight as selected-pick
          classes.push("correct-pick");
        }
      } else if (pick === teamName) {
        // If user picked this team but they lost officially
        classes.push("incorrect-pick");
      }
    }
    
    return classes.join(" ");
  }

  const t1Class = getTeamRowClass(t1, t2);
  const t2Class = getTeamRowClass(t2, t1);
  
  const isT1Placeholder = isPlaceholder || t1.startsWith("Winner Match") || t1.startsWith("Loser Match");
  const isT2Placeholder = isPlaceholder || t2.startsWith("Winner Match") || t2.startsWith("Loser Match");

  const t1OnClick = isT1Placeholder ? "" : `onclick="handleTeamSelect('${matchId}', '${t1.replace(/'/g, "\\'")}')"`;
  const t2OnClick = isT2Placeholder ? "" : `onclick="handleTeamSelect('${matchId}', '${t2.replace(/'/g, "\\'")}')"`;

  return `
    <div class="match-meta">
      <span>Match ${matchId}</span>
      <span>${scoreText}</span>
    </div>
    <div class="${t1Class}" ${t1OnClick}>
      <div class="team-info">
        ${getFlagImg(t1, isT1Placeholder)}
        <span class="team-name" title="${t1}">${t1}</span>
      </div>
    </div>
    <div class="${t2Class}" ${t2OnClick}>
      <div class="team-info">
        ${getFlagImg(t2, isT2Placeholder)}
        <span class="team-name" title="${t2}">${t2}</span>
      </div>
    </div>
  `;
}

// Render entire bracket
function renderBracket() {
  // Render Left Side
  renderRoundsColumn(LEFT_R32, 'left-r32-matches');
  renderRoundsColumn(LEFT_R16, 'left-r16-matches');
  renderRoundsColumn(LEFT_QF, 'left-qf-matches');
  renderRoundsColumn(LEFT_SF, 'left-sf-matches');
  
  // Render Right Side
  renderRoundsColumn(RIGHT_R32, 'right-r32-matches');
  renderRoundsColumn(RIGHT_R16, 'right-r16-matches');
  renderRoundsColumn(RIGHT_QF, 'right-qf-matches');
  renderRoundsColumn(RIGHT_SF, 'right-sf-matches');

  // Render Center Playoff & Final
  document.getElementById('match-103').innerHTML = renderMatchCard("103");
  document.getElementById('match-104').innerHTML = renderMatchCard("104");

  // Render Champion Display
  const finalPick = predictions["104"] || null;
  const champDisplay = document.getElementById('champion-display');
  if (finalPick) {
    champDisplay.innerHTML = `
      ${getFlagImg(finalPick, false)}
      <span>${finalPick}</span>
    `;
    champDisplay.style.borderColor = "var(--success)";
    champDisplay.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.4)";
  } else {
    champDisplay.innerHTML = `<span class="champion-placeholder">Select bracket to crown champion</span>`;
    champDisplay.style.borderColor = "var(--accent-primary)";
    champDisplay.style.boxShadow = "var(--shadow-neon)";
  }
}

function renderRoundsColumn(matchesList, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  matchesList.forEach(matchId => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.id = `match-${matchId}`;
    card.innerHTML = renderMatchCard(matchId);
    container.appendChild(card);
  });
}

// Mobile Active Round Selection
function setMobileRound(roundName, btnElement) {
  // Update tabs active state
  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  let activeBtn = btnElement;
  if (!activeBtn) {
    // Find the button dynamically based on roundName parameter
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${roundName}'`)) {
        activeBtn = btn;
      }
    });
  }

  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Hide all rounds in both sides, show only selected
  document.querySelectorAll('.bracket-round').forEach(el => {
    el.classList.remove('active-round');
    if (el.dataset.round === roundName) {
      el.classList.add('active-round');
    }
  });

  // Handle center column (Finals/Trophy)
  const centerCol = document.querySelector('.bracket-center');
  centerCol.classList.remove('active-round');
  if (roundName === 'finals') {
    centerCol.classList.add('active-round');
  }

  // Smooth scroll to top of viewport for easy viewing
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Auto-advance mobile tab when all selections for the current round are completed
function checkAndAdvanceMobileRound(currentRound) {
  if (window.innerWidth > 768) return; // Only apply on mobile viewports

  let isComplete = false;
  let nextRoundName = "";

  if (currentRound === "r32") {
    const r32Matches = ["73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88"];
    isComplete = r32Matches.every(id => predictions[id]);
    nextRoundName = "r16";
  } else if (currentRound === "r16") {
    const r16Matches = ["89", "90", "91", "92", "93", "94", "95", "96"];
    isComplete = r16Matches.every(id => predictions[id]);
    nextRoundName = "qf";
  } else if (currentRound === "qf") {
    const qfMatches = ["97", "98", "99", "100"];
    isComplete = qfMatches.every(id => predictions[id]);
    nextRoundName = "sf";
  } else if (currentRound === "sf") {
    const sfMatches = ["101", "102"];
    isComplete = sfMatches.every(id => predictions[id]);
    nextRoundName = "finals";
  }

  if (isComplete && nextRoundName) {
    setTimeout(() => {
      setMobileRound(nextRoundName);
    }, 350); // Small delay to let user see selection flash before transition
  }
}

// Trigger initial round active on mobile
function initializeMobileView() {
  document.querySelectorAll('.bracket-round[data-round="r32"]').forEach(el => {
    el.classList.add('active-round');
  });
}
initializeMobileView();

// Nickname submit modals
function openSubmitModal() {
  // Validate if they predicted the entire tree
  // There are 32 matches in total (73-104). Make sure they have a prediction for all of them!
  const missingPicks = [];
  for (let id = 73; id <= 104; id++) {
    if (!predictions[id.toString()]) {
      missingPicks.push(id);
    }
  }

  if (missingPicks.length > 0) {
    alert(`Please complete the bracket before submitting! You have ${missingPicks.length} unpredicted match(es).`);
    return;
  }

  document.getElementById('submit-error').classList.add('hidden');
  document.getElementById('submit-modal').classList.add('active');
}

function closeSubmitModal() {
  document.getElementById('submit-modal').classList.remove('active');
}

async function submitBracket() {
  const nickname = document.getElementById('input-nickname').value.trim();
  const errorDiv = document.getElementById('submit-error');
  
  if (!nickname) {
    errorDiv.innerText = "Please enter a nickname.";
    errorDiv.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('/api/brackets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: nickname,
        predictions: predictions
      })
    });

    const result = await response.json();

    if (!response.ok) {
      errorDiv.innerText = result.error || "Submission failed.";
      errorDiv.classList.remove('hidden');
      return;
    }

    closeSubmitModal();
    
    // Open Share Modal
    const shareLink = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(result.username)}`;
    document.getElementById('share-link-input').value = shareLink;
    document.getElementById('share-modal').classList.add('active');
    
    // Refresh standings leaderboard
    fetchGlobalData();
  } catch (error) {
    console.error('Error submitting prediction:', error);
    errorDiv.innerText = "Server connection error.";
    errorDiv.classList.remove('hidden');
  }
}

function closeShareModal() {
  document.getElementById('share-modal').classList.remove('active');
  // Load build mode again or display their submitted bracket
  const submittedName = document.getElementById('input-nickname').value.trim();
  if (submittedName) {
    loadUserBracket(submittedName);
  }
}

function copyShareLink() {
  const input = document.getElementById('share-link-input');
  input.select();
  input.setSelectionRange(0, 99999); /* For mobile devices */
  navigator.clipboard.writeText(input.value);
  alert("Link copied to clipboard!");
}

// Utility Escape HTML helper
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
