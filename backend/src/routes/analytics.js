import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Vacancy from '../models/Vacancy.js';
import Application from '../models/Application.js';

const router = express.Router();

// @desc    Get analytics overview
// @route   GET /api/v1/analytics/overview
// @access  Private/HR
router.get('/overview', protect, authorize('hr', 'admin'), async (req, res, next) => {
  try {
    // Get counts
    const [totalCandidates, totalVacancies, totalApplications, openVacancies] = await Promise.all([
      User.countDocuments({ role: 'candidate', isActive: true }),
      Vacancy.countDocuments(),
      Application.countDocuments(),
      Vacancy.countDocuments({ status: 'open' })
    ]);

    // Get applications by status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const applicationsOverTime = await Application.aggregate([
      { $match: { appliedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get average AI scores
    const avgScores = await Application.aggregate([
      { $match: { 'aiScore.overall': { $exists: true } } },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$aiScore.overall' },
          avgSkillsMatch: { $avg: '$aiScore.skillsMatch' },
          avgExperienceScore: { $avg: '$aiScore.experienceScore' }
        }
      }
    ]);

    // Get top skills in demand
    const topSkills = await Vacancy.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCandidates,
          totalVacancies,
          totalApplications,
          openVacancies,
          closedVacancies: totalVacancies - openVacancies
        },
        applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        applicationsOverTime,
        avgScores: avgScores[0] || { avgOverall: 0, avgSkillsMatch: 0, avgExperienceScore: 0 },
        topSkills: topSkills.map(s => ({ skill: s._id, count: s.count }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get vacancy analytics
// @route   GET /api/v1/analytics/vacancies
// @access  Private/HR
router.get('/vacancies', protect, authorize('hr', 'admin'), async (req, res, next) => {
  try {
    const vacancyStats = await Vacancy.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'vacancy',
          as: 'applications'
        }
      },
      {
        $project: {
          title: 1,
          company: 1,
          status: 1,
          applicantCount: { $size: '$applications' },
          avgScore: { $avg: '$applications.aiScore.overall' }
        }
      },
      { $sort: { applicantCount: -1 } }
    ]);

    res.json({
      success: true,
      data: vacancyStats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
