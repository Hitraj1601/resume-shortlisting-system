import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all vacancies
router.get('/', (req, res) => {
  // Mock data
  const vacancies = [
    {
      id: 'vacancy001',
      title: 'Senior React Developer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'full-time',
      experience: { min: 3, max: 7 },
      skills: ['React', 'JavaScript', 'Node.js', 'TypeScript'],
      description: 'We are looking for a senior React developer...',
      status: 'open',
      postedBy: 'hr001'
    },
    {
      id: 'vacancy002',
      title: 'Python Backend Developer',
      company: 'Tech Corp',
      location: 'New York',
      type: 'full-time',
      experience: { min: 2, max: 5 },
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      description: 'Join our backend team...',
      status: 'open',
      postedBy: 'hr001'
    }
  ];
  
  res.json({ success: true, data: vacancies });
});

// Get vacancy by ID
router.get('/:id', (req, res) => {
  const vacancy = {
    id: req.params.id,
    title: 'Senior React Developer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'full-time',
    experience: { min: 3, max: 7 },
    skills: ['React', 'JavaScript', 'Node.js', 'TypeScript'],
    description: 'We are looking for a senior React developer...',
    status: 'open',
    postedBy: 'hr001'
  };
  
  res.json({ success: true, data: vacancy });
});

// Create vacancy (HR/Admin only)
router.post('/', protect, authorize('hr', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Vacancy created successfully',
    data: { id: 'new-vacancy-id', ...req.body }
  });
});

// Update vacancy (HR/Admin only)
router.put('/:id', protect, authorize('hr', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Vacancy updated successfully'
  });
});

// Delete vacancy (HR/Admin only)
router.delete('/:id', protect, authorize('hr', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Vacancy deleted successfully'
  });
});

export default router;
