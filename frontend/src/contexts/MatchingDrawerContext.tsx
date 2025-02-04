'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MatchingDrawerContextType {
    isDrawerOpen: boolean
    setIsDrawerOpen: (isOpen: boolean) => void
    toggleDrawer: () => void
}

const MatchingDrawerContext = createContext<MatchingDrawerContextType | undefined>(undefined)

export function MatchingDrawerProvider({ children }: { children: ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const toggleDrawer = () => {
        setIsDrawerOpen(prev => !prev)
    }

    return (
        <MatchingDrawerContext.Provider value={{ isDrawerOpen, setIsDrawerOpen, toggleDrawer }}>
            {children}
        </MatchingDrawerContext.Provider>
    )
}

export function useMatchingDrawer() {
    const context = useContext(MatchingDrawerContext)
    if (context === undefined) {
        throw new Error('useMatchingDrawer must be used within a MatchingDrawerProvider')
    }
    return context
}