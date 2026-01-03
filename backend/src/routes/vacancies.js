import express from 'express';
import Vacancy from '../models/Vacancy.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all vacancies
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const vacancies = await Vacancy.find(query)
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Vacancy.countDocuments(query);

    res.json({ 
      success: true, 
      data: vacancies,
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

// Get vacancy by ID
router.get('/:id', async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id)
      .populate('postedBy', 'name email company')
      .populate('applicants.candidate', 'name email skills experience');

    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }

    res.json({ success: true, data: vacancy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create vacancy (HR/Admin only)
router.post('/', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const vacancy = await Vacancy.create({
      ...req.body,
      postedBy: req.user._id || req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      data: vacancy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update vacancy (HR/Admin only)
router.put('/:id', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);
    
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }

    // HR can update any vacancy, Admin can update any vacancy
    // If you want to restrict HR to only their own vacancies, uncomment the check below:
    // const userId = req.user._id || req.user.id;
    // if (vacancy.postedBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Not authorized to update this vacancy' });
    // }

    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vacancy updated successfully',
      data: updatedVacancy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete vacancy (HR/Admin only)
router.delete('/:id', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);
    
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }

    // HR can delete any vacancy, Admin can delete any vacancy
    // If you want to restrict HR to only their own vacancies, uncomment the check below:
    // const userId = req.user._id || req.user.id;
    // if (vacancy.postedBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Not authorized to delete this vacancy' });
    // }

    await Vacancy.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vacancy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Close vacancy
router.patch('/:id/close', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );

    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }

    res.json({
      success: true,
      message: 'Vacancy closed successfully',
      data: vacancy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Reopen vacancy
router.patch('/:id/reopen', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      { status: 'open' },
      { new: true }
    );

    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }

    res.json({
      success: true,
      message: 'Vacancy reopened successfully',
      data: vacancy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
