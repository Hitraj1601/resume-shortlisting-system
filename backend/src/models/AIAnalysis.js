import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application is required'],
  },
  vacancy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacancy',
    required: [true, 'Vacancy is required'],
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate is required'],
  },
  analysisType: {
    type: String,
    enum: ['resume', 'jd_match', 'skills_assessment', 'cultural_fit', 'overall'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  scores: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
    },
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100,
    },
    experienceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    culturalFit: {
      type: Number,
      min: 0,
      max: 100,
    },
    communication: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalSkills: {
      type: Number,
      min: 0,
      max: 100,
    },
    softSkills: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  detailedAnalysis: {
    skills: [{
      skill: String,
      match: Number,
      importance: Number,
      candidateLevel: String,
      requiredLevel: String,
      gap: String,
      recommendations: [String],
    }],
    experience: {
      required: String,
      candidate: String,
      match: Number,
      gap: String,
      relevance: Number,
      suggestions: [String],
    },
    education: {
      required: String,
      candidate: String,
      match: Number,
      additional: [String],
    },
    certifications: [{
      name: String,
      relevance: Number,
      value: String,
    }],
    projects: [{
      title: String,
      description: String,
      relevance: Number,
      skills: [String],
      impact: String,
    }],
    strengths: [{
      area: String,
      description: String,
      confidence: Number,
    }],
    weaknesses: [{
      area: String,
      description: String,
      impact: Number,
      suggestions: [String],
    }],
    recommendations: [{
      type: String,
      description: String,
      priority: String,
      action: String,
    }],
  },
  aiModel: {
    name: String,
    version: String,
    confidence: Number,
    processingTime: Number,
  },
  rawData: {
    resumeText: String,
    jdText: String,
    extractedSkills: [String],
    extractedExperience: String,
    extractedEducation: String,
  },
  metadata: {
    tokensUsed: Number,
    cost: Number,
    apiProvider: String,
    requestId: String,
  },
  errorLog: [{
    timestamp: Date,
    error: String,
    details: String,
  }],
  processingHistory: [{
    step: String,
    status: String,
    timestamp: Date,
    duration: Number,
    notes: String,
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for weighted score
aiAnalysisSchema.virtual('weightedScore').get(function() {
  if (!this.scores) return null;
  
  const weights = {
    skillsMatch: 0.3,
    experienceScore: 0.25,
    technicalSkills: 0.2,
    culturalFit: 0.15,
    communication: 0.1,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(weights).forEach(([key, weight]) => {
    if (this.scores[key] !== undefined) {
      weightedSum += (this.scores[key] || 0) * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
});

// Virtual for analysis quality
aiAnalysisSchema.virtual('qualityScore').get(function() {
  if (!this.aiModel || !this.aiModel.confidence) return null;
  
  const confidence = this.aiModel.confidence || 0;
  const processingTime = this.aiModel.processingTime || 0;
  
  // Quality based on confidence and processing time
  let quality = confidence;
  
  if (processingTime > 0) {
    // Penalize very slow processing
    if (processingTime > 30000) { // 30 seconds
      quality *= 0.9;
    } else if (processingTime > 15000) { // 15 seconds
      quality *= 0.95;
    }
  }
  
  return Math.round(quality);
});

// Indexes for better query performance
aiAnalysisSchema.index({ application: 1, analysisType: 1 });
aiAnalysisSchema.index({ vacancy: 1, status: 1 });
aiAnalysisSchema.index({ candidate: 1, createdAt: -1 });
aiAnalysisSchema.index({ status: 1, createdAt: -1 });
aiAnalysisSchema.index({ 'scores.overall': -1 });
aiAnalysisSchema.index({ 'aiModel.confidence': -1 });

// Pre-save middleware to update lastUpdated
aiAnalysisSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find latest analysis by application
aiAnalysisSchema.statics.findLatestByApplication = function(applicationId, analysisType = 'overall') {
  return this.findOne({
    application: applicationId,
    analysisType,
    status: 'completed',
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Static method to find analyses by vacancy
aiAnalysisSchema.statics.findByVacancy = function(vacancyId, status = 'completed') {
  return this.find({
    vacancy: vacancyId,
    status,
    isActive: true,
  }).populate('candidate', 'name email avatar')
    .sort({ 'scores.overall': -1 });
};

// Static method to find top candidates by score
aiAnalysisSchema.statics.findTopCandidates = function(vacancyId, limit = 10) {
  return this.find({
    vacancy: vacancyId,
    status: 'completed',
    isActive: true,
  }).populate('candidate', 'name email avatar skills experience')
    .sort({ 'scores.overall': -1 })
    .limit(limit);
};

// Static method to get analysis statistics
aiAnalysisSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { status: 'completed', isActive: true }
    },
    {
      $group: {
        _id: '$analysisType',
        count: { $sum: 1 },
        avgOverallScore: { $avg: '$scores.overall' },
        avgSkillsScore: { $avg: '$scores.skillsMatch' },
        avgExperienceScore: { $avg: '$scores.experienceScore' },
        avgConfidence: { $avg: '$aiModel.confidence' },
        totalCost: { $sum: '$metadata.cost' },
      },
    },
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      avgOverallScore: Math.round(stat.avgOverallScore || 0),
      avgSkillsScore: Math.round(stat.avgSkillsScore || 0),
      avgExperienceScore: Math.round(stat.avgExperienceScore || 0),
      avgConfidence: Math.round(stat.avgConfidence || 0),
      totalCost: stat.totalCost || 0,
    };
    return acc;
  }, {});
};

// Instance method to add processing step
aiAnalysisSchema.methods.addProcessingStep = function(step, status, notes = '', duration = 0) {
  this.processingHistory.push({
    step,
    status,
    timestamp: new Date(),
    duration,
    notes,
  });
  return this.save();
};

// Instance method to log error
aiAnalysisSchema.methods.logError = function(error, details = '') {
  this.errorLog.push({
    timestamp: new Date(),
    error: error.message || error,
    details,
  });
  this.status = 'failed';
  return this.save();
};

// Instance method to update scores
aiAnalysisSchema.methods.updateScores = function(newScores) {
  this.scores = { ...this.scores, ...newScores };
  this.status = 'completed';
  return this.save();
};

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);

export default AIAnalysis;
