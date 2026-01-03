import { useAuth } from '@/contexts/AuthContext'
import HRDashboard from './HRDashboard'
import CandidateDashboard from './CandidateDashboard'
import DashboardLayout from '@/components/DashboardLayout'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      {user?.role === 'hr' ? <HRDashboard /> : <CandidateDashboard />}
    </DashboardLayout>
  )
}

export default Dashboard