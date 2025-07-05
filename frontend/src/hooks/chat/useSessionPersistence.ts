import { useState, useEffect, useCallback } from 'react'
import { Class, Survey } from '@/src/lib/types'

interface SessionState {
  selectedClass: Class | null
  selectedSurvey: Survey | null
  studentPreferences: any[]
  optimizationResult: any
  surveySetupComplete: boolean
}

const STORAGE_KEYS = {
  selectedClass: 'chat-selected-class',
  selectedSurvey: 'chat-selected-survey',
  studentPreferences: 'chat-student-preferences',
  optimizationResult: 'chat-optimization-result',
  surveySetupComplete: 'chat-survey-setup-complete',
} as const

export function useSessionPersistence() {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<SessionState>({
    selectedClass: null,
    selectedSurvey: null,
    studentPreferences: [],
    optimizationResult: null,
    surveySetupComplete: false,
  })

  // Initialize from sessionStorage after mount
  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return

    try {
      const savedClass = sessionStorage.getItem(STORAGE_KEYS.selectedClass)
      const savedSurvey = sessionStorage.getItem(STORAGE_KEYS.selectedSurvey)
      const savedPreferences = sessionStorage.getItem(STORAGE_KEYS.studentPreferences)
      const savedResult = sessionStorage.getItem(STORAGE_KEYS.optimizationResult)
      const savedSetupComplete = sessionStorage.getItem(STORAGE_KEYS.surveySetupComplete)

      setState({
        selectedClass: savedClass ? JSON.parse(savedClass) : null,
        selectedSurvey: savedSurvey ? JSON.parse(savedSurvey) : null,
        studentPreferences: savedPreferences ? JSON.parse(savedPreferences) : [],
        optimizationResult: savedResult ? JSON.parse(savedResult) : null,
        surveySetupComplete: savedSetupComplete === 'true',
      })
    } catch (error) {
      console.error('Failed to restore session state:', error)
    }
  }, [])

  // Persist state changes to sessionStorage
  const updateSelectedClass = useCallback((selectedClass: Class | null) => {
    setState(prev => ({ ...prev, selectedClass }))
    
    if (typeof window === 'undefined') return
    
    if (selectedClass) {
      sessionStorage.setItem(STORAGE_KEYS.selectedClass, JSON.stringify(selectedClass))
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.selectedClass)
    }
  }, [])

  const updateSelectedSurvey = useCallback((selectedSurvey: Survey | null) => {
    setState(prev => ({ ...prev, selectedSurvey }))
    
    if (typeof window === 'undefined') return
    
    if (selectedSurvey) {
      sessionStorage.setItem(STORAGE_KEYS.selectedSurvey, JSON.stringify(selectedSurvey))
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.selectedSurvey)
    }
  }, [])

  const updateStudentPreferences = useCallback((studentPreferences: any[]) => {
    setState(prev => ({ ...prev, studentPreferences }))
    
    if (typeof window === 'undefined') return
    
    if (studentPreferences.length > 0) {
      sessionStorage.setItem(STORAGE_KEYS.studentPreferences, JSON.stringify(studentPreferences))
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.studentPreferences)
    }
  }, [])

  const updateOptimizationResult = useCallback((optimizationResult: any) => {
    setState(prev => ({ ...prev, optimizationResult }))
    
    if (typeof window === 'undefined') return
    
    if (optimizationResult) {
      sessionStorage.setItem(STORAGE_KEYS.optimizationResult, JSON.stringify(optimizationResult))
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.optimizationResult)
    }
  }, [])

  const updateSurveySetupComplete = useCallback((surveySetupComplete: boolean) => {
    setState(prev => ({ ...prev, surveySetupComplete }))
    
    if (typeof window === 'undefined') return
    
    sessionStorage.setItem(STORAGE_KEYS.surveySetupComplete, surveySetupComplete.toString())
  }, [])

  const clearAllSession = useCallback(() => {
    setState({
      selectedClass: null,
      selectedSurvey: null,
      studentPreferences: [],
      optimizationResult: null,
      surveySetupComplete: false,
    })
    
    if (typeof window === 'undefined') return
    
    Object.values(STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key)
    })
    sessionStorage.removeItem('dashboard-scroll-position')
  }, [])

  return {
    mounted,
    ...state,
    updateSelectedClass,
    updateSelectedSurvey,
    updateStudentPreferences,
    updateOptimizationResult,
    updateSurveySetupComplete,
    clearAllSession,
  }
}