// Admin Portal JavaScript Logic

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

// State
let adminPassword = "";
let dbData = null; // Full database JSON loaded via api
let activeAdminTab = "results";
let activeRoundFilter = "r32";

// Edit User State
let editingUserTarget = "";
let editingUserPicks = {};

// On Load
document.addEventListener('DOMContentLoaded', () => {
  // Check session storage for saved password
  const savedPass = sessionStorage.getItem('fwc_admin_pass');
  if (savedPass) {
    adminPassword = savedPass;
    attemptLoadDashboard();
  }
});

// Login
async function loginAdmin() {
  const passInput = document.getElementById('admin-password').value;
  const loginErr = document.getElementById('login-error');
  loginErr.classList.add('hidden');
  
  if (!passInput) {
    loginErr.innerText = "Please enter a password.";
    loginErr.classList.remove('hidden');
    return;
  }

  // Attempt authentication by calling a protected endpoint (change-password check with the same password is a safe check!)
  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passInput, newPassword: passInput })
    });
    
    if (!res.ok) {
      const err = await res.json();
      loginErr.innerText = err.error || "Incorrect password.";
      loginErr.classList.remove('hidden');
      return;
    }
    
    // Auth successful
    adminPassword = passInput;
    sessionStorage.setItem('fwc_admin_pass', adminPassword);
    
    document.getElementById('admin-login-view').classList.add('hidden');
    document.getElementById('admin-dashboard-view').classList.remove('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    
    loadAdminData();
  } catch (error) {
    console.error('Login error:', error);
    loginErr.innerText = "Connection error.";
    loginErr.classList.remove('hidden');
  }
}

function logoutAdmin() {
  adminPassword = "";
  sessionStorage.removeItem('fwc_admin_pass');
  window.location.reload();
}

async function attemptLoadDashboard() {
  try {
    // Quick test check
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, newPassword: adminPassword })
    });
    
    if (res.ok) {
      document.getElementById('admin-login-view').classList.add('hidden');
      document.getElementById('admin-dashboard-view').classList.remove('hidden');
      document.getElementById('btn-logout').classList.remove('hidden');
      loadAdminData();
    } else {
      logoutAdmin();
    }
  } catch (e) {
    logoutAdmin();
  }
}

// Load dynamic data for admin dashboard
async function loadAdminData() {
  try {
    // Fetch base matches and users
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error("Could not load data");
    
    dbData = await res.json();
    
    renderAdminMatches();
    renderAdminUsersList();
  } catch (error) {
    console.error('Error fetching admin data:', error);
  }
}

