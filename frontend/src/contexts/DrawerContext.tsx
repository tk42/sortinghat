"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

type DrawerType = 'matching' | 'survey' | 'chat'

interface DrawerContextType {
    isDrawerOpen: boolean
    drawerType: DrawerType | null
    setIsDrawerOpen: (isOpen: boolean) => void
    setDrawerType: (type: DrawerType | null) => void
    toggleDrawer: (type: DrawerType) => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

export function DrawerProvider({ children }: { children: ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [drawerType, setDrawerType] = useState<DrawerType | null>(null)

    const toggleDrawer = (type: DrawerType) => {
        if (drawerType === type && isDrawerOpen) {
            setIsDrawerOpen(false)
            setDrawerType(null)
        } else {
            setDrawerType(type)
            setIsDrawerOpen(true)
        }
    }

    return (
        <DrawerContext.Provider value={{ 
            isDrawerOpen, 
            drawerType,
            setIsDrawerOpen, 
            setDrawerType,
            toggleDrawer 
        }}>
            {children}
        </DrawerContext.Provider>
    )
}

export function useDrawer() {
    const context = useContext(DrawerContext)
    if (context === undefined) {
        throw new Error('useDrawer must be used within a DrawerProvider')
    }
    return context
}