const express = require('express');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET /api/users/me/friends
router.get('/me/friends', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
                         .populate('friends','username playerId');
  res.json(user.friends);
});

module.exports = router;
