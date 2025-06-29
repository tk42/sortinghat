'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/src/utils/firebase/authprovider'
import { fetchSurveys } from '@/src/utils/actions/fetch_surveys'
import { fetchClasses } from '@/src/utils/actions/fetch_classes'
import { fetchStudentPreferences } from '@/src/utils/actions/fetch_student_preferences'
import { updateStudentPreference } from '@/src/utils/actions/update_student_preference'
import { duplicateSurvey } from '@/src/utils/actions/duplicate_survey'
import { deleteStudentPreference } from '@/src/utils/actions/delete_student_preference'
import { matchStudentPreferences } from '@/src/utils/actions/match_student_preferences'
import { createSurvey } from '@/src/utils/actions/create_survey'
import { deleteSurvey } from '@/src/utils/actions/delete_survey'
import { Constraint, Class, Survey, StudentPreference } from '@/src/lib/interfaces'
// import SurveyList from './SurveyList' // Removed - now inline
import StudentPreferences from './StudentPreferences'
import UserAvatarButton from '@/src/components/navigation/UserAvatarButton'
// import { useDrawer } from '@/src/contexts/DrawerContext' // Removed with sidebar

interface SurveysPageClientProps {
    initialSurveys: Survey[]
    initialClasses: Class[]
}

export default function SurveysPageClient({ initialSurveys, initialClasses }: SurveysPageClientProps) {
    const { state } = useAuthContext()
    const router = useRouter()
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys)
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
    const [studentPreferences, setStudentPreferences] = useState<StudentPreference[]>([])
    const [classes, setClasses] = useState<Class[]>(initialClasses)
    const [showSurveyList, setShowSurveyList] = useState(true)

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

    async function handleCreateSurvey(formData: FormData) {
        try {
            const result = await createSurvey(formData)
            if (result.error) {
                console.error('Failed to create survey:', result.error)
                return null
            }
            if (result.data && state.user?.uid) {
                // アンケート作成後に surveys を再取得
                const updatedSurveys = await fetchSurveys(state.user.uid)
                setSurveys(updatedSurveys)
                return result.data
            }
            return null
        } catch (error) {
            console.error('Failed to create survey:', error)
            return null
        }
    }

    async function handleDuplicateSurvey(surveyId: string) {
        try {
            await duplicateSurvey(surveyId)
            if (state.user?.uid) {
                // アンケート複製後に surveys を再取得
                const updatedSurveys = await fetchSurveys(state.user.uid)
                setSurveys(updatedSurveys)
            }
        } catch (error) {
            console.error('Failed to duplicate survey:', error)
        }
    }

    async function handleDeleteSurvey(surveyId: string) {
        try {
            await deleteSurvey(surveyId)
            if (state.user?.uid) {
                // アンケート削除後に surveys を再取得
                const updatedSurveys = await fetchSurveys(state.user.uid)
                setSurveys(updatedSurveys)
                // 削除したアンケートが選択中だった場合、選択を解除
                if (selectedSurvey?.id.toString() === surveyId) {
                    setSelectedSurvey(null)
                    setStudentPreferences([])
                }
            }
        } catch (error) {
            console.error('Failed to delete survey:', error)
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
            <div className="w-full max-w-[80%] mx-auto flex bg-white shadow-lg">
                {/* Survey List - Left Panel */}
                {showSurveyList && (
                    <div className="w-96 border-r border-gray-200 flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <h1 className="text-2xl font-semibold text-gray-900">過去のアンケート結果</h1>
                            <p className="mt-1 text-sm text-gray-600">クラスを選択してアンケート結果を確認できます</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Survey List Content */}
                            <div className="space-y-4">
                                {/* Create Survey Form */}
                                <div className="p-4 rounded-lg border border-gray-200 space-y-4">
                                    <form onSubmit={async (e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.currentTarget)
                                        const classId = formData.get('classId') as string
                                        if (!classId) return
                                        
                                        const formDataWithClass = new FormData()
                                        formDataWithClass.append('classId', classId)
                                        await handleCreateSurvey(formDataWithClass)
                                        e.currentTarget.reset()
                                    }}>
                                        <select
                                            name="classId"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">クラスを選択してください</option>
                                            {classes.map((classItem) => (
                                                <option key={classItem.id} value={classItem.id}>
                                                    {classItem.name}
                                                </option>
                                            ))}
                                        </select>
                                    </form>
                                </div>

                                {/* Survey List */}
                                {surveys.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">アンケートがありません</h3>
                                        <p className="text-gray-500">クラスを選択して新しいアンケートを作成してください。</p>
                                    </div>
                                ) : (
                                    surveys.map((survey) => (
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
                                                作成日: {survey.created_at ? new Date(survey.created_at).toLocaleDateString('ja-JP', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                }) : '日付なし'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
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
                            
                            {/* Student Preferences */}
                            <div className="flex-1 overflow-y-auto">
                                <StudentPreferences
                                    survey={selectedSurvey}
                                    studentPreferences={studentPreferences}
                                    setStudentPreferences={setStudentPreferences}
                                    onUpdatePreference={handleUpdatePreference}
                                    onDeletePreference={handleDeletePreference}
                                    matchStudentPreferences={handleMatching}
                                />
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">アンケートを選択してください</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    左側のリストからアンケートを選択すると、過去の結果を確認できます。
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Side margins for consistency with ChatWindow */}
            <div className="hidden lg:block flex-1 max-w-xs" />

            {/* User Avatar Button */}
            <UserAvatarButton />
        </div>
    )
}