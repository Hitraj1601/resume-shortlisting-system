import React, { createContext, useContext, useState, useEffect } from 'react'

interface ResumeData {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
  lastUpdated: string
  skills: string[]
  experience: string
  education: string
  aiScore: number
  matchScore: number
  // Additional fields from ML service
  skillsAnalysis?: any
  experienceAnalysis?: any
  educationAnalysis?: any
  contactInfo?: any
  summary?: string
  recommendations?: string[]
}

interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  appliedDate: string
  status: string
  aiScore: number
  skillsMatch: number
  experienceScore: number
  lastUpdated: string
  notes?: string
}

interface ResumeContextType {
  resumeData: ResumeData | null
  applications: Application[]
  mlServiceAvailable: boolean | null
  uploadResume: (file: File) => Promise<void>
  deleteResume: () => void
  setResumeData: (data: ResumeData) => void
  applyToJob: (jobId: string, jobTitle: string, company: string, vacancyData?: any) => void
  updateApplicationStatus: (applicationId: string, status: string) => void
  deleteApplication: (applicationId: string) => void
  getApplicationByJobId: (jobId: string) => Application | undefined
  isJobApplied: (jobId: string) => boolean
  forceUpdate: number
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

export const useResume = () => {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [mlServiceAvailable, setMlServiceAvailable] = useState<boolean | null>(null)
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render mechanism

  // Check ML service health on mount
  useEffect(() => {
    checkMLServiceHealth()
  }, [])

  const checkMLServiceHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('ML service health check successful:', data)
        setMlServiceAvailable(true)
      } else {
        console.log('ML service health check failed:', response.status, response.statusText)
        setMlServiceAvailable(false)
      }
    } catch (error) {
      console.log('ML service not available:', error)
      setMlServiceAvailable(false)
    }
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const savedResume = localStorage.getItem('resume_data')
    const savedApplications = localStorage.getItem('resume_applications')
    
    console.log('Loading from localStorage - savedApplications:', savedApplications)
    
    if (savedResume) {
      setResumeData(JSON.parse(savedResume))
    }
    
    if (savedApplications) {
      const parsedApplications = JSON.parse(savedApplications)
      console.log('Setting applications from localStorage:', parsedApplications)
      setApplications(parsedApplications)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (resumeData) {
      localStorage.setItem('resume_data', JSON.stringify(resumeData))
    }
  }, [resumeData])

  useEffect(() => {
    console.log('Saving applications to localStorage:', applications)
    localStorage.setItem('resume_applications', JSON.stringify(applications))
  }, [applications])

  const uploadResume = async (file: File): Promise<void> => {
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Call ML service API
      const response = await fetch('http://localhost:8000/analyze-resume', {
        method: 'POST',
        mode: 'cors',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`ML service error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('ML service response:', result)
      
      // Check if the response has the expected structure
      let analysis
      if (!result.success && !result.data) {
        // If the response doesn't have success/data structure, assume it's the analysis directly
        analysis = result
        console.log('Using direct analysis response:', analysis)
      } else if (result.success && result.data) {
        analysis = result.data
        console.log('Using structured response data:', analysis)
      } else {
        throw new Error('ML service analysis failed: Invalid response format')
      }

      // Extract skills from the analysis
      const skills: string[] = []
      console.log('Raw skills analysis:', analysis.skills_analysis)
      
      if (analysis.skills_analysis?.all_skills && Array.isArray(analysis.skills_analysis.all_skills)) {
        // Use the new all_skills array if available
        skills.push(...analysis.skills_analysis.all_skills)
        console.log('Using all_skills:', analysis.skills_analysis.all_skills)
      } else if (analysis.skills_analysis?.by_category) {
        // Fallback to extracting from categories
        Object.values(analysis.skills_analysis.by_category).forEach((category: any) => {
          if (category.skills && Array.isArray(category.skills)) {
            skills.push(...category.skills)
          }
        })
        console.log('Using by_category skills:', skills)
      } else if (analysis.skills_analysis?.categories) {
        // Legacy format fallback
        Object.values(analysis.skills_analysis.categories).forEach((category: any) => {
          if (category.skills && Array.isArray(category.skills)) {
            skills.push(...category.skills)
          }
        })
        console.log('Using categories skills:', skills)
      }
      
      console.log('Final extracted skills:', skills)

      // Create resume data from ML service analysis
      const resumeData: ResumeData = {
        id: 'resume1',
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        skills: skills.length > 0 ? skills : ['React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'Git', 'AWS'],
        experience: analysis.experience_analysis?.level || '3 years',
        education: analysis.education_analysis?.has_degree ? 'Bachelor in Computer Science' : 'High School',
        aiScore: analysis.overall_score || Math.floor(Math.random() * 20) + 80,
        matchScore: analysis.skills_analysis?.total_count ? Math.min(analysis.skills_analysis.total_count * 10, 100) : Math.floor(Math.random() * 20) + 80,
        // Store additional ML analysis data
        skillsAnalysis: analysis.skills_analysis,
        experienceAnalysis: analysis.experience_analysis,
        educationAnalysis: analysis.education_analysis,
        contactInfo: analysis.contact_info,
        summary: analysis.summary,
        recommendations: analysis.recommendations
      }

      setResumeData(resumeData)
    } catch (error) {
      console.error('Error uploading resume:', error)
      
      // Re-throw the error so the component can handle it
      throw error
    }
  }

  const deleteResume = () => {
    setResumeData(null)
    localStorage.removeItem('resume_data')
  }

  const applyToJob = async (jobId: string, jobTitle: string, company: string, vacancyData?: any) => {
    // Check if already applied
    if (applications.some(app => app.jobId === jobId)) {
      return
    }

    try {
      // If we have resume data and vacancy data, calculate dynamic matching scores
      let aiScore = 70
      let skillsMatch = 70
      let experienceScore = 70

      if (resumeData && resumeData.skillsAnalysis && vacancyData) {
        // Calculate skills match based on actual resume skills and real job requirements
        const resumeSkills = Object.values(resumeData.skillsAnalysis.by_category)
          .flat()
          .map((skill: any) => skill.toLowerCase())
        
        // Use real job skills from vacancy
        const jobSkills = vacancyData.skills.map((skill: string) => skill.toLowerCase())
        
        // Calculate skills match percentage
        const matchedSkills = jobSkills.filter(skill => 
          resumeSkills.some(resumeSkill => 
            resumeSkill.includes(skill) || skill.includes(resumeSkill)
          )
        )
        skillsMatch = Math.round((matchedSkills.length / jobSkills.length) * 100)
        
        // Use AI score from resume analysis
        aiScore = resumeData.aiScore || 70
        
        // Use experience score from resume analysis
        if (resumeData.experienceAnalysis) {
          experienceScore = resumeData.experienceAnalysis.score
        }
      }

      const newApplication: Application = {
        id: `app_${Date.now()}`,
        jobId,
        jobTitle,
        company,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        aiScore,
        skillsMatch,
        experienceScore,
        lastUpdated: new Date().toISOString().split('T')[0],
        notes: 'Application submitted successfully'
      }

      setApplications(prev => [...prev, newApplication])
    } catch (error) {
      console.error('Error applying to job:', error)
      
      // Fallback to basic application if analysis fails
      const fallbackApplication: Application = {
        id: `app_${Date.now()}`,
        jobId,
        jobTitle,
        company,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        aiScore: Math.floor(Math.random() * 20) + 70,
        skillsMatch: Math.floor(Math.random() * 20) + 70,
        experienceScore: Math.floor(Math.random() * 20) + 70,
        lastUpdated: new Date().toISOString().split('T')[0],
        notes: 'Application submitted successfully'
      }
      
      setApplications(prev => [...prev, fallbackApplication])
    }
  }

  const updateApplicationStatus = (applicationId: string, status: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status, lastUpdated: new Date().toISOString().split('T')[0] }
          : app
      )
    )
  }

  const deleteApplication = (applicationId: string) => {
    console.log('=== DELETE OPERATION START ===')
    console.log('Application ID to delete:', applicationId)
    console.log('Current applications array:', applications)
    console.log('Current applications length:', applications.length)
    
    // Use a more explicit approach to ensure state update
    const updatedApplications = applications.filter(app => app.id !== applicationId)
    console.log('Updated applications array:', updatedApplications)
    console.log('Updated applications length:', updatedApplications.length)
    
    setApplications(updatedApplications)
    
    // Force a re-render to ensure all components update
    setForceUpdate(prev => prev + 1)
    
    // Manually reload from localStorage to test
    setTimeout(() => {
      const savedApplications = localStorage.getItem('resume_applications')
      console.log('localStorage after deletion:', savedApplications)
      if (savedApplications) {
        const parsed = JSON.parse(savedApplications)
        console.log('Parsed localStorage after deletion:', parsed)
      }
    }, 100)
    
    console.log('=== DELETE OPERATION COMPLETE ===')
  }

  const getApplicationByJobId = (jobId: string): Application | undefined => {
    return applications.find(app => app.jobId === jobId)
  }

  const isJobApplied = (jobId: string): boolean => {
    return applications.some(app => app.jobId === jobId)
  }



  const value: ResumeContextType = {
    resumeData,
    applications,
    mlServiceAvailable,
    uploadResume,
    deleteResume,
    setResumeData,
    applyToJob,
    updateApplicationStatus,
    deleteApplication,
    getApplicationByJobId,
    isJobApplied,
    forceUpdate
  }

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  )
}
