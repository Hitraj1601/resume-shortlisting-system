import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/custom-button'
import DashboardLayout from '@/components/DashboardLayout'
import { useResume } from '@/contexts/ResumeContext'
import { 
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Building,
  Calendar,
  Trash2
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const MyApplications = () => {
  const { applications, updateApplicationStatus, deleteApplication } = useResume()
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status.toLowerCase() === selectedStatus.toLowerCase())

  // Monitor applications changes
  useEffect(() => {
    console.log('Applications changed in MyApplications:', applications)
  }, [applications])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interview':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return <FileText className="w-4 h-4" />
      case 'under review':
        return <Clock className="w-4 h-4" />
      case 'interview':
        return <AlertCircle className="w-4 h-4" />
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getOverallScore = (app: any) => {
    return Math.round((app.aiScore + app.skillsMatch + app.experienceScore) / 3)
  }

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    updateApplicationStatus(applicationId, newStatus)
  }

  const handleDeleteApplication = (applicationId: string) => {
    deleteApplication(applicationId)
  }

  if (applications.length === 0) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Applications</h1>
              <p className="text-muted-foreground">Track your job applications and their status</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't applied to any jobs yet. Start your job search to find opportunities!
              </p>
              <Button onClick={() => window.location.href = '/dashboard/job-search'}>
                Search Jobs
              </Button>
            </CardContent>
          </Card>
        </motion.div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">Track your job applications and their status</p>
          </div>
          <Button
            variant="outline"
            onClick={() => console.log('Current applications in MyApplications:', applications)}
            className="text-sm"
          >
            📊 Show State
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status.toLowerCase() === 'under review').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status.toLowerCase() === 'accepted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. AI Score</p>
                  <p className="text-2xl font-bold">
                    {applications.length > 0 
                      ? Math.round(applications.reduce((acc, app) => acc + getOverallScore(app), 0) / applications.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                All ({applications.length})
              </Button>
              <Button
                variant={selectedStatus === 'applied' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('applied')}
              >
                Applied ({applications.filter(app => app.status.toLowerCase() === 'applied').length})
              </Button>
              <Button
                variant={selectedStatus === 'under review' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('under review')}
              >
                Under Review ({applications.filter(app => app.status.toLowerCase() === 'under review').length})
              </Button>
              <Button
                variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('rejected')}
              >
                Rejected ({applications.filter(app => app.status.toLowerCase() === 'rejected').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((app, index) => (
            <motion.div
              key={`app-${app.id}-${app.jobId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{app.jobTitle}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1">{app.status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {app.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {getOverallScore(app)}%
                      </div>
                      <p className="text-sm text-muted-foreground">AI Score</p>
                    </div>
                  </div>

                  {/* AI Score Breakdown */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">{app.aiScore}%</div>
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{app.skillsMatch}%</div>
                      <div className="text-sm text-muted-foreground">Skills Match</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">{app.experienceScore}%</div>
                      <div className="text-sm text-muted-foreground">Experience</div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Applied: {app.appliedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated: {app.lastUpdated}
                    </div>
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {app.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {app.status === 'Under Review' && (
                      <Button variant="default" size="sm">
                        Follow Up
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
                            onClick={() => handleDeleteApplication(app.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Application
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedStatus === 'all' 
                  ? "You haven't applied to any jobs yet. Start your job search!"
                  : `No applications with status "${selectedStatus}" found.`
                }
              </p>
              {selectedStatus !== 'all' && (
                <Button onClick={() => setSelectedStatus('all')}>
                  View All Applications
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default MyApplications
