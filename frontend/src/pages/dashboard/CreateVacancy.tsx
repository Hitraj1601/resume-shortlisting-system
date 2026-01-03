import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  PlusCircle, 
  X, 
  Calendar,
  Users,
  Briefcase,
  MapPin,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useVacancy } from '@/contexts/VacancyContext'

const CreateVacancy = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addVacancy, vacancies } = useVacancy()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experience: '',
    salary: '',
    openings: 1,
    deadline: '',
    description: '',
    requirements: '',
    skills: [] as string[]
  })
  
  const [skillInput, setSkillInput] = useState('')

  // Check for duplicate vacancies
  const duplicateWarning = useMemo(() => {
    if (!formData.title || !formData.company) return null
    
    const existing = vacancies.find(v => 
      v.title.toLowerCase() === formData.title.toLowerCase() &&
      v.company.toLowerCase() === formData.company.toLowerCase() &&
      v.status === 'open'
    )
    
    if (existing) {
      return `A similar vacancy "${existing.title}" at ${existing.company} already exists and is open.`
    }
    return null
  }, [formData.title, formData.company, vacancies])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addSkill = () => {
    if (!skillInput.trim()) return
    
    // Split by comma, semicolon, or pipe to support multiple skills at once
    const newSkills = skillInput
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(s => s && !formData.skills.includes(s))
    
    if (newSkills.length > 0) {
      if (newSkills.length > 1) {
        toast({
          title: "Multiple skills detected",
          description: `Added ${newSkills.length} skills: ${newSkills.join(', ')}`,
        })
      }
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, ...newSkills]
      }))
    }
    setSkillInput('')
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Add the new vacancy using the context
      const success = await addVacancy({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        experience: formData.experience,
        salary: formData.salary,
        openings: formData.openings,
        deadline: formData.deadline,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills
      })

      if (success) {
        toast({
          title: "Vacancy Created Successfully!",
          description: `${formData.title} has been posted and is now live.`,
        })
        navigate('/dashboard')
      } else {
        toast({
          title: "Error Creating Vacancy",
          description: "Failed to create vacancy. Please check your connection and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating vacancy:', error)
      toast({
        title: "Error Creating Vacancy",
        description: "There was an error creating the vacancy. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Vacancy</h1>
          <p className="text-muted-foreground">Post a new job opening and start receiving applications</p>
        </div>

        {duplicateWarning && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {duplicateWarning} Consider updating the existing vacancy instead of creating a duplicate.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Details
                  </CardTitle>
                  <CardDescription>
                    Basic information about the position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Senior Frontend Developer"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="e.g. TechCorp Inc."
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="e.g. San Francisco, CA"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Job Type *</Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience *</Label>
                      <Input
                        id="experience"
                        name="experience"
                        placeholder="e.g. 3-5 years"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the role, responsibilities, and what the ideal candidate should bring..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      placeholder="List the key requirements, qualifications, and skills needed..."
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                  <CardDescription>
                    Add the key skills required for this position. You can add multiple skills at once by separating them with commas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. React, Python, TypeScript (separate with commas)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="pr-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Vacancy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openings">Number of Openings *</Label>
                    <Input
                      id="openings"
                      name="openings"
                      type="number"
                      min="1"
                      value={formData.openings}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary Range (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="salary"
                        name="salary"
                        placeholder="e.g. $80,000 - $120,000"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use clear, specific job titles</li>
                    <li>• List 5-8 key skills for better matching</li>
                    <li>• Include salary range to attract quality candidates</li>
                    <li>• Set realistic application deadlines</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Vacancy...' : 'Post Vacancy'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  )
}

export default CreateVacancy