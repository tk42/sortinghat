'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/src/utils/firebase/authprovider'
import { fetchSurveys } from '@/src/utils/actions/fetch_surveys'
import { fetchClasses } from '@/src/utils/actions/fetch_classes'
import { fetchStudentPreferences } from '@/src/utils/actions/fetch_student_preferences'
import { updateStudentPreference } from '@/src/utils/actions/update_student_preference'
import { deleteStudentPreference } from '@/src/utils/actions/delete_student_preference'
import { matchStudentPreferences } from '@/src/utils/actions/match_student_preferences'
import { fetchMatchingResult, fetchMatchingResults } from '@/src/utils/actions/fetch_matching_results'
import { Constraint, Class, Survey, StudentPreference, MatchingResultWithTeams } from '@/src/lib/interfaces'
import SurveyList from './SurveyList'
import SurveyResultsContent from './SurveyResultsContent'
import DashboardHeader from '@/src/components/Common/DashboardHeader'
import { ChevronRightIcon } from '@heroicons/react/24/solid'

interface SurveysPageClientProps {
    initialSurveys: Survey[]
    initialClasses: Class[]
}

export default function SurveysPageClient({ initialSurveys, initialClasses }: SurveysPageClientProps) {
    const { state } = useAuthContext()
    const router = useRouter()
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys)
    const [surveysWithResults, setSurveysWithResults] = useState<Survey[]>([]) // Only surveys with team results
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
    const [studentPreferences, setStudentPreferences] = useState<StudentPreference[]>([])
    const [classes, setClasses] = useState<Class[]>(initialClasses)
    const [showSurveyList, setShowSurveyList] = useState(true)
    const [savedMatchingResult, setSavedMatchingResult] = useState<MatchingResultWithTeams | null>(null)
    const [matchingResults, setMatchingResults] = useState<MatchingResultWithTeams[]>([])
    const [selectedMatchingResult, setSelectedMatchingResult] = useState<MatchingResultWithTeams | null>(null)
    const [isLoadingResult, setIsLoadingResult] = useState(false)
    const [isLoadingSurveys, setIsLoadingSurveys] = useState(false)
    // クラスフィルタ（"all" は全クラス）
    const [classFilter, setClassFilter] = useState<number | 'all'>('all')

    // Filter surveys that have team matching results
    const loadSurveysWithResults = async (allSurveys: Survey[]) => {
        setIsLoadingSurveys(true)
        try {
            const surveysWithMatchingResults: Survey[] = []
            
            // Check each survey for matching results
            await Promise.all(
                allSurveys.map(async (survey) => {
                    try {
                        const result = await fetchMatchingResults(survey.id.toString())
                        if (result.success && result.data?.matchingResults && result.data.matchingResults.length > 0) {
                            surveysWithMatchingResults.push(survey)
                        }
                    } catch (error) {
                        console.error(`Error checking results for survey ${survey.id}:`, error)
                    }
                })
            )
            
            setSurveysWithResults(surveysWithMatchingResults)
        } catch (error) {
            console.error('Failed to filter surveys with results:', error)
        } finally {
            setIsLoadingSurveys(false)
        }
    }

    useEffect(() => {
        const loadTeacherData = async () => {
            try {
                if (state.user?.uid) {
                    const [teacherSurveys, teacherClasses] = await Promise.all([
                        fetchSurveys(state.user.uid),
                        fetchClasses(state.user.uid)
                    ])
                    setSurveys(teacherSurveys)
                    setClasses(teacherClasses)
                    
                    // Filter surveys that have team results
                    await loadSurveysWithResults(teacherSurveys)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
        }

        loadTeacherData()
    }, [state.user, router])

    useEffect(() => {
        if (selectedSurvey) {
            const loadPreferences = async () => {
                try {
                    const preferences = await fetchStudentPreferences(String(selectedSurvey.id))
                    setStudentPreferences(preferences)
                } catch (error) {
                    console.error('Failed to fetch student preferences:', error)
                }
            }

            loadPreferences()
        }
    }, [selectedSurvey])

    // Fetch all matching results for this survey (history)
    useEffect(() => {
        if (!selectedSurvey) {
            setMatchingResults([])
            setSelectedMatchingResult(null)
            setSavedMatchingResult(null)
            return
        }
        setIsLoadingResult(true)
        fetchMatchingResults(selectedSurvey.id.toString())
            .then(res => {
                if (res.success && res.data?.matchingResults) {
                    setMatchingResults(res.data.matchingResults)
                    // Select the latest result by default
                    const latest = res.data.matchingResults[0]
                    setSelectedMatchingResult(latest)
                    setSavedMatchingResult(latest)
                } else {
                    setMatchingResults([])
                    setSelectedMatchingResult(null)
                    setSavedMatchingResult(null)
                }
            })
            .catch(() => {
                setMatchingResults([])
                setSelectedMatchingResult(null)
                setSavedMatchingResult(null)
            })
            .finally(() => setIsLoadingResult(false))
    }, [selectedSurvey])

    async function handleUpdatePreference(preferenceId: string, preferences: string[]) {
        const formData = new FormData()
        formData.append('id', preferenceId)
        formData.append('preferences', JSON.stringify(preferences))

        try {
            await updateStudentPreference(formData)
            if (selectedSurvey) {
                const preferences = await fetchStudentPreferences(String(selectedSurvey.id))
                setStudentPreferences(preferences)
            }
        } catch (error) {
            console.error('Failed to update preference:', error)
        }
    }

    async function handleDeletePreference(preferenceId: string) {
        const formData = new FormData()
        formData.append('id', preferenceId)

        try {
            await deleteStudentPreference(formData)
            if (selectedSurvey) {
                const preferences = await fetchStudentPreferences(String(selectedSurvey.id))
                setStudentPreferences(preferences)
            }
        } catch (error) {
            console.error('Failed to delete preference:', error)
        }
    }


    async function handleMatching(constraint: Constraint, preferences: StudentPreference[]) {
        return await matchStudentPreferences(constraint, preferences)
    }

    function handleSelectMatchingResult(matchingResult: MatchingResultWithTeams) {
        setSelectedMatchingResult(matchingResult)
        setSavedMatchingResult(matchingResult)
    }

    return (
        <div className="min-h-screen flex">
            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />
            
            {/* Main content area */}
            <div className="w-full max-w-[80%] mx-auto flex flex-col bg-white shadow-lg">
                <DashboardHeader subtitle="アンケート管理" />
                
                {/* コンテンツ横並びコンテナ */}
                <div className="flex flex-1 relative">
                    
                    {/* Survey List - Left Panel */}
                    {showSurveyList && (
                        <SurveyList
                            surveys={surveysWithResults}
                            classes={classes}
                            selectedSurvey={selectedSurvey}
                            classFilter={classFilter}
                            isLoadingSurveys={isLoadingSurveys}
                            matchingResults={matchingResults}
                            selectedMatchingResult={selectedMatchingResult}
                            isLoadingResult={isLoadingResult}
                            onSurveySelect={setSelectedSurvey}
                            onClassFilterChange={setClassFilter}
                            onSelectMatchingResult={handleSelectMatchingResult}
                            onToggleSurveyList={() => setShowSurveyList(false)}
                        />
                    )}

                    {/* Sidebar reopen button (visible when sidebar hidden) */}
                    {!showSurveyList && (
                        <button
                            onClick={() => setShowSurveyList(true)}
                            className="absolute top-4 left-0 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            aria-label="メニューを開く"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    )}
                    
                    {/* Main Content Area */}
                    <SurveyResultsContent
                        selectedSurvey={selectedSurvey}
                        savedMatchingResult={savedMatchingResult}
                        isLoadingResult={isLoadingResult}
                        showSurveyList={showSurveyList}
                        onToggleSurveyList={() => setShowSurveyList(!showSurveyList)}
                    />
                </div>
            </div>

            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />
        </div>
    )
}