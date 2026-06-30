const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read database
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { settings: { adminPassword: 'admin', pointsSystem: {} }, officialResults: {}, users: [] };
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Recalculate score for a single user predictions set
function calculateUserScore(predictions, officialResults, pointsSystem) {
  let score = 0;
  for (const matchId in officialResults) {
    const official = officialResults[matchId];
    if (official && official.winner) {
      const userPick = predictions[matchId];
      if (userPick === official.winner) {
        const id = parseInt(matchId);
        if (id >= 73 && id <= 88) {
          score += pointsSystem.r32 || 10;
        } else if (id >= 89 && id <= 96) {
          score += pointsSystem.r16 || 20;
        } else if (id >= 97 && id <= 100) {
          score += pointsSystem.qf || 40;
        } else if (id >= 101 && id <= 102) {
          score += pointsSystem.sf || 80;
        } else if (id === 103) {
          score += pointsSystem.third || 50;
        } else if (id === 104) {
          score += pointsSystem.final || 160;
        }
      }
    }
  }
  return score;
}

// Get all data
app.get('/api/data', (req, res) => {
  const db = readDB();
  // Don't send admin password to client
  const clientData = {
    settings: {
      pointsSystem: db.settings.pointsSystem
    },
    officialResults: db.officialResults,
    users: db.users.map(u => ({ username: u.username, score: u.score, submittedAt: u.submittedAt })).sort((a, b) => b.score - a.score)
  };
  res.json(clientData);
});

// Submit a new user bracket
app.post('/api/brackets', (req, res) => {
  const { username, predictions } = req.body;
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const cleanUsername = username.trim();
  if (!/^[a-zA-Z0-9_\- ]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Nickname must be 1-25 characters and contain only letters, numbers, spaces, underscores, or hyphens.' });
  }

  const db = readDB();
  const exists = db.users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'This nickname is already taken.' });
  }

  // To prevent cheating, force predictions for already-resolved matches to match official results
  const validatedPredictions = { ...predictions };
  for (const matchId in db.officialResults) {
    if (db.officialResults[matchId].winner) {
      validatedPredictions[matchId] = db.officialResults[matchId].winner;
    }
  }

  const score = calculateUserScore(validatedPredictions, db.officialResults, db.settings.pointsSystem);

  const newUser = {
    username: cleanUsername,
    predictions: validatedPredictions,
    score: score,
    submittedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ message: 'Bracket submitted successfully!', username: cleanUsername });
});

// Fetch a single user's bracket
app.get('/api/brackets/:username', (req, res) => {
  const { username } = req.params;
  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    username: user.username,
    predictions: user.predictions,
    score: user.score,
    submittedAt: user.submittedAt
  });
});

// Admin Authentication Middleware (simple password check)
function verifyAdmin(req, res, next) {
  const { password } = req.body;
  const db = readDB();
  if (password !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized. Incorrect admin password.' });
  }
  next();
}

// Admin: Update official results
app.post('/api/admin/results', verifyAdmin, (req, res) => {
  const { matchId, winner, score } = req.body;
  
  if (!matchId) {
    return res.status(400).json({ error: 'Match ID is required.' });
  }

  const db = readDB();
  if (!db.officialResults[matchId]) {
    db.officialResults[matchId] = { winner: null, score: "" };
  }

  // Update
  db.officialResults[matchId].winner = winner || null;
  db.officialResults[matchId].score = score || "";

  // Recalculate scores for all users
  db.users.forEach(user => {
    // If the admin locks a completed match, we also retroactively lock the user's prediction to that official winner
    // (This handles cases where the match finishes after the user builds their bracket, which is standard)
    if (winner) {
      user.predictions[matchId] = winner;
    }
    user.score = calculateUserScore(user.predictions, db.officialResults, db.settings.pointsSystem);
  });

  writeDB(db);
  res.json({ message: `Match ${matchId} updated successfully. User scores recalculated.` });
});

// Admin: Kick a user
app.post('/api/admin/users/delete', verifyAdmin, (req, res) => {
  const { usernameToDelete } = req.body;
  if (!usernameToDelete) {
    return res.status(400).json({ error: 'Username to delete is required.' });
  }

  const db = readDB();
  const initialCount = db.users.length;
  db.users = db.users.filter(u => u.username.toLowerCase() !== usernameToDelete.toLowerCase());
  
  if (db.users.length === initialCount) {
    return res.status(404).json({ error: 'User not found.' });
  }

  writeDB(db);
  res.json({ message: `User "${usernameToDelete}" kicked successfully.` });
});

// Admin: Edit user predictions
app.post('/api/admin/users/edit', verifyAdmin, (req, res) => {
  const { targetUsername, newPredictions } = req.body;
  if (!targetUsername || !newPredictions) {
    return res.status(400).json({ error: 'Username and new predictions are required.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Update predictions
  user.predictions = { ...user.predictions, ...newPredictions };
  // Recalculate score
  user.score = calculateUserScore(user.predictions, db.officialResults, db.settings.pointsSystem);

  writeDB(db);
  res.json({ message: `User "${targetUsername}" predictions updated and score recalculated.` });
});

// Admin change password
app.post('/api/admin/change-password', verifyAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
    return res.status(400).json({ error: 'New password is required.' });
  }

  const db = readDB();
  db.settings.adminPassword = newPassword.trim();
  writeDB(db);
  res.json({ message: 'Admin password updated successfully.' });
});

// Handle SPA route fallback for shared links (so if user shares http://host/user/nickname it falls back to index.html or we use query params)
// Actually query params (e.g. ?user=nickname) are simpler and 100% robust without complex Express routing configurations.
// But we can also add a catch-all redirect if they open an invalid route, or just let them use query params.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`World Cup Bracket app running on http://localhost:${PORT}`);
});
