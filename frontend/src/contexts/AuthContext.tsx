import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '@/lib/api'

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  role: 'hr' | 'candidate'
  company?: string
  experience?: string | number
  skills?: string[]
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  isActive?: boolean
  isVerified?: boolean
  createdAt?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: 'hr' | 'candidate') => Promise<{ success: boolean; message?: string }>
  logout: () => void
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>
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
    // Check if user is logged in from token
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const response = await authAPI.getMe()
          if (response.success && response.user) {
            setUser(response.user)
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('auth_token')
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (email: string, password: string, role: 'hr' | 'candidate'): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.login(email, password)
      
      if (response.success && response.user && response.token) {
        // Store token
        localStorage.setItem('auth_token', response.token)
        
        // Save user info for session recovery
        localStorage.setItem('saved_user_info', JSON.stringify({
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          lastLogin: new Date().toISOString()
        }))
        
        setUser(response.user)
        return { success: true }
      }
      
      return { success: false, message: response.message || 'Login failed' }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.register(userData)
      
      if (response.success && response.user && response.token) {
        // Store token
        localStorage.setItem('auth_token', response.token)
        setUser(response.user)
        return { success: true }
      }
      
      return { success: false, message: response.message || 'Registration failed' }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('saved_user_info')
    }
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