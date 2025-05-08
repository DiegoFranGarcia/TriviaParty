// routes/auth.js
const express = require('express');
//const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const router  = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // Get plain password

  // Basic Validation (Add more if needed)
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  if (password.length < 6) { // Example: enforce minimum length
     return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if user already exists (optional but recommended)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    // Remove hashing:
    // const hash = await bcrypt.hash(password, 10); // REMOVE THIS LINE

    // Generate playerId
    const playerId = Math.random().toString(36).substring(2, 8).toUpperCase(); // Use substring for safer length control

    // Create user with plain text password
    const user = await User.create({
      username,
      email,
      password: password, // Store plain password directly
      playerId
    });

    // Don't send password back in response
    res.status(201).json({ playerId: user.playerId, username: user.username, email: user.email });

  } catch (err) {
    console.error("Registration Error:", err); // Log the actual error
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
     return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    // Still check if user exists
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare plain text passwords directly:
    // const ok = await bcrypt.compare(password, user.passwordHash); // REMOVE THIS LINE
    const ok = (password === user.password); // Direct comparison

    if (!ok) {
      console.log(`Login attempt failed: Incorrect password for email ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign JWT (make sure JWT_SECRET is set in your environment!)
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not set in environment.");
        return res.status(500).json({ error: 'Internal server error (JWT configuration missing).' });
    }
    const token = jwt.sign({ sub: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token }); // Send the token upon successful login

  } catch (err) {
    console.error("Login Error:", err); // Log the actual error
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

module.exports = router;