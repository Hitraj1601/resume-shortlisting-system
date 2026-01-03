import express from 'express';
import Chat from '../models/Chat.js';
import Application from '../models/Application.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for the current user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email role company')
      .populate('vacancy', 'title company')
      .populate('application', 'status')
      .sort({ lastMessage: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get a specific chat
router.get('/:chatId', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: userId
    })
      .populate('participants', 'name email role company')
      .populate('vacancy', 'title company')
      .populate('application', 'status')
      .populate('messages.sender', 'name role');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Start a new chat (HR only - when accepting an application)
router.post('/start', protect, async (req, res) => {
  try {
    const { applicationId } = req.body;
    const hrUserId = req.user._id || req.user.id;

    // Check if user is HR
    if (req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Only HR can initiate chats' });
    }

    // Get application details
    const application = await Application.findById(applicationId)
      .populate('applicant', '_id name email')
      .populate('vacancy', '_id title company');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if chat already exists for this application
    const existingChat = await Chat.findOne({ application: applicationId });
    if (existingChat) {
      return res.json({
        success: true,
        data: existingChat,
        message: 'Chat already exists'
      });
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [hrUserId, application.applicant._id],
      application: applicationId,
      vacancy: application.vacancy._id,
      messages: [{
        sender: hrUserId,
        content: `Hi! We're interested in your application for the ${application.vacancy.title} position. Let's discuss further.`
      }]
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email role company')
      .populate('vacancy', 'title company')
      .populate('application', 'status');

    res.status(201).json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Send a message
router.post('/:chatId/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id || req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot send messages to a closed chat' });
    }

    // Add message
    chat.messages.push({
      sender: userId,
      content: content.trim()
    });
    chat.lastMessage = new Date();
    await chat.save();

    res.json({
      success: true,
      data: chat.messages[chat.messages.length - 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark all unread messages from other users as read
    chat.messages.forEach(message => {
      if (!message.readAt && message.sender.toString() !== userId.toString()) {
        message.readAt = new Date();
      }
    });
    await chat.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get unread message count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const chats = await Chat.find({ participants: userId });
    
    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (!message.readAt && message.sender.toString() !== userId.toString()) {
          unreadCount++;
        }
      });
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Close a chat (HR only)
router.put('/:chatId/close', protect, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Only HR can close chats' });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, participants: req.user._id || req.user.id },
      { status: 'closed' },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
