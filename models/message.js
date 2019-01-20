const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  messageContent: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
});

module.exports = mongoose.model('Message', messageSchema);
