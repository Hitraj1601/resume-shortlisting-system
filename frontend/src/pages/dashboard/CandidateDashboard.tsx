import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  FileText, 
  MapPin, 
  Clock,
  Star,
  Eye,
  Calendar,
  Building,
  TrendingUp,
  CheckCircle,
  Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
// No mock data imports - everything will be dynamic
import { useResume } from '@/contexts/ResumeContext'
import { useVacancy } from '@/contexts/VacancyContext'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const CandidateDashboard = () => {
  const navigate = useNavigate()
  const { applications, resumeData, mlServiceAvailable, deleteApplication } = useResume()
  const { openVacancies } = useVacancy()
  
  // Get recommended jobs from actual open vacancies based on resume skills
  const getRecommendedJobs = () => {
    if (!resumeData?.skillsAnalysis?.by_category || openVacancies.length === 0) {
      return openVacancies.slice(0, 4) // Return first 4 open vacancies if no resume
    }
    
    // Filter vacancies based on resume skills and return top matches
    const recommended = openVacancies
      .filter(vacancy => {
        const resumeSkills = Object.values(resumeData.skillsAnalysis.by_category)
          .flat()
          .map((skill: any) => typeof skill === 'string' ? skill.toLowerCase() : String(skill).toLowerCase())
        
        const vacancySkills = (vacancy.skills || [])
          .filter((skill: any) => skill != null)
          .map((skill: any) => typeof skill === 'string' ? skill.toLowerCase() : String(skill).toLowerCase())
        
        // Check if any resume skill matches vacancy skills
        return resumeSkills.some(resumeSkill => 
          vacancySkills.some(vacancySkill => 
            resumeSkill.includes(vacancySkill) || vacancySkill.includes(resumeSkill)
          )
        )
      })
      .slice(0, 4) // Return top 4 matches
    
    // If no matches found, return first 4 open vacancies
    return recommended.length > 0 ? recommended : openVacancies.slice(0, 4)
  }
  

  
  const recommendedJobs = getRecommendedJobs()
  const appliedJobs = applications.length
  const profileCompletion = resumeData ? 100 : 85
  
  // Create a computed value for the first 3 applications to ensure reactivity
  const recentApplications = applications.slice(0, 3)

  const stats = [
    {
      title: "Applications Sent",
      value: appliedJobs,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Total job applications"
    },
    {
      title: "Skills Identified", 
      value: resumeData?.skillsAnalysis?.total_count || 0,
      icon: Eye,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      description: "Skills from resume"
    },
    {
      title: "AI Score",
      value: resumeData?.aiScore ? `${resumeData.aiScore}%` : "N/A",
      icon: Star,
      color: "text-accent", 
      bgColor: "bg-accent/10",
      description: "Resume analysis score"
    },
    {
      title: "Match Score",
      value: resumeData?.matchScore ? `${resumeData.matchScore}%` : "N/A",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Job matching potential"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted': 
      case 'accepted': 
        return 'bg-success text-success-foreground'
      case 'under review': 
        return 'bg-warning text-warning-foreground'
      case 'interviewed': 
        return 'bg-secondary text-secondary-foreground'
      case 'rejected':
        return 'bg-destructive text-destructive-foreground'
      default: 
        return 'bg-muted text-muted-foreground'
    }
  }

  const getOverallScore = (app: any) => {
    return Math.round((app.aiScore + app.skillsMatch + app.experienceScore) / 3)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-card p-6 rounded-xl border"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Find Your Dream Job! 🎯</h2>
            <p className="text-muted-foreground mb-4">
              Discover opportunities that match your skills and experience with our AI-powered job matching.
            </p>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 How it works:</strong> "Recommended for You" shows available jobs that match your skills. 
                "My Applications" only shows jobs you've actually applied to. 
                Go to Job Search to apply to any job you're interested in.
              </p>
            </div>
            {mlServiceAvailable === false && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                ⚠️ AI analysis service is currently unavailable. Please ensure the ML service is running for enhanced job matching.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                onClick={() => navigate('/dashboard/job-search')}
              >
                <Search className="w-4 h-4 mr-2" />
                Search Jobs
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/update-resume')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Update Resume
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
            <div className="flex items-center gap-2">
              <Progress value={profileCompletion} className="w-20" />
              <span className="text-sm font-medium">{profileCompletion}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {typeof stat.value === 'number' ? `${stat.value}%` : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Applications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                My Applications
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/my-applications')}
                >
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Track your application status - Only shows jobs you've actually applied to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p>No applications yet</p>
                  <p className="text-sm">Go to Job Search to find and apply to jobs</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard/job-search')}
                    className="mt-2"
                  >
                    Go to Job Search
                  </Button>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={`app-${app.id}-${app.jobId}`} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{app.jobTitle}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {app.company}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                          {app.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {getOverallScore(app)}% match
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/dashboard/my-applications')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your application for "{app.jobTitle}" at {app.company}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteApplication(app.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Application
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Jobs matching your profile - Click to view and apply
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {job.company}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/dashboard/job-search')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                  <p>No job vacancies available</p>
                  <p className="text-sm">HR needs to create job postings first</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard/job-search')}
                    className="mt-2"
                  >
                    Check Job Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Career Tips & Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success mt-1" />
              <div>
                <h5 className="font-medium text-sm">Profile Optimization Complete</h5>
                <p className="text-sm text-muted-foreground">Your profile is now 85% complete. Add certifications to reach 100%!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
              <Star className="w-4 h-4 text-primary mt-1" />
              <div>
                <h5 className="font-medium text-sm">New Job Match Available</h5>
                <p className="text-sm text-muted-foreground">We found {recommendedJobs.length} new jobs that match your skills. Check them out!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-accent mt-1" />
              <div>
                <h5 className="font-medium text-sm">Market Insight</h5>
                <p className="text-sm text-muted-foreground">React developers are in high demand. Your skills are trending!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CandidateDashboard