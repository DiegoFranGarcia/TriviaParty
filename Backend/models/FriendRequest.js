const mongoose = require('mongoose');
const { Schema } = mongoose;

const FriendRequestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// ensure one request per pair at a time
FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
