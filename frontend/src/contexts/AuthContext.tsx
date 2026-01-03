import React, { createContext, useContext, useState, useEffect } from 'react'
import { demoCredentials, mockUser } from '@/lib/mockData'

interface User {
  id: string
  name: string
  email: string
  role: 'hr' | 'candidate'
  company?: string
  experience?: string
  skills?: string[]
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: 'hr' | 'candidate') => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  isAuthenticated: boolean
  isLoading: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'hr' | 'candidate'
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'hr' | 'candidate'): Promise<boolean> => {
    // Check against demo credentials
    const demoUser = demoCredentials[role]
    
    if (email === demoUser.email && password === demoUser.password) {
      const userData = mockUser[role]
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    }
    
    return false
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Mock registration - just log the user in
    const mockUserData: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      company: userData.company
    }
    
    setUser(mockUserData)
    localStorage.setItem('user', JSON.stringify(mockUserData))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}