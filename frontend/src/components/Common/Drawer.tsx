"use client"

import { useDrawer } from '@/src/contexts/DrawerContext'
import MatchingList, { MatchingListProps } from '../matching/MatchingList'
import SurveyList, { SurveyListProps } from '../survey/SurveyList'

type DrawerProps = {
    matchingProps?: MatchingListProps
    surveyProps?: SurveyListProps
}

export default function Drawer({ matchingProps, surveyProps }: DrawerProps) {
    const { isDrawerOpen, drawerType, setIsDrawerOpen } = useDrawer()
    
    const onClose = () => {
        setIsDrawerOpen(false)
    }

    const renderDrawerContent = () => {
        switch (drawerType) {
            case 'matching':
                return <MatchingList isOpen={isDrawerOpen} onClose={onClose} {...matchingProps} />
            case 'survey':
                return <SurveyList isOpen={isDrawerOpen} onClose={onClose} {...surveyProps} />
            default:
                return null
        }
    }

    return (
        <>
            {/* Overlay */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-20"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} w-96 bg-white shadow-xl transition-transform duration-300 ease-in-out z-30`}>
                {renderDrawerContent()}
            </div>
        </>
    )
}