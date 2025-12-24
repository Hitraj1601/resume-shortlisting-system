import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Analyze resume with AI
router.post('/analyze-resume', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    // Mock AI analysis for now
    const analysis = {
      overall_score: 85,
      skills_analysis: {
        categories: {
          programming: { skills: ['JavaScript', 'React'], count: 2, score: 80 },
          web_tech: { skills: ['HTML', 'CSS'], count: 2, score: 100 }
        },
        total_skills: 4,
        diversity_score: 75
      },
      experience_analysis: {
        years: 3,
        score: 30,
        level: 'Mid-level'
      },
      education_analysis: {
        score: 80,
        has_degree: true
      },
      recommendations: [
        'Consider adding more diverse technical skills',
        'Highlight more work experience and achievements'
      ]
    };
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// Analyze job description with AI
router.post('/analyze-jd', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { text } = req.body;
    
    // Mock JD analysis
    const analysis = {
      required_skills: {
        technical_skills: { skills: ['React', 'JavaScript'], count: 2, importance: 20 },
        soft_skills: { skills: ['communication'], count: 1, importance: 10 }
      },
      experience_requirements: {
        minimum_years: 3,
        level: 'Mid-level'
      },
      seniority_level: 'mid',
      difficulty_score: 70
    };
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ error: 'JD analysis failed' });
  }
});

// Compare candidates with AI
router.post('/compare-candidates', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { jd_text, candidate_resumes } = req.body;
    
    // Mock candidate comparison
    const comparison = [
      {
        candidate_id: 'candidate001',
        name: 'John Doe',
        similarity_score: 85.5,
        comprehensive_score: 87.2,
        skills_match: {
          matched_skills: ['React', 'JavaScript'],
          missing_skills: ['TypeScript'],
          match_percentage: 66.7
        },
        recommendation: 'Recommended'
      }
    ];
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({ error: 'Candidate comparison failed' });
  }
});

export default router;
