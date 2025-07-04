const Request = require('../Model/requestSchema');

let io;
let userSockets = {};

exports.injectIO = (socketIO) => {
  io = socketIO;
};

exports.setUserSockets = (map) => {
  userSockets = map;
};

exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    // Check for existing pending request from sender to receiver
    const existingPending = await Request.findOne({ 
      senderId, 
      receiverId, 
      status: 'pending' 
    });
    if (existingPending) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    // Check for existing accepted request in either direction
    const existingAccepted = await Request.findOne({
      status: 'accepted',
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });
    if (existingAccepted) {
      return res.status(400).json({ 
        message: 'Users are already connected' 
      });
    }

    const newRequest = new Request({ senderId, receiverId });
    await newRequest.save();

    // Emit a Socket.IO event to the receiver
    const receiverSocket = userSockets[receiverId];
    if (receiverSocket && io) {
      io.to(receiverSocket).emit('newRequest', {
        requestId: newRequest._id,
        senderId,
        receiverId,
        message: 'You have a new friend request!',
      });
    }

    res.status(201).json({ message: 'Request sent', request: newRequest });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ message: 'Failed to send request' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Request.find({ receiverId: userId, status: 'pending' }).populate(
      'senderId',
      'name email image'
    );
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to get requests' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await Request.findByIdAndUpdate(id, { status }, { new: true })
      .populate('senderId', 'name email image')
      .populate('receiverId', 'name email image');

    if (!updated) return res.status(404).json({ message: 'Request not found' });

    if (status === 'accepted') {
      const senderId = updated.senderId._id.toString();
      const receiverId = updated.receiverId._id.toString();
      const senderSocket = userSockets[senderId];
      const receiverSocket = userSockets[receiverId];
      if (senderSocket) {
        io.to(senderSocket).emit('request_accepted', { requestId: id });
      }
      if (receiverSocket) {
        io.to(receiverSocket).emit('request_accepted', { requestId: id });
      }
    }

    res.status(200).json({ success: true, request: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAcceptedRequests = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const acceptedRequests = await Request.find({
      status: 'accepted',
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image');

    const formatted = acceptedRequests.map((r) => {
      const other = r.senderId._id.toString() === userId ? r.receiverId : r.senderId;
      return { _id: other._id, name: other.name, image: other.image };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching accepted requests:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};