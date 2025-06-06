const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Store plain text password(should be HASHED)
  password: { 
    type: String,
    required: true
  },
  // short code for inviting/finding friends
  playerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // once requests are accepted, move ObjectIds here
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
