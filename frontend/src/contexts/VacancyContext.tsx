import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Vacancy {
  id: string
  title: string
  company: string
  location: string
  type: string
  experience: string
  salary: string
  openings: number
  deadline: string
  description: string
  requirements: string
  skills: string[]
  status: 'open' | 'closed' | 'draft'
  createdAt: string
  applicants: number
}

interface VacancyContextType {
  vacancies: Vacancy[]
  openVacancies: Vacancy[]
  closedVacancies: Vacancy[]
  draftVacancies: Vacancy[]
  addVacancy: (vacancy: Omit<Vacancy, 'id' | 'createdAt' | 'status' | 'applicants'>) => void
  updateVacancy: (id: string, updates: Partial<Vacancy>) => void
  deleteVacancy: (id: string) => void
  closeVacancy: (id: string) => void
  reopenVacancy: (id: string) => void
  getVacancyById: (id: string) => Vacancy | undefined
  updateVacancyStatuses: () => void
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

export const VacancyProvider: React.FC<VacancyProviderProps> = ({ children }) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])

  // Load vacancies from localStorage on mount
  useEffect(() => {
    const savedVacancies = localStorage.getItem('vacancies')
    if (savedVacancies) {
      try {
        const parsed = JSON.parse(savedVacancies)
        setVacancies(parsed)
      } catch (error) {
        console.error('Error loading vacancies from localStorage:', error)
      }
    } else {
      // Start with empty vacancies - let HR create real ones
      setVacancies([])
    }
    
    // Clear any existing sample data to start fresh
    localStorage.removeItem('vacancies')
  }, [])

  // Save vacancies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vacancies', JSON.stringify(vacancies))
  }, [vacancies])

  // Update vacancy statuses based on deadlines
  const updateVacancyStatuses = () => {
    const now = new Date()
    setVacancies(prev => 
      prev.map(vacancy => {
        const deadline = new Date(vacancy.deadline)
        if (deadline < now && vacancy.status === 'open') {
          return { ...vacancy, status: 'closed' as const }
        }
        return vacancy
      })
    )
  }

  // Check statuses every hour
  useEffect(() => {
    updateVacancyStatuses()
    const interval = setInterval(updateVacancyStatuses, 60 * 60 * 1000) // 1 hour
    return () => clearInterval(interval)
  }, [])

  const addVacancy = (vacancyData: Omit<Vacancy, 'id' | 'createdAt' | 'status' | 'applicants'>) => {
    const newVacancy: Vacancy = {
      ...vacancyData,
      id: `vacancy_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      applicants: 0
    }
    setVacancies(prev => [newVacancy, ...prev])
  }

  const updateVacancy = (id: string, updates: Partial<Vacancy>) => {
    setVacancies(prev => 
      prev.map(vacancy => 
        vacancy.id === id ? { ...vacancy, ...updates } : vacancy
      )
    )
  }

  const deleteVacancy = (id: string) => {
    setVacancies(prev => prev.filter(vacancy => vacancy.id !== id))
  }

  const closeVacancy = (id: string) => {
    updateVacancy(id, { status: 'closed' })
  }

  const reopenVacancy = (id: string) => {
    updateVacancy(id, { status: 'open' })
  }

  const getVacancyById = (id: string) => {
    return vacancies.find(vacancy => vacancy.id === id)
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
    addVacancy,
    updateVacancy,
    deleteVacancy,
    closeVacancy,
    reopenVacancy,
    getVacancyById,
    updateVacancyStatuses
  }

  return (
    <VacancyContext.Provider value={value}>
      {children}
    </VacancyContext.Provider>
  )
}
