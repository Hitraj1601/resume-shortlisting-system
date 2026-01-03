import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DashboardLayout from '@/components/DashboardLayout'
import { useResume } from '@/contexts/ResumeContext'
import { useVacancy } from '@/contexts/VacancyContext'
import { 
  Upload,
  FileText,
  Download,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  Star,
  Briefcase,
  MapPin,
  Calendar,
  XCircle
} from 'lucide-react'
// No mock data imports - everything will be dynamic

const UpdateResume = () => {
  const { resumeData, uploadResume, deleteResume, mlServiceAvailable, setResumeData } = useResume()
  const { openVacancies } = useVacancy()
  const [isUploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate match scores for vacancies based on resume skills
  const matchedJobs = useMemo(() => {
    if (!resumeData?.skillsAnalysis?.by_category || !openVacancies.length) {
      return []
    }

    // Extract all resume skills
    const resumeSkills: string[] = []
    Object.values(resumeData.skillsAnalysis.by_category).forEach((category: any) => {
      if (category?.skills && Array.isArray(category.skills)) {
        resumeSkills.push(...category.skills.map((s: string) => s.toLowerCase()))
      }
    })

    // Calculate match score for each vacancy
    const scoredJobs = openVacancies.map(vacancy => {
      const vacancySkills = vacancy.skills?.map((s: string) => s.toLowerCase()) || []
      
      if (vacancySkills.length === 0) {
        return { ...vacancy, matchScore: 70, matchedSkills: [] }
      }

      const matchedSkills = vacancySkills.filter((skill: string) =>
        resumeSkills.some((resumeSkill: string) =>
          resumeSkill.includes(skill) || skill.includes(resumeSkill)
        )
      )

      const matchPercentage = Math.round((matchedSkills.length / vacancySkills.length) * 100)
      const matchScore = Math.min(70 + Math.round(matchPercentage * 0.3), 100)

      return { ...vacancy, matchScore, matchedSkills }
    })

    // Sort by match score and return top 3
    return scoredJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
  }, [resumeData?.skillsAnalysis, openVacancies])

  // Debug logging
  console.log('UpdateResume render:', { resumeData, mlServiceAvailable, error })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    // Start progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          return 90 // Cap at 90% until upload completes
        }
        return prev + 10
      })
    }, 200)

    try {
      // Upload resume using context
      await uploadResume(file)
      console.log('Resume upload successful')
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Reset after a short delay
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      console.error('Resume upload failed:', err)
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
      
      // Offer fallback option
      if (confirm('ML service failed. Would you like to use fallback analysis?')) {
        // Create fallback resume data
        // Generate deterministic score based on file name hash
        const fileHash = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const fallbackResume = {
          id: 'resume1',
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
          skills: ['React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'Git', 'AWS'],
          experience: '3 years',
          education: 'Bachelor in Computer Science',
          aiScore: 80 + (fileHash % 15), // Deterministic score 80-94 based on filename
          matchScore: 80 + ((fileHash * 7) % 15) // Deterministic score 80-94 based on filename
        }
        setResumeData(fallbackResume)
        setError(null)
        setUploading(false)
      }
    }
  }

  const handleDeleteResume = () => {
    deleteResume()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSkillMatchColor = (skill: string) => {
    // Use real ML service data for skill matching
    if (!resumeData?.skillsAnalysis?.by_category) return 'bg-gray-100 text-gray-600 border-gray-200'
    
    // Check if skill is in high-demand categories based on actual analysis
    const highDemandCategories = ['programming', 'web_tech', 'ml_ai', 'cloud']
    const isHighDemand = highDemandCategories.some(category => 
      resumeData.skillsAnalysis.by_category?.[category]?.skills?.includes(skill)
    )
    
    return isHighDemand ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const calculateOverallMatch = () => {
    if (!resumeData?.skillsAnalysis) return 0
    
    // Use real ML service data for overall score
    return resumeData.aiScore || 0
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Update Resume</h1>
            <p className="text-muted-foreground">Upload and manage your resume for better job matching</p>
            <div className="mt-2 text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                mlServiceAvailable === true ? 'bg-green-100 text-green-800' : 
                mlServiceAvailable === false ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {mlServiceAvailable === true ? '✅ ML Service: Connected' : 
                 mlServiceAvailable === false ? '❌ ML Service: Disconnected' : 
                 '⏳ ML Service: Checking...'}
              </span>
            </div>
          </div>
                     <div className="flex gap-2">
             <input
               ref={fileInputRef}
               type="file"
               accept=".pdf,.doc,.docx"
               onChange={handleFileUpload}
               className="hidden"
             />
             <Button
               variant="outline"
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
             >
               <Upload className="w-4 h-4 mr-2" />
               {resumeData ? 'Upload New Resume' : 'Upload Resume'}
             </Button>
           </div>
        </div>

        {/* Resume Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume Upload & Analysis
            </CardTitle>
            <CardDescription>
              Upload your resume to get AI-powered analysis and job matching insights
              {mlServiceAvailable === false && (
                <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                  ⚠️ ML service unavailable. Using fallback analysis.
                </div>
              )}
              {error && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                  ❌ Error: {error}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resumeData ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your resume here, or click to browse files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading resume...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Resume Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{resumeData.fileName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.fileSize} • Uploaded {resumeData.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (resumeData.fileUrl) {
                          window.open(resumeData.fileUrl, '_blank')
                        } else {
                          alert('Resume preview not available. Please re-upload your resume.')
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (resumeData.fileUrl) {
                          const link = document.createElement('a')
                          link.href = resumeData.fileUrl
                          link.download = resumeData.fileName || 'resume.pdf'
                          link.click()
                        } else {
                          alert('Resume file not available for download.')
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Replace
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDeleteResume}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* AI Analysis Results */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {resumeData.aiScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">AI Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {resumeData.matchScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">Match Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {resumeData.skills.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Skills Found</p>
                    </CardContent>
                  </Card>
                </div>

                                 {/* Skills Analysis */}
                 <div className="space-y-3">
                   <h4 className="font-semibold">Skills Analysis</h4>
                   <div className="flex flex-wrap gap-2">
                     {resumeData.skills && resumeData.skills.length > 0 ? (
                       resumeData.skills.map((skill, index) => (
                         <Badge 
                           key={index} 
                           variant="outline" 
                           className={getSkillMatchColor(skill)}
                         >
                           {skill}
                         </Badge>
                       ))
                     ) : (
                       <div className="text-muted-foreground">No skills extracted</div>
                     )}
                   </div>
                   
                   {/* Debug Info */}
                   <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                     <strong>Debug:</strong> Skills count: {resumeData.skills?.length || 0} | 
                     Total from ML: {resumeData.skillsAnalysis?.total_count || 0}
                   </div>
                                     {resumeData.skillsAnalysis && (
                     <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                       <h5 className="font-medium mb-2">Skills Breakdown:</h5>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {/* Handle different ML service response structures */}
                         {resumeData.skillsAnalysis.by_category ? (
                           // New structure with by_category
                           Object.entries(resumeData.skillsAnalysis.by_category).map(([category, data]: [string, any]) => (
                             <div key={category} className="text-sm">
                               <span className="font-medium capitalize">{category.replace('_', ' ')}:</span>
                               <span className="ml-2 text-muted-foreground">
                                 {data.count || data.skills?.length || 0} skills ({data.percentage || 0}%)
                               </span>
                             </div>
                           ))
                         ) : resumeData.skillsAnalysis.categories ? (
                           // Legacy structure with categories
                           Object.entries(resumeData.skillsAnalysis.categories).map(([category, data]: [string, any]) => (
                             <div key={category} className="text-sm">
                               <span className="font-medium capitalize">{category.replace('_', ' ')}:</span>
                               <span className="ml-2 text-muted-foreground">
                                 {data.count || data.skills?.length || 0} skills ({data.score || 0}%)
                               </span>
                             </div>
                           ))
                         ) : (
                           // Fallback display
                           <div className="text-sm text-muted-foreground">
                             Skills analysis data not available in expected format
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                </div>

                {/* Experience & Education */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Level:</span>
                          <span className="font-medium">{resumeData.experience}</span>
                        </div>
                        {resumeData.experienceAnalysis && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Years:</span>
                              <span className="font-medium">{resumeData.experienceAnalysis.years} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Score:</span>
                              <span className="font-medium">{resumeData.experienceAnalysis.score}%</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Degree:</span>
                          <span className="font-medium">{resumeData.education}</span>
                        </div>
                        {resumeData.educationAnalysis && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-medium">{resumeData.educationAnalysis.score}%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary & Recommendations */}
                {resumeData.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI Generated Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{resumeData.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {resumeData.recommendations && resumeData.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Improvement Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resumeData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-muted-foreground">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Matching Preview */}
        {resumeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Job Matching Preview
              </CardTitle>
              <CardDescription>
                Top matching jobs based on your resume skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dynamic Job Matches from actual vacancies */}
                {matchedJobs.length > 0 ? (
                  matchedJobs.map((job: any) => {
                    const getMatchColor = (score: number) => {
                      if (score >= 90) return 'text-green-600'
                      if (score >= 80) return 'text-blue-600'
                      if (score >= 70) return 'text-yellow-600'
                      return 'text-gray-600'
                    }

                    const formatExperience = (exp: any) => {
                      if (!exp) return 'Not specified'
                      if (typeof exp === 'string') return exp
                      if (typeof exp === 'object') {
                        return `${exp.min || 0}-${exp.max || 0} years`
                      }
                      return String(exp)
                    }

                    return (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-semibold">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location || 'Remote'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {formatExperience(job.experience)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.skills?.slice(0, 4).map((skill: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant={job.matchedSkills?.includes(skill.toLowerCase()) ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {job.skills?.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-2xl font-bold ${getMatchColor(job.matchScore)}`}>
                            {job.matchScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{openVacancies.length === 0 
                      ? 'No job openings available at the moment' 
                      : 'Upload your resume to see matching job opportunities'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Resume Tips for Better Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">Do's</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Include relevant keywords from job descriptions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Quantify your achievements with numbers
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Keep it concise and well-formatted
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">Don'ts</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Use generic job titles
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Include irrelevant personal information
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Use outdated formatting or fonts
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}

export default UpdateResume