// Switch dashboard tabs
function switchAdminTab(tabName) {
  activeAdminTab = tabName;
  
  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(`admin-tab-content-${tabName}`).classList.remove('hidden');
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Match Filtering (r32, r16, etc.)
function filterAdminMatches(roundName) {
  activeRoundFilter = roundName;
  
  document.querySelectorAll('.mobile-round-tabs .mobile-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`filter-${roundName}`).classList.add('active');
  
  renderAdminMatches();
}

// Retrieve teams playing in an official match based on officialResults tree path
function getOfficialMatchTeams(matchId) {
  const struct = BRACKET_STRUCTURE[matchId];
  if (struct.round === "r32") {
    return { t1: struct.t1, t2: struct.t2, isPlaceholder: false };
  }
  
  let t1 = null;
  let t2 = null;
  let isPlaceholder = false;
  
  const results = dbData ? dbData.officialResults : {};
  
  if (struct.round === "r16") {
    const r32Matches = Object.keys(BRACKET_STRUCTURE).filter(k => BRACKET_STRUCTURE[k].nextMatch === parseInt(matchId));
    r32Matches.sort((a, b) => BRACKET_STRUCTURE[a].slot === 'home' ? -1 : 1);
    
    t1 = results[r32Matches[0]] ? results[r32Matches[0]].winner : null;
    t2 = results[r32Matches[1]] ? results[r32Matches[1]].winner : null;
    
    if (!t1) { t1 = `Winner Match ${r32Matches[0]}`; isPlaceholder = true; }
    if (!t2) { t2 = `Winner Match ${r32Matches[1]}`; isPlaceholder = true; }
  } else if (struct.round === "qf") {
    const r16Matches = Object.keys(BRACKET_STRUCTURE).filter(k => BRACKET_STRUCTURE[k].nextMatch === parseInt(matchId));
    r16Matches.sort((a, b) => BRACKET_STRUCTURE[a].slot === 'home' ? -1 : 1);
    
    t1 = results[r16Matches[0]] ? results[r16Matches[0]].winner : null;
    t2 = results[r16Matches[1]] ? results[r16Matches[1]].winner : null;
    
    if (!t1) { t1 = `Winner Match ${r16Matches[0]}`; isPlaceholder = true; }
    if (!t2) { t2 = `Winner Match ${r16Matches[1]}`; isPlaceholder = true; }
  } else if (struct.round === "sf") {
    const qfMatches = Object.keys(BRACKET_STRUCTURE).filter(k => BRACKET_STRUCTURE[k].nextMatch === parseInt(matchId));
    qfMatches.sort((a, b) => BRACKET_STRUCTURE[a].slot === 'home' ? -1 : 1);
    
    t1 = results[qfMatches[0]] ? results[qfMatches[0]].winner : null;
    t2 = results[qfMatches[1]] ? results[qfMatches[1]].winner : null;
    
    if (!t1) { t1 = `Winner Match ${qfMatches[0]}`; isPlaceholder = true; }
    if (!t2) { t2 = `Winner Match ${qfMatches[1]}`; isPlaceholder = true; }
  } else if (struct.round === "third") {
    const sfTeams101 = getOfficialMatchTeams("101");
    const sfTeams102 = getOfficialMatchTeams("102");
    
    const win101 = results["101"] ? results["101"].winner : null;
    const win102 = results["102"] ? results["102"].winner : null;
    
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
    t1 = results["101"] ? results["101"].winner : null;
    t2 = results["102"] ? results["102"].winner : null;
    
    if (!t1) { t1 = "Winner Match 101"; isPlaceholder = true; }
    if (!t2) { t2 = "Winner Match 102"; isPlaceholder = true; }
  }
  
  return { t1, t2, isPlaceholder };
}

// Render Admin matches updating screen
function renderAdminMatches() {
  const container = document.getElementById('admin-matches-list');
  container.innerHTML = '';
  
  if (!dbData) return;
  
  // Get matchIds filtered by active round
  const matchIds = Object.keys(BRACKET_STRUCTURE).filter(id => BRACKET_STRUCTURE[id].round === activeRoundFilter);
  // Sort matchIds numerically
  matchIds.sort((a, b) => parseInt(a) - parseInt(b));
  
  matchIds.forEach(matchId => {
    const struct = BRACKET_STRUCTURE[matchId];
    const { t1, t2, isPlaceholder } = getOfficialMatchTeams(matchId);
    const official = dbData.officialResults[matchId] || { winner: null, score: "" };
    
    const row = document.createElement('div');
    row.className = 'match-row';
    
    // Dropdown for winner select
    let selectOptions = `<option value="">-- No Winner (Unplayed) --</option>`;
    if (!isPlaceholder) {
      selectOptions += `
        <option value="${t1}" ${official.winner === t1 ? 'selected' : ''}>${t1}</option>
        <option value="${t2}" ${official.winner === t2 ? 'selected' : ''}>${t2}</option>
      `;
    }
    
    row.innerHTML = `
      <div class="match-info-admin">
        <span class="match-num">Match ${matchId}</span>
        <span class="match-date-admin">${struct.date}</span>
      </div>
      
      <div class="match-teams-admin">
        <span style="font-weight: ${official.winner === t1 ? 'bold' : 'normal'}; color: ${official.winner === t1 ? 'var(--success)' : '#fff'};">${t1}</span>
        <span style="color: var(--text-muted);">vs</span>
        <span style="font-weight: ${official.winner === t2 ? 'bold' : 'normal'}; color: ${official.winner === t2 ? 'var(--success)' : '#fff'};">${t2}</span>
      </div>

      <div class="admin-team-select">
        <label style="font-size: 0.75rem; color: var(--text-secondary);">Select Winner</label>
        <select id="winner-select-${matchId}" ${isPlaceholder ? 'disabled' : ''}>
          ${selectOptions}
        </select>
      </div>

      <div class="score-input-admin">
        <label style="font-size: 0.75rem; color: var(--text-secondary);">Score/Meta (e.g. 2-1 (aet))</label>
        <input type="text" id="score-input-${matchId}" value="${escapeHTML(official.score || '')}" placeholder="Score/Note">
      </div>

      <button class="save-btn-admin" onclick="saveOfficialResult('${matchId}')" ${isPlaceholder ? 'disabled' : ''}>Save Match</button>
    `;
    
    container.appendChild(row);
  });
}

// Call API to save official match winner and score
async function saveOfficialResult(matchId) {
  const winnerSelect = document.getElementById(`winner-select-${matchId}`);
  const scoreInput = document.getElementById(`score-input-${matchId}`);
  
  const winner = winnerSelect.value || null;
  const score = scoreInput.value.trim();
  
  try {
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: adminPassword,
        matchId: matchId,
        winner: winner,
        score: score
      })
    });
    
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Failed to update match.");
      return;
    }
    
    alert(`Success: Match ${matchId} updated.`);
    loadAdminData(); // Reload matches list and users list
  } catch (error) {
    console.error('Error saving result:', error);
    alert('Server connection error.');
  }
}

