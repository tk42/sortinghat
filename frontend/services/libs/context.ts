import { createContext } from 'react'
import { Teacher } from 'services/types/interfaces'

export const TeacherContext = createContext<Teacher | undefined>(undefined)
export const TeacherProvider = TeacherContext.Provider
