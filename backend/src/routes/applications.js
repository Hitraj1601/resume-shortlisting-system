import express from 'express';
import Application from '../models/Application.js';
import Vacancy from '../models/Vacancy.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all applications (HR/Admin only)
router.get('/', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('candidate', 'name email skills experience phone location')
      .populate('vacancy', 'title company location type')
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({ 
      success: true, 
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get applications by vacancy (HR/Admin only)
router.get('/vacancy/:id', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const applications = await Application.find({ vacancy: req.params.id })
      .populate('candidate', 'name email skills experience phone location avatar')
      .sort({ 'aiScore.overall': -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get my applications (for candidates)
router.get('/my', protect, authorize('candidate'), async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const applications = await Application.find({ candidate: userId })
      .populate('vacancy', 'title company location type status deadline')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single application
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email skills experience phone location avatar bio')
      .populate('vacancy', 'title company location type status description requirements');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check authorization
    const userId = req.user._id || req.user.id;
    if (application.candidate._id.toString() !== userId.toString() && 
        !['hr', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Submit application (candidates only)
router.post('/', protect, authorize('candidate'), async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { vacancyId, resume, coverLetter } = req.body;

    // Check if vacancy exists and is open
    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }
    if (vacancy.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Vacancy is not accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ 
      candidate: userId, 
      vacancy: vacancyId 
    });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this vacancy' });
    }

    // Create application
    const application = await Application.create({
      candidate: userId,
      vacancy: vacancyId,
      resume,
      coverLetter,
      timeline: [{ action: 'Application submitted', notes: 'Initial application' }]
    });

    // Add applicant to vacancy
    await Vacancy.findByIdAndUpdate(vacancyId, {
      $push: { applicants: { candidate: userId, appliedAt: new Date() } }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update application status (HR/Admin only)
router.patch('/:id/status', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { status, hrNotes } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        hrNotes,
        $push: { timeline: { action: `Status changed to ${status}`, notes: hrNotes } }
      },
      { new: true }
    ).populate('candidate', 'name email')
     .populate('vacancy', 'title company');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update AI score (internal use)
router.patch('/:id/ai-score', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { aiScore, aiAnalysis } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { aiScore, aiAnalysis },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      message: 'AI score updated',
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
