import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all applications (HR/Admin only)
router.get('/', protect, authorize('hr', 'admin'), (req, res) => {
  // Mock data
  const applications = [
    {
      id: 'app001',
      candidate: {
        id: 'candidate001',
        name: 'John Doe',
        email: 'john@email.com'
      },
      vacancy: {
        id: 'vacancy001',
        title: 'Senior React Developer'
      },
      status: 'pending',
      appliedAt: new Date(),
      aiScore: {
        overall: 85,
        skillsMatch: 90,
        experienceScore: 80
      }
    }
  ];
  
  res.json({ success: true, data: applications });
});

// Get applications by vacancy (HR/Admin only)
router.get('/vacancy/:id', protect, authorize('hr', 'admin'), (req, res) => {
  // Mock data for specific vacancy
  const applications = [
    {
      id: 'app001',
      candidate: {
        id: 'candidate001',
        name: 'John Doe',
        email: 'john@email.com'
      },
      status: 'pending',
      appliedAt: new Date(),
      aiScore: {
        overall: 85,
        skillsMatch: 90,
        experienceScore: 80
      }
    }
  ];
  
  res.json({ success: true, data: applications });
});

// Submit application (candidates only)
router.post('/', protect, authorize('candidate'), (req, res) => {
  res.json({
    success: true,
    message: 'Application submitted successfully',
    data: { id: 'new-app-id', ...req.body }
  });
});

export default router;
