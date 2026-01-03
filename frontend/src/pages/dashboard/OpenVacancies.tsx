import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Users, 
  Calendar,
  Eye,
  Trash2,
  X,
  PlusCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVacancy } from '@/contexts/VacancyContext'
import DashboardLayout from '@/components/DashboardLayout'
import { useToast } from '@/hooks/use-toast'

const OpenVacancies = () => {
  const navigate = useNavigate()
  const { openVacancies, closeVacancy, deleteVacancy } = useVacancy()
  const { toast } = useToast()

  const handleCloseVacancy = (id: string, title: string) => {
    closeVacancy(id)
    toast({
      title: "Vacancy Closed",
      description: `${title} has been closed and moved to closed vacancies.`,
    })
  }

  const handleDeleteVacancy = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteVacancy(id)
      toast({
        title: "Vacancy Deleted",
        description: `${title} has been permanently deleted.`,
      })
    }
  }

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: 'Expired', variant: 'destructive' as const }
    } else if (diffDays === 0) {
      return { text: 'Today', variant: 'secondary' as const }
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', variant: 'secondary' as const }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, variant: 'default' as const }
    } else {
      return { text: deadlineDate.toLocaleDateString(), variant: 'outline' as const }
    }
  }

  // Helper to format salary for display
  const formatSalary = (salary: any): string => {
    if (!salary) return '';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'object') {
      const { min, max, currency = 'USD' } = salary;
      if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
      if (min) return `${currency} ${min.toLocaleString()}+`;
      if (max) return `Up to ${currency} ${max.toLocaleString()}`;
      return '';
    }
    return String(salary);
  };

  // Helper to format experience for display
  const formatExperience = (experience: any): string => {
    if (!experience) return 'Not specified';
    if (typeof experience === 'string') return experience;
    if (typeof experience === 'object') {
      const { min, max } = experience;
      if (min && max) return `${min} - ${max} years`;
      if (min) return `${min}+ years`;
      if (max) return `Up to ${max} years`;
      return 'Not specified';
    }
    return String(experience);
  };

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
            <h1 className="text-3xl font-bold">Open Vacancies</h1>
            <p className="text-muted-foreground">Manage your currently open job positions</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Open</p>
                  <p className="text-2xl font-bold">{openVacancies.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
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
                    {openVacancies.reduce((sum, v) => sum + v.applicants, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgent Deadlines</p>
                  <p className="text-2xl font-bold">
                    {openVacancies.filter(v => {
                      const deadline = new Date(v.deadline)
                      const now = new Date()
                      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      return diffDays <= 7 && diffDays >= 0
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vacancies List */}
        <Card>
          <CardHeader>
            <CardTitle>All Open Vacancies</CardTitle>
            <CardDescription>
              {openVacancies.length} position{openVacancies.length !== 1 ? 's' : ''} currently open
            </CardDescription>
          </CardHeader>
          <CardContent>
            {openVacancies.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Open Vacancies</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any job vacancies yet. Start by creating your first position.
                </p>
                <Button
                  variant="hero"
                  onClick={() => navigate('/dashboard/create-vacancy')}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create First Vacancy
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {openVacancies.map((vacancy) => {
                  const deadlineInfo = formatDeadline(vacancy.deadline)
                  return (
                    <motion.div
                      key={vacancy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-6 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{vacancy.title}</h3>
                            <p className="text-muted-foreground">{vacancy.company} • {vacancy.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{vacancy.type}</Badge>
                            <Badge variant="outline">{formatExperience(vacancy.experience)}</Badge>
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
                            <Briefcase className="w-4 h-4" />
                            {vacancy.openings} opening{vacancy.openings !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={deadlineInfo.variant}>
                            {deadlineInfo.text}
                          </Badge>
                          {vacancy.salary && (
                            <Badge variant="outline">{formatSalary(vacancy.salary)}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Vacancy Details",
                              description: `${vacancy.title} at ${vacancy.company}\nLocation: ${vacancy.location}\nType: ${vacancy.type}\nOpenings: ${vacancy.openings}\nApplicants: ${vacancy.applicants}`,
                            })
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCloseVacancy(vacancy.id, vacancy.title)}
                          title="Close Vacancy"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVacancy(vacancy.id, vacancy.title)}
                          title="Delete Vacancy"
                          className="text-red-600 hover:text-red-700"
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

export default OpenVacancies
