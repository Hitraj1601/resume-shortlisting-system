import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Eye,
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Download,
  Pause
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useVacancy } from '@/contexts/VacancyContext'
import { applicationsAPI, chatAPI } from '@/lib/api'
import { toast } from 'sonner'

interface Applicant {
  _id: string
  candidate: {
    _id: string
    name: string
    email: string
    phone?: string
    location?: string
    skills?: string[]
    experience?: string
    avatar?: string
  }
  vacancy: {
    _id: string
    title: string
    company: string
  }
  status: string
  resume?: {
    fileName?: string
    fileUrl?: string
    skills?: string[]
    aiScore?: number
    matchScore?: number
  }
  aiScore?: {
    overall: number
    skillsMatch: number
    experienceMatch: number
    educationMatch: number
  }
  appliedAt: string
  hrNotes?: string
}

const VacancyApplicants = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vacancies } = useVacancy()
  
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<string>('')
  const [hrNotes, setHrNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Find the vacancy
  const vacancy = vacancies.find(v => v.id === id || v._id === id)

  useEffect(() => {
    if (id) {
      fetchApplicants()
    }
  }, [id])

  const fetchApplicants = async () => {
    try {
      setIsLoading(true)
      const response = await applicationsAPI.getByVacancy(id!)
      if (response.success && response.data) {
        setApplicants(response.data as Applicant[])
      }
    } catch (error) {
      console.error('Error fetching applicants:', error)
      toast.error('Failed to load applicants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedApplicant || !statusAction) return

    try {
      setIsUpdating(true)
      const response = await applicationsAPI.updateStatus(
        selectedApplicant._id,
        statusAction,
        hrNotes
      )
      
      if (response.success) {
        toast.success(`Application ${statusAction} successfully`)
        // Update local state
        setApplicants(prev => 
          prev.map(app => 
            app._id === selectedApplicant._id 
              ? { ...app, status: statusAction, hrNotes } 
              : app
          )
        )
        setShowStatusModal(false)
        setHrNotes('')
        setSelectedApplicant(null)
      } else {
        toast.error(response.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update application status')
    } finally {
      setIsUpdating(false)
    }
  }

  const openStatusModal = (applicant: Applicant, action: string) => {
    setSelectedApplicant(applicant)
    setStatusAction(action)
    setHrNotes(applicant.hrNotes || '')
    setShowStatusModal(true)
  }

  const handleStartChat = async (applicant: Applicant) => {
    try {
      const response = await chatAPI.startChat(applicant._id)
      if (response.success) {
        toast.success('Chat started! Redirecting to messages...')
        navigate('/dashboard/messages')
      } else {
        toast.error(response.message || 'Failed to start chat')
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error('Failed to start chat')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'shortlisted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'on-hold':
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'under review':
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getOverallScore = (applicant: Applicant) => {
    if (applicant.aiScore?.overall) return applicant.aiScore.overall
    if (applicant.resume?.aiScore) return applicant.resume.aiScore
    return 0
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/open-vacancies')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{vacancy?.title || 'Vacancy'} - Applicants</h1>
            <p className="text-muted-foreground">
              {vacancy?.company} • {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applicants.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {applicants.filter(a => ['accepted', 'shortlisted'].includes(a.status.toLowerCase())).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Shortlisted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {applicants.filter(a => ['pending', 'under review'].includes(a.status.toLowerCase())).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {applicants.filter(a => a.status.toLowerCase() === 'rejected').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applicants List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applicants</CardTitle>
            <CardDescription>
              Review and manage applications for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applicants Yet</h3>
                <p className="text-muted-foreground">
                  No candidates have applied for this position yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <motion.div
                    key={applicant._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between p-6 bg-muted/50 rounded-lg border"
                  >
                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {applicant.candidate?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">
                              {applicant.candidate?.name || 'Unknown Candidate'}
                            </h3>
                            <Badge className={getStatusColor(applicant.status)}>
                              {applicant.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            {applicant.candidate?.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {applicant.candidate.email}
                              </span>
                            )}
                            {applicant.candidate?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {applicant.candidate.phone}
                              </span>
                            )}
                            {applicant.candidate?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {applicant.candidate.location}
                              </span>
                            )}
                            {applicant.candidate?.experience && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {applicant.candidate.experience}
                              </span>
                            )}
                          </div>

                          {/* Skills */}
                          {applicant.candidate?.skills && applicant.candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {applicant.candidate.skills.slice(0, 5).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {applicant.candidate.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{applicant.candidate.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* AI Score */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className={`font-semibold ${getScoreColor(getOverallScore(applicant))}`}>
                                {getOverallScore(applicant)}% Match
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplicant(applicant)
                          setShowResumeModal(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartChat(applicant)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>

                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 hover:bg-green-50"
                          onClick={() => openStatusModal(applicant, 'shortlisted')}
                          disabled={applicant.status === 'shortlisted'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-yellow-600 hover:bg-yellow-50"
                          onClick={() => openStatusModal(applicant, 'on-hold')}
                          disabled={applicant.status === 'on-hold'}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={() => openStatusModal(applicant, 'rejected')}
                          disabled={applicant.status === 'rejected'}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resume Modal */}
        <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedApplicant?.candidate?.name}'s Resume
              </DialogTitle>
              <DialogDescription>
                Review candidate's resume and qualifications
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Candidate Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedApplicant?.candidate?.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedApplicant?.candidate?.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedApplicant?.candidate?.location || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {selectedApplicant?.candidate?.experience || 'N/A'}
                  </div>
                </div>
              </div>

              {/* AI Scores */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3">AI Analysis Scores</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Overall Match</span>
                      <span className="text-sm font-semibold">
                        {getOverallScore(selectedApplicant!)}%
                      </span>
                    </div>
                    <Progress value={getOverallScore(selectedApplicant!)} />
                  </div>
                  {selectedApplicant?.aiScore && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Skills Match</span>
                          <span className="text-sm font-semibold">
                            {selectedApplicant.aiScore.skillsMatch}%
                          </span>
                        </div>
                        <Progress value={selectedApplicant.aiScore.skillsMatch} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Experience Match</span>
                          <span className="text-sm font-semibold">
                            {selectedApplicant.aiScore.experienceMatch}%
                          </span>
                        </div>
                        <Progress value={selectedApplicant.aiScore.experienceMatch} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedApplicant?.candidate?.skills && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.candidate.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume File */}
              {selectedApplicant?.resume?.fileUrl && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Resume Document</h4>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedApplicant.resume?.fileUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowResumeModal(false)}>
                Close
              </Button>
              <Button onClick={() => handleStartChat(selectedApplicant!)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Change Modal */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {statusAction === 'shortlisted' && 'Shortlist Candidate'}
                {statusAction === 'on-hold' && 'Put on Hold'}
                {statusAction === 'rejected' && 'Reject Application'}
              </DialogTitle>
              <DialogDescription>
                {statusAction === 'shortlisted' && 'Move this candidate to the shortlist for further consideration.'}
                {statusAction === 'on-hold' && 'Put this application on hold for later review.'}
                {statusAction === 'rejected' && 'Reject this application. You can add notes for your records.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">HR Notes (optional)</label>
                <Textarea
                  placeholder="Add any notes about this decision..."
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className={
                  statusAction === 'shortlisted' ? 'bg-green-600 hover:bg-green-700' :
                  statusAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                }
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  )
}

export default VacancyApplicants
