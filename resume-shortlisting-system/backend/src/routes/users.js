import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, authorize('admin'), (req, res) => {
  // Mock data for now
  const users = [
    {
      id: 'hr001',
      name: 'HR Manager',
      email: 'hr@company.com',
      role: 'hr',
      company: 'Tech Corp'
    },
    {
      id: 'candidate001',
      name: 'John Doe',
      email: 'candidate@email.com',
      role: 'candidate',
      experience: 3,
      skills: ['JavaScript', 'React', 'Node.js']
    }
  ];
  
  res.json({ success: true, data: users });
});

// Get user profile
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Update user profile
router.put('/profile', protect, (req, res) => {
  // Mock update
  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

export default router;
