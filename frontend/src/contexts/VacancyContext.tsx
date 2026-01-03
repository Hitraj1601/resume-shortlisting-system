import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { vacanciesAPI } from '@/lib/api'

export interface Vacancy {
  id: string
  _id?: string
  title: string
  company: string
  location: string
  type: string
  experience: string | { min?: number; max?: number }
  salary: string | { min?: number; max?: number; currency?: string }
  openings: number
  deadline: string
  description: string
  requirements: string | string[]
  skills: string[]
  status: 'open' | 'closed' | 'draft'
  createdAt: string
  applicants: number | any[]
  postedBy?: string | { name?: string; email?: string; company?: string }
}

interface VacancyContextType {
  vacancies: Vacancy[]
  openVacancies: Vacancy[]
  closedVacancies: Vacancy[]
  draftVacancies: Vacancy[]
  isLoading: boolean
  error: string | null
  addVacancy: (vacancy: Omit<Vacancy, 'id' | 'createdAt' | 'status' | 'applicants'>) => Promise<boolean>
  updateVacancy: (id: string, updates: Partial<Vacancy>) => Promise<boolean>
  deleteVacancy: (id: string) => Promise<boolean>
  closeVacancy: (id: string) => Promise<boolean>
  reopenVacancy: (id: string) => Promise<boolean>
  getVacancyById: (id: string) => Vacancy | undefined
  refreshVacancies: () => Promise<void>
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined)

export const useVacancy = () => {
  const context = useContext(VacancyContext)
  if (!context) {
    throw new Error('useVacancy must be used within a VacancyProvider')
  }
  return context
}

interface VacancyProviderProps {
  children: ReactNode
}

// Helper to normalize vacancy data from API
const normalizeVacancy = (vacancy: any): Vacancy => {
  return {
    ...vacancy,
    id: vacancy._id || vacancy.id,
    applicants: Array.isArray(vacancy.applicants) ? vacancy.applicants.length : (vacancy.applicants || 0),
  }
}

export const VacancyProvider: React.FC<VacancyProviderProps> = ({ children }) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vacancies from API on mount
  const refreshVacancies = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await vacanciesAPI.getAll({ limit: 100 })
      if (response.success && response.data) {
        const normalizedVacancies = response.data.map(normalizeVacancy)
        setVacancies(normalizedVacancies)
      } else {
        setError(response.message || 'Failed to fetch vacancies')
      }
    } catch (err) {
      console.error('Error fetching vacancies:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshVacancies()
  }, [])

  const addVacancy = async (vacancyData: Omit<Vacancy, 'id' | 'createdAt' | 'status' | 'applicants'>): Promise<boolean> => {
    try {
      const response = await vacanciesAPI.create(vacancyData)
      if (response.success && response.data) {
        const newVacancy = normalizeVacancy(response.data)
        setVacancies(prev => [newVacancy, ...prev])
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating vacancy:', error)
      return false
    }
  }

  const updateVacancy = async (id: string, updates: Partial<Vacancy>): Promise<boolean> => {
    try {
      const response = await vacanciesAPI.update(id, updates)
      if (response.success) {
        setVacancies(prev =>
          prev.map(vacancy =>
            (vacancy.id === id || vacancy._id === id) ? { ...vacancy, ...updates } : vacancy
          )
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating vacancy:', error)
      return false
    }
  }

  const deleteVacancy = async (id: string): Promise<boolean> => {
    try {
      const response = await vacanciesAPI.delete(id)
      if (response.success) {
        setVacancies(prev => prev.filter(vacancy => vacancy.id !== id && vacancy._id !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting vacancy:', error)
      return false
    }
  }

  const closeVacancy = async (id: string): Promise<boolean> => {
    try {
      const response = await vacanciesAPI.close(id)
      if (response.success) {
        setVacancies(prev =>
          prev.map(vacancy =>
            (vacancy.id === id || vacancy._id === id) ? { ...vacancy, status: 'closed' } : vacancy
          )
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Error closing vacancy:', error)
      return false
    }
  }

  const reopenVacancy = async (id: string): Promise<boolean> => {
    try {
      const response = await vacanciesAPI.reopen(id)
      if (response.success) {
        setVacancies(prev =>
          prev.map(vacancy =>
            (vacancy.id === id || vacancy._id === id) ? { ...vacancy, status: 'open' } : vacancy
          )
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Error reopening vacancy:', error)
      return false
    }
  }

  const getVacancyById = (id: string) => {
    return vacancies.find(vacancy => vacancy.id === id || vacancy._id === id)
  }

  // Computed values
  const openVacancies = vacancies.filter(v => v.status === 'open')
  const closedVacancies = vacancies.filter(v => v.status === 'closed')
  const draftVacancies = vacancies.filter(v => v.status === 'draft')

  const value: VacancyContextType = {
    vacancies,
    openVacancies,
    closedVacancies,
    draftVacancies,
    isLoading,
    error,
    addVacancy,
    updateVacancy,
    deleteVacancy,
    closeVacancy,
    reopenVacancy,
    getVacancyById,
    refreshVacancies
  }

  return (
    <VacancyContext.Provider value={value}>
      {children}
    </VacancyContext.Provider>
  )
}
