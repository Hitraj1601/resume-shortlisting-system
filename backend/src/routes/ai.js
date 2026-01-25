import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
    res.json({
      success: true,
      aiService: 'connected',
      data: response.data
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      aiService: 'disconnected',
      message: 'AI/ML service is not available. Please ensure the ML service is running.'
    });
  }
});

// Analyze resume with AI
router.post('/analyze-resume', protect, async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required',
        message: 'Please provide resume content to analyze.'
      });
    }

    // Call ML service - no fallback
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-resume`, 
      { text: resumeText },
      { timeout: 30000 }
    );
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI analysis error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        success: false, 
        error: 'ML service unavailable',
        message: 'The AI/ML service is not running. Please start the ML service and try again.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'AI analysis failed',
      message: error.response?.data?.message || 'Failed to analyze resume. Please try again.'
    });
  }
});

// Analyze job description with AI
router.post('/analyze-jd', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job description text is required',
        message: 'Please provide job description content to analyze.'
      });
    }

    // Call ML service - no fallback
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-jd`, 
      { text },
      { timeout: 30000 }
    );
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('JD analysis error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        success: false, 
        error: 'ML service unavailable',
        message: 'The AI/ML service is not running. Please start the ML service and try again.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'JD analysis failed',
      message: error.response?.data?.message || 'Failed to analyze job description. Please try again.'
    });
  }
});

// Compare candidates with AI
router.post('/compare-candidates', protect, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { jd_text, candidate_resumes } = req.body;
    
    if (!jd_text || !candidate_resumes || candidate_resumes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Job description and candidate resumes are required for comparison.'
      });
    }

    // Call ML service - no fallback
    const response = await axios.post(`${AI_SERVICE_URL}/match-candidates`, 
      { jd_text, candidate_resumes },
      { timeout: 60000 }
    );
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Candidate comparison error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        success: false, 
        error: 'ML service unavailable',
        message: 'The AI/ML service is not running. Please start the ML service and try again.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Candidate comparison failed',
      message: error.response?.data?.message || 'Failed to compare candidates. Please try again.'
    });
  }
});

export default router;
