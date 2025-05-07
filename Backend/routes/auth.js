// routes/auth.js
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const router  = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    // generate a 6-char playerId, e.g. 'AB12CD'
    const playerId = Math.random().toString(36).substr(2,6).toUpperCase();
    const user = await User.create({ username, email, passwordHash: hash, playerId });
    res.status(201).json({ playerId, username, email });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // sign a JWT (adjust secret & expiry to taste)
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