// Render registered users list for management
function renderAdminUsersList() {
  const tbody = document.getElementById('admin-users-table-body');
  tbody.innerHTML = '';
  
  if (!dbData || !dbData.users) return;
  
  if (dbData.users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">No users submitted yet.</td></tr>`;
    return;
  }
  
  // Sort users by score descending
  const users = [...dbData.users].sort((a,b) => b.score - a.score);
  
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${escapeHTML(user.username)}</td>
      <td class="points-col">${user.score} pts</td>
      <td style="text-align: right;">
        <button class="user-action-btn btn-edit" onclick="openAdminEditModal('${user.username.replace(/'/g, "\\'")}')">Edit Picks</button>
        <button class="user-action-btn btn-kick" onclick="kickUser('${user.username.replace(/'/g, "\\'")}')">Kick</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Kick user API
async function kickUser(username) {
  if (!confirm(`Are you sure you want to kick and delete the user "${username}" from the standings?`)) {
    return;
  }
  
  try {
    const res = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: adminPassword,
        usernameToDelete: username
      })
    });
    
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Failed to kick user.");
      return;
    }
    
    alert(`Success: "${username}" kicked.`);
    loadAdminData();
  } catch (error) {
    console.error('Error kicking user:', error);
    alert('Server connection error.');
  }
}

