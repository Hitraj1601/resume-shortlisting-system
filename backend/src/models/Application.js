import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vacancy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacancy',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  resume: {
    filename: String,
    path: String,
    size: Number
  },
  coverLetter: {
    filename: String,
    path: String,
    size: Number
  },
  aiScore: {
    overall: Number,
    skillsMatch: Number,
    experienceScore: Number,
    culturalFit: Number
  },
  aiAnalysis: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    summary: String
  },
  hrNotes: String,
  interviewSchedule: {
    scheduled: Boolean,
    date: Date,
    time: String,
    type: String
  },
  timeline: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
applicationSchema.index({ candidate: 1, vacancy: 1 }, { unique: true });
applicationSchema.index({ status: 1, appliedAt: -1 });

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      notes: `Application ${this.status}`
    });
  }
  next();
});

export default mongoose.model('Application', applicationSchema);
