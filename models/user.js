const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName:{
    type:String,
    required:true,
  },
  lastName:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  messagesData: {
    messages: [
      {
        messageId: {
          type: Schema.Types.ObjectId,
          ref: 'Message',
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addMessage = message => {
  const messageIndex = this.messagesData.messages.findIndex(msg => {
    return msg.messageId.toString() === message._id.toString();
  });
  const udpatedMessages = [...this.messagesData.messages];

    udpatedMessages.push({
      messageId: message._id,
    });
  
  const updatedContactsData = {
    messages: udpatedMessages
  };
  this.messagesData = updatedContactsData;
  return this.save();
};

userSchema.methods.removeMessage = messageId => {
  const udpatedMessages = this.messagesData.messages.filter(item => {
    return item.messageId.toString() !== messageId.toString();
  });
  this.messagesData.messages = udpatedMessages;
  return this.save();
};

userSchema.methods.clearMessages = () => {
  this.messagesData = { messages: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
