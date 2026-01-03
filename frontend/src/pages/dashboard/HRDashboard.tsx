import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { 
  PlusCircle, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Star,
  Eye,
  Calendar,
  FileText
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVacancy } from '@/contexts/VacancyContext'

const HRDashboard = () => {
  const navigate = useNavigate()
  const { openVacancies, closedVacancies, vacancies } = useVacancy()
  
  const totalApplications = vacancies.reduce((sum, v) => sum + v.applicants, 0)
  const avgRating = 85 // Default rating since we don't have candidate data yet

  const stats = [
    {
      title: "Open Vacancies",
      value: openVacancies.length,
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Closed Vacancies", 
      value: closedVacancies.length,
      icon: FileText,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Total Applications", 
      value: totalApplications,
      icon: Users,
      color: "text-accent", 
      bgColor: "bg-accent/10"
    },
    {
      title: "Total Vacancies",
      value: vacancies.length,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-card p-6 rounded-xl border"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
            <p className="text-muted-foreground mb-4">
              Manage your vacancies and find the perfect candidates with AI-powered insights.
            </p>
            <Button
              variant="hero"
              onClick={() => navigate('/dashboard/create-vacancy')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Vacancy
            </Button>
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
                    <p className="text-2xl font-bold">{stat.value}</p>
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
        {/* Recent Vacancies */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Active Vacancies
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/open-vacancies')}
                >
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Your currently open positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openVacancies.slice(0, 3).map((vacancy) => (
                <div key={vacancy.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{vacancy.title}</h4>
                    <p className="text-sm text-muted-foreground">{vacancy.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {vacancy.applicants} applicants
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(vacancy.deadline).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/vacancy/${vacancy.id || vacancy._id}/applicants`)}
                      title="View Applicants"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/vacancy/${vacancy.id || vacancy._id}/applicants`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {openVacancies.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No open vacancies yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/dashboard/create-vacancy')}
                  >
                    Create First Vacancy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Closed Vacancies */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Closed Vacancies
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/closed-vacancies')}
                >
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Recently closed positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {closedVacancies.slice(0, 3).map((vacancy) => (
                <div key={vacancy.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{vacancy.title}</h4>
                    <p className="text-sm text-muted-foreground">{vacancy.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {vacancy.applicants} applicants
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(vacancy.deadline).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/dashboard/vacancy/${vacancy.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {closedVacancies.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No closed vacancies yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>


    </div>
  )
}

export default HRDashboard