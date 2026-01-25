import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/custom-button'
import { useAuth } from '@/contexts/AuthContext'
import { useVacancy } from '@/contexts/VacancyContext'
import { 
  Brain, 
  LayoutDashboard, 
  PlusCircle, 
  Briefcase, 
  FileText, 
  Search,
  Settings,
  LogOut,
  Bell,
  User,
  MessageCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  count?: number
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth()
  const { openVacancies, closedVacancies } = useVacancy()
  const location = useLocation()
  const navigate = useNavigate()

  const hrNavItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/create-vacancy', icon: PlusCircle, label: 'Create Vacancy' },
    { 
      href: '/dashboard/open-vacancies', 
      icon: Briefcase, 
      label: 'Open Vacancies',
      count: openVacancies.length
    },
    { 
      href: '/dashboard/closed-vacancies', 
      icon: FileText, 
      label: 'Closed Vacancies',
      count: closedVacancies.length
    },
    { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  ]

  const candidateNavItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/job-search', icon: Search, label: 'Job Search' },
    { href: '/dashboard/my-applications', icon: FileText, label: 'My Applications' },
    { href: '/dashboard/update-resume', icon: FileText, label: 'Update Resume' },
    { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  ]

  const navItems: NavItem[] = user?.role === 'hr' ? hrNavItems : candidateNavItems

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-card border-r shadow-lg flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ResumeAI
            </span>
          </Link>
        </div>

        {/* User Profile */}
        <div 
          className="p-6 border-b cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/dashboard/profile')}
        >
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-primary text-white">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <Badge 
                variant={user?.role === 'hr' ? 'default' : 'secondary'} 
                className="mt-1"
              >
                {user?.role === 'hr' ? 'HR Professional' : 'Job Seeker'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count && item.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/dashboard/settings')}
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user?.role === 'hr' ? 'HR Dashboard' : 'Candidate Dashboard'}  
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/dashboard')}
              >
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-destructive" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard/profile')}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout