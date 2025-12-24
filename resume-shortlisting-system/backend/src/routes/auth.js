import express from 'express';
import { protect, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Hardcoded users for authentication
const HARDCODED_USERS = {
  'hr@demo.com': {
    id: 'hr001',
    name: 'Jennifer Smith',
    email: 'hr@demo.com',
    password: 'hr123',
    role: 'hr',
    company: 'TechCorp Inc.'
  },
  'candidate@demo.com': {
    id: 'candidate001',
    name: 'John Doe',
    email: 'candidate@demo.com',
    password: 'candidate123',
    role: 'candidate',
    experience: '3 years',
    skills: ['React', 'JavaScript', 'Python']
  }
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = HARDCODED_USERS[email];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data and token
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        experience: user.experience,
        skills: user.skills
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = HARDCODED_USERS[req.user.email];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        experience: user.experience,
        skills: user.skills
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;