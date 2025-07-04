const Message = require('../Model/messageSchema');
let io;
let userSockets = {};

exports.injectIO = (socketIO) => {
  io = socketIO;
};

exports.setUserSockets = (map) => {
  userSockets = map;
};

// Save a new message
exports.sendMessage = async (req, res) => {
  const { sender, receiver, content } = req.body;

  try {
    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();

    const messageData = {
      sender,
      receiver,
      content,
      timestamp: newMessage.timestamp,
      _id: newMessage._id.toString(), // Ensure _id is a string
    };

    // Emit message only to receiver
    if (io && userSockets[receiver]) {
      io.to(userSockets[receiver]).emit('receive_message', messageData);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Error saving message' });
  }
};


// Get messages between two users
exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

// delete messgae

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and attached to req.user

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this message' });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Server error' });
  }
};