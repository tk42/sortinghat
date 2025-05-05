'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/src/utils/firebase/authprovider'
import { fetchMatchingResult } from '@/src/utils/actions/fetch_matching_result'
import { fetchClasses } from '@/src/utils/actions/fetch_classes'
import { deleteMatchingResult } from '@/src/utils/actions/delete_matching_result'
import { Class, MatchingResult, MatchingResultWithTeams } from '@/src/lib/interfaces'
import MatchingList from './MatchingList'
import { useDrawer } from '@/src/contexts/DrawerContext'
import { MatchingOverview } from './MatchingOverview'

interface MatchingPageClientProps {
    initialMatchingResults: MatchingResultWithTeams[]
    initialClasses: Class[]
}

export default function MatchingPageClient({ initialMatchingResults, initialClasses }: MatchingPageClientProps) {
    const { state } = useAuthContext()
    const { isDrawerOpen, setIsDrawerOpen } = useDrawer()
    const [matchingResults, setMatchingResults] = useState<MatchingResultWithTeams[]>(initialMatchingResults)
    const [selectedMatching, setSelectedMatching] = useState<MatchingResult | null>(null)
    const [classes, setClasses] = useState<Class[]>(initialClasses)

    useEffect(() => {
        const loadTeacherData = async () => {
            try {
                if (state.user?.uid) {
                    const [teacherMatchingResults, teacherClasses] = await Promise.all([
                        fetchMatchingResult(state.user.uid),
                        fetchClasses(state.user.uid)
                    ])
                    setMatchingResults(teacherMatchingResults)
                    setClasses(teacherClasses)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
        }

        loadTeacherData()
    }, [state.user])

    async function handleDeleteMatching(matchingId: string) {
        try {
            await deleteMatchingResult(parseInt(matchingId))
            // Update local state after successful deletion
            setMatchingResults(prevResults => 
                prevResults.filter(matching => matching.id.toString() !== matchingId)
            )
            // Reset selected matching if it was the one that was deleted
            if (selectedMatching?.id.toString() === matchingId) {
                setSelectedMatching(null)
            }
        } catch (error) {
            console.error('Failed to delete matching:', error)
            // You might want to show an error notification to the user here
        }
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <MatchingList
                matchingResults={matchingResults}
                classes={classes}
                selectedMatching={selectedMatching}
                onSelectMatching={(matching) => {
                    setSelectedMatching(matching);
                    setIsDrawerOpen(false);  
                }}
                onDeleteMatching={handleDeleteMatching}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            {selectedMatching && (
                <MatchingOverview selectedMatching={selectedMatching} />
            )}
        </div>
    )
}
