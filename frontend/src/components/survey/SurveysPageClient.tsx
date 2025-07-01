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
import { fetchMatchingResult } from '@/src/utils/actions/fetch_matching_results'
import { Constraint, Class, Survey, StudentPreference, MatchingResultWithTeams } from '@/src/lib/interfaces'
import StudentPreferences from './StudentPreferences'
import MatchingResultPanel from './MatchingResultPanel'
import DashboardHeader from '@/src/components/common/DashboardHeader'

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
    const [isLoadingResult, setIsLoadingResult] = useState(false)
    const [isLoadingSurveys, setIsLoadingSurveys] = useState(false)

    // Filter surveys that have team matching results
    const loadSurveysWithResults = async (allSurveys: Survey[]) => {
        setIsLoadingSurveys(true)
        try {
            const surveysWithMatchingResults: Survey[] = []
            
            // Check each survey for matching results
            await Promise.all(
                allSurveys.map(async (survey) => {
                    try {
                        const result = await fetchMatchingResult(survey.id.toString())
                        if (result.success && result.data?.matchingResult) {
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

    // Fetch saved matching result for this survey (latest)
    useEffect(() => {
        if (!selectedSurvey) {
            setSavedMatchingResult(null)
            return
        }
        setIsLoadingResult(true)
        fetchMatchingResult(selectedSurvey.id.toString())
            .then(res => {
                if (res.success && res.data?.matchingResult) {
                    setSavedMatchingResult(res.data.matchingResult)
                } else {
                    setSavedMatchingResult(null)
                }
            })
            .catch(() => setSavedMatchingResult(null))
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

    return (
        <div className="min-h-screen flex">
            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />
            
            {/* Main content area */}
            <div className="w-full max-w-[80%] mx-auto flex flex-col bg-white shadow-lg">
                <DashboardHeader subtitle="アンケート管理" />
                
                {/* コンテンツ横並びコンテナ */}
                <div className="flex flex-1">
                    
                    {/* Survey List - Left Panel */}
                    {showSurveyList && (
                        <div className="w-96 border-r border-gray-200 flex flex-col">
                            <div className="p-6 border-b border-gray-200">
                                <h1 className="text-2xl font-semibold text-gray-900">過去の班分け結果</h1>
                                <p className="mt-1 text-sm text-gray-600">班分けを実施したアンケートの結果を確認できます</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4">
                                {/* Survey List Content */}
                                <div className="space-y-4">

                                    {/* Survey List with Team Results */}
                                    {isLoadingSurveys ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                            <p className="text-gray-600">班分け結果を読み込み中...</p>
                                        </div>
                                    ) : surveysWithResults.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">班分け結果がありません</h3>
                                            <p className="text-gray-500">チャット画面で班分けを実施すると、ここに結果が表示されます。</p>
                                        </div>
                                    ) : (
                                        surveysWithResults.map((survey) => (
                                            <div
                                                key={survey.id}
                                                className={`p-4 rounded-lg border cursor-pointer transition-colors relative group ${
                                                    selectedSurvey?.id === survey.id
                                                        ? 'bg-blue-50 border-blue-500'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                                onClick={() => setSelectedSurvey(survey)}
                                            >
                                                <h3 className="font-medium">{survey.name}</h3>
                                                <p className="text-sm text-gray-500">クラス: {survey.class.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    班分け実施日: {survey.created_at ? new Date(survey.created_at).toLocaleDateString('ja-JP', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    }) : '日付なし'}
                                                </p>
                                                <div className="flex items-center mt-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span className="text-xs text-green-600 font-medium">班分け完了</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {selectedSurvey ? (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-semibold text-gray-900">{selectedSurvey.name}</h1>
                                            <p className="mt-1 text-sm text-gray-600">クラス: {selectedSurvey.class.name}</p>
                                        </div>
                                        {/* Mobile: Toggle survey list button */}
                                        <button
                                            onClick={() => setShowSurveyList(!showSurveyList)}
                                            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Matching result (always show) */}
                                {isLoadingResult ? (
                                    <div className="p-6 text-center text-gray-600">結果を読み込み中...</div>
                                ) : (
                                    <MatchingResultPanel matchingResult={savedMatchingResult} />
                                )}
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">班分け結果を選択してください</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        左側のリストから班分け結果を選択すると、詳細を確認できます。
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div> {/* /flex 横並びコンテナ */}
            </div>

            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />
        </div>
    )
}