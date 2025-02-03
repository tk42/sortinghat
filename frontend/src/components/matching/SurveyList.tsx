import { Survey, Class } from '@/src/lib/interfaces'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast';

interface SurveyListProps {
    surveys: Survey[]
    classes: Class[]
    onCreateSurvey: (formData: FormData) => Promise<any>
    selectedSurvey: Survey | null
    onSelectSurvey: (survey: Survey) => void
    onDeleteSurvey: (surveyId: string) => Promise<void>
}

export default function SurveyList({ 
    surveys, 
    classes, 
    selectedSurvey, 
    onSelectSurvey, 
    onCreateSurvey,
    onDeleteSurvey 
}: SurveyListProps) {
    const router = useRouter()
    const [selectedClassId, setSelectedClassId] = useState('')

    const handleCreateSurvey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClassId) return

        const formData = new FormData()
        formData.append('classId', selectedClassId)

        try {
            const result = await onCreateSurvey(formData)
            if (result) {
                setSelectedClassId('')
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to create survey:', error)
        }
    }

    const handleDelete = async (surveyId: string) => {
        try {
            await onDeleteSurvey(surveyId)
            toast.success('アンケートを削除しました')
        } catch (error) {
            console.error('Failed to delete survey:', error)
        }
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">アンケート一覧</h2>
                <div className="space-y-4">
                    <form onSubmit={handleCreateSurvey}>
                        <div className="p-4 rounded-lg border border-gray-200 space-y-4">
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">クラスを選択してください</option>
                                {classes.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={!selectedClassId}
                            >
                                新規アンケート作成
                            </button>
                        </div>
                    </form>
                    {surveys.map((survey) => (
                        <div
                            key={survey.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors relative ${
                                selectedSurvey?.id === survey.id
                                    ? 'bg-blue-50 border-blue-500'
                                    : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <div onClick={() => onSelectSurvey(survey)}>
                                <h3 className="font-medium">{survey.name}</h3>
                                <p className="text-sm text-gray-500">
                                    クラス: {survey.class.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    作成日: {survey.created_at ? new Date(survey.created_at).toLocaleString() : '日付なし'}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(survey.id.toString())
                                }}
                                className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100"
                                title="削除"
                            >
                                <TrashIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}