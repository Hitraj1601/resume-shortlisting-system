import mongoose from 'mongoose';

const vacancySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true
  },
  location: String,
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  experience: {
    min: Number,
    max: Number
  },
  skills: [String],
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  openings: {
    type: Number,
    default: 1
  },
  deadline: Date,
  status: {
    type: String,
    enum: ['open', 'closed', 'draft'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    aiScore: Number,
    skillsMatch: Number,
    experienceScore: Number
  }]
}, {
  timestamps: true
});

// Virtual for deadline status
vacancySchema.virtual('deadlineStatus').get(function() {
  if (!this.deadline) return 'no-deadline';
  const now = new Date();
  const deadline = new Date(this.deadline);
  
  if (deadline < now) return 'expired';
  if (deadline - now < 7 * 24 * 60 * 60 * 1000) return 'urgent';
  return 'active';
});

// Pre-save middleware
vacancySchema.pre('save', function(next) {
  if (this.deadline && new Date(this.deadline) < new Date()) {
    this.status = 'closed';
  }
  next();
});

export default mongoose.model('Vacancy', vacancySchema);
