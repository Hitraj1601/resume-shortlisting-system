import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/custom-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Brain, Mail, Lock, Users, FileText, LogIn, UserCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SavedSession {
  email: string
  name: string
  role: 'hr' | 'candidate'
  lastLogin: string
}

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'hr' | 'candidate'>('hr')
  const [isLoading, setIsLoading] = useState(false)
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'hr' || roleParam === 'candidate') {
      setRole(roleParam)
    }
  }, [searchParams])

  // Check for saved session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('saved_user_info')
    
    if (token && savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        setSavedSession({
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          lastLogin: userInfo.lastLogin || new Date().toISOString()
        })
      } catch (e) {
        // Invalid saved data, clear it
        localStorage.removeItem('saved_user_info')
        setShowLoginForm(true)
      }
    } else if (!token) {
      // No token, show login form directly
      setShowLoginForm(true)
    }
  }, [])

  const handleContinueSession = async () => {
    setIsLoading(true)
    try {
      // Try to use existing token - AuthContext will validate it
      const token = localStorage.getItem('auth_token')
      if (token) {
        navigate('/dashboard')
      } else {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        handleNewLogin()
      }
    } catch (error) {
      toast({
        title: "Session Invalid",
        description: "Could not restore your session. Please log in again.",
        variant: "destructive",
      })
      handleNewLogin()
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewLogin = () => {
    // Clear saved session and show login form
    localStorage.removeItem('auth_token')
    localStorage.removeItem('saved_user_info')
    setSavedSession(null)
    setShowLoginForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password, role)
      if (result.success) {
        // Save user info for "continue session" feature
        localStorage.setItem('saved_user_info', JSON.stringify({
          email,
          name: email.split('@')[0],
          role,
          lastLogin: new Date().toISOString()
        }))
        
        toast({
          title: "Login successful!",
          description: `Welcome back! Redirecting to your ${role} dashboard.`,
        })
        navigate('/dashboard')
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastLogin = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">ResumeAI</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              {savedSession && !showLoginForm 
                ? 'Continue with your existing session or log in with different account'
                : `Sign in to your ${role === 'hr' ? 'HR' : 'candidate'} account`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Saved Session Option */}
            {savedSession && !showLoginForm ? (
              <div className="space-y-4">
                {/* Existing Session Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-muted/50 rounded-lg border-2 border-primary/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{savedSession.name}</p>
                      <p className="text-sm text-muted-foreground">{savedSession.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      savedSession.role === 'hr' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {savedSession.role === 'hr' ? 'HR' : 'Candidate'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Last login: {formatLastLogin(savedSession.lastLogin)}
                  </p>
                  
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleContinueSession}
                    disabled={isLoading}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLoading ? 'Continuing...' : 'Continue as ' + savedSession.name}
                  </Button>
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNewLogin}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Login with Different Account
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={role === 'hr' ? 'default' : 'outline'}
                    onClick={() => setRole('hr')}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    HR
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'candidate' ? 'secondary' : 'outline'}
                    onClick={() => setRole('candidate')}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Candidate
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link 
                    to={`/register?role=${role}`} 
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Token Info */}
        <div className="mt-4 text-center text-white/60 text-xs">
          <p>Sessions are valid for 30 days</p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage