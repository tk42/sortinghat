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
import { createSurvey } from '@/src/utils/actions/create_survey'
import { deleteSurvey } from '@/src/utils/actions/delete_survey'
import { Constraint, Class, Survey, StudentPreference } from '@/src/lib/interfaces'
import SurveyList from './SurveyList'
import StudentPreferences from './StudentPreferences'
import { useDrawer } from '@/src/contexts/DrawerContext'

interface SurveysPageClientProps {
    initialSurveys: Survey[]
}

export default function SurveysPageClient({ initialSurveys }: SurveysPageClientProps) {
    const { state } = useAuthContext()
    const router = useRouter()
    const { isDrawerOpen, setIsDrawerOpen } = useDrawer()
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys)
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
    const [studentPreferences, setStudentPreferences] = useState<StudentPreference[]>([])
    const [classes, setClasses] = useState<Class[]>([])

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
        <div className="px-4 sm:px-6 lg:px-8">
            <SurveyList
                surveys={surveys}
                classes={classes}
                selectedSurvey={selectedSurvey}
                onSelectSurvey={(survey) => {
                    setSelectedSurvey(survey);
                    setIsDrawerOpen(false);  
                }}
                onCreateSurvey={handleCreateSurvey}
                onDeleteSurvey={handleDeleteSurvey}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            {selectedSurvey && (
                <StudentPreferences
                    survey={selectedSurvey}
                    studentPreferences={studentPreferences}
                    setStudentPreferences={setStudentPreferences}
                    onUpdatePreference={handleUpdatePreference}
                    onDeletePreference={handleDeletePreference}
                    matchStudentPreferences={handleMatching}
                />
            )}
        </div>
    )
}