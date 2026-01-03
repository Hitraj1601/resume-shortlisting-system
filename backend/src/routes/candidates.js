import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all candidates
// @route   GET /api/v1/candidates
// @access  Private/HR
router.get('/', protect, authorize('hr', 'admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, skills, location, experience, search } = req.query;
    
    const query = { role: 'candidate', isActive: true };
    if (skills) query.skills = { $in: skills.split(',') };
    if (location) query.location = location;
    if (experience) query.experience = experience;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const candidates = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get candidates by skills
// @route   GET /api/v1/candidates/skills/:skills
// @access  Private/HR
router.get('/skills/:skills', protect, authorize('hr', 'admin'), async (req, res, next) => {
  try {
    const skills = req.params.skills.split(',');
    const candidates = await User.findBySkills(skills).select('-password');

    res.json({
      success: true,
      data: {
        candidates,
        count: candidates.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
