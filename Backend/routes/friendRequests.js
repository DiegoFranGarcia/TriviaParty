// routes/friendRequests.js
const express = require('express');
const User    = require('../models/User');
const Request = require('../models/FriendRequest');
const auth    = require('../middleware/auth');
const router  = express.Router();

// POST /api/friend-requests
// { targetPlayerId: 'AB12CD' }
router.post('/', auth, async (req, res) => {
  const from = req.user._id;
  const toUser = await User.findOne({ playerId: req.body.targetPlayerId });
  if (!toUser) return res.status(404).json({ error: 'User not found' });
  if (toUser._id.equals(from)) return res.status(400).json({ error: 'Cannot friend yourself' });

  try {
    const fr = await Request.create({ from, to: toUser._id });
    res.status(201).json(fr);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/friend-requests
// list incoming & outgoing pending requests
router.get('/', auth, async (req, res) => {
  const userId = req.user._id;
  const incoming = await Request.find({ to: userId, status: 'pending' }).populate('from','username playerId');
  const outgoing = await Request.find({ from: userId, status: 'pending' }).populate('to','username playerId');
  res.json({ incoming, outgoing });
});

// POST /api/friend-requests/:id/accept
router.post('/:id/accept', auth, async (req, res) => {
  const fr = await Request.findById(req.params.id);
  if (!fr || !fr.to.equals(req.user._id)) return res.status(404).end();
  fr.status = 'accepted';
  await fr.save();
  // add each other to friends list
  await Promise.all([
    User.findByIdAndUpdate(fr.from, { $addToSet: { friends: fr.to }}),
    User.findByIdAndUpdate(fr.to,   { $addToSet: { friends: fr.from }})
  ]);
  res.json({ success: true });
});

// POST /api/friend-requests/:id/decline
router.post('/:id/decline', auth, async (req, res) => {
  const fr = await Request.findById(req.params.id);
  if (!fr || !fr.to.equals(req.user._id)) return res.status(404).end();
  fr.status = 'declined';
  await fr.save();
  res.json({ success: true });
});

module.exports = router;