// EDIT USER PREDICTIONS OVERRIDE TOOL
async function openAdminEditModal(username) {
  editingUserTarget = username;
  document.getElementById('edit-user-error').classList.add('hidden');
  
  try {
    // Fetch specific predictions
    const res = await fetch(`/api/brackets/${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error("Could not load user data");
    const data = await res.json();
    
    editingUserPicks = { ...data.predictions };
    document.getElementById('edit-user-modal-title').innerText = `Edit predictions for: ${data.username}`;
    
    // Render dropdown selects for each match inside modal
    const container = document.getElementById('admin-edit-matches-container');
    container.innerHTML = '';
    
    // Build array of all matches 73 to 104
    const matchIds = [];
    for (let i = 73; i <= 104; i++) matchIds.push(i.toString());
    
    // Render list
    matchIds.forEach(matchId => {
      const struct = BRACKET_STRUCTURE[matchId];
      
      // Determine what teams are selectable (for editing, it's easier to list all possible candidates, or get current participants)
      // Since it's an admin bypass, we can just allow picking ANY team, but let's derive the active predictions to see who is currently in slot!
      const currentVal = editingUserPicks[matchId] || "";
      
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'space-between';
      div.style.padding = '8px 0';
      div.style.borderBottom = '1px solid var(--border-color)';
      div.style.gap = '12px';
      
      // Generate options containing all 32 teams so admin can pick anything!
      let options = `<option value="">-- No Pick --</option>`;
      Object.keys(TEAMS).forEach(t => {
        options += `<option value="${t}" ${currentVal === t ? 'selected' : ''}>${t}</option>`;
      });
      
      div.innerHTML = `
        <span style="font-weight: bold; color: var(--accent-secondary); width: 80px;">Match ${matchId}</span>
        <span style="font-size: 0.8rem; color: var(--text-muted); flex: 1;">(${struct.round.toUpperCase()})</span>
        <select id="admin-override-${matchId}" style="background: rgba(0,0,0,0.5); color: #fff; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; font-size: 0.85rem; width: 220px;">
          ${options}
        </select>
      `;
      container.appendChild(div);
    });
    
    document.getElementById('admin-edit-user-modal').classList.add('active');
  } catch (error) {
    console.error('Error fetching user for edit:', error);
    alert('Failed to load user predictions.');
  }
}

function closeAdminEditModal() {
  document.getElementById('admin-edit-user-modal').classList.remove('active');
  editingUserTarget = "";
  editingUserPicks = {};
}

async function submitAdminUserEdit() {
  const overrides = {};
  for (let i = 73; i <= 104; i++) {
    const select = document.getElementById(`admin-override-${i}`);
    if (select) {
      overrides[i.toString()] = select.value || null;
    }
  }
  
  const errDiv = document.getElementById('edit-user-error');
  errDiv.classList.add('hidden');
  
  try {
    const res = await fetch('/api/admin/users/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: adminPassword,
        targetUsername: editingUserTarget,
        newPredictions: overrides
      })
    });
    
    const result = await res.json();
    if (!res.ok) {
      errDiv.innerText = result.error || "Failed to update user picks.";
      errDiv.classList.remove('hidden');
      return;
    }
    
    alert(`Success: predictions updated for user "${editingUserTarget}".`);
    closeAdminEditModal();
    loadAdminData();
  } catch (error) {
    console.error('Error editing user picks:', error);
    errDiv.innerText = "Connection error.";
    errDiv.classList.remove('hidden');
  }
}

// Change admin password API
async function changeAdminPassword() {
  const newPass = document.getElementById('change-pass-input').value.trim();
  const successDiv = document.getElementById('settings-success');
  const errorDiv = document.getElementById('settings-error');
  
  successDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  
  if (!newPass) {
    errorDiv.innerText = "Please enter a new password.";
    errorDiv.classList.remove('hidden');
    return;
  }
  
  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: adminPassword,
        newPassword: newPass
      })
    });
    
    const result = await res.json();
    if (!res.ok) {
      errorDiv.innerText = result.error || "Failed to change password.";
      errorDiv.classList.remove('hidden');
      return;
    }
    
    successDiv.innerText = "Password updated successfully! Redirecting...";
    successDiv.classList.remove('hidden');
    
    adminPassword = newPass;
    sessionStorage.setItem('fwc_admin_pass', adminPassword);
    
    // Clear input
    document.getElementById('change-pass-input').value = "";
  } catch (error) {
    console.error('Error updating password:', error);
    errorDiv.innerText = "Connection error.";
    errorDiv.classList.remove('hidden');
  }
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
