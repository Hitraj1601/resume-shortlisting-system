import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Calendar,
  Eye,
  RotateCcw,
  Trash2,
  PlusCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVacancy } from '@/contexts/VacancyContext'
import DashboardLayout from '@/components/DashboardLayout'
import { useToast } from '@/hooks/use-toast'

const ClosedVacancies = () => {
  const navigate = useNavigate()
  const { closedVacancies, reopenVacancy, deleteVacancy } = useVacancy()
  const { toast } = useToast()

  const handleReopenVacancy = (id: string, title: string) => {
    reopenVacancy(id)
    toast({
      title: "Vacancy Reopened",
      description: `${title} has been reopened and is now accepting applications again.`,
    })
  }

  const handleDeleteVacancy = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      deleteVacancy(id)
      toast({
        title: "Vacancy Deleted",
        description: `${title} has been permanently deleted.`,
      })
    }
  }

  const formatClosedDate = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = now.getTime() - deadlineDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return { text: 'Closed today', variant: 'secondary' as const }
    } else if (diffDays === 1) {
      return { text: 'Closed yesterday', variant: 'secondary' as const }
    } else if (diffDays <= 7) {
      return { text: `Closed ${diffDays} days ago`, variant: 'default' as const }
    } else {
      return { text: `Closed on ${deadlineDate.toLocaleDateString()}`, variant: 'outline' as const }
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Closed Vacancies</h1>
            <p className="text-muted-foreground">View and manage your closed job positions</p>
          </div>
          <Button
            variant="hero"
            onClick={() => navigate('/dashboard/create-vacancy')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Vacancy
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Closed</p>
                  <p className="text-2xl font-bold">{closedVacancies.length}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">
                    {closedVacancies.reduce((sum, v) => sum + v.applicants, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recently Closed</p>
                  <p className="text-2xl font-bold">
                    {closedVacancies.filter(v => {
                      const deadline = new Date(v.deadline)
                      const now = new Date()
                      const diffDays = Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
                      return diffDays <= 7
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vacancies List */}
        <Card>
          <CardHeader>
            <CardTitle>All Closed Vacancies</CardTitle>
            <CardDescription>
              {closedVacancies.length} position{closedVacancies.length !== 1 ? 's' : ''} currently closed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {closedVacancies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Closed Vacancies</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't closed any job vacancies yet. Closed vacancies will appear here.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {closedVacancies.map((vacancy) => {
                  const closedInfo = formatClosedDate(vacancy.deadline)
                  return (
                    <motion.div
                      key={vacancy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-6 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{vacancy.title}</h3>
                            <p className="text-muted-foreground">{vacancy.company} • {vacancy.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{vacancy.type}</Badge>
                            <Badge variant="outline">{vacancy.experience}</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {vacancy.applicants} applicant{vacancy.applicants !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(vacancy.deadline).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {vacancy.openings} opening{vacancy.openings !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={closedInfo.variant}>
                            {closedInfo.text}
                          </Badge>
                          {vacancy.salary && (
                            <Badge variant="outline">{vacancy.salary}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/vacancy/${vacancy.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReopenVacancy(vacancy.id, vacancy.title)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVacancy(vacancy.id, vacancy.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}

export default ClosedVacancies
