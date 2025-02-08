"use client"

import { Survey, Class } from '@/src/lib/interfaces'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TrashIcon, DocumentDuplicateIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast';

export interface SurveyListProps {
    surveys?: Survey[]
    classes?: Class[]
    onCreateSurvey?: (formData: FormData) => Promise<any>
    selectedSurvey?: Survey | null
    onSelectSurvey?: (survey: Survey) => void
    onDeleteSurvey?: (surveyId: string) => Promise<void>
    onDuplicateSurvey?: (surveyId: string) => Promise<void>
    isOpen: boolean
    onClose: () => void
}

export default function SurveyList({ 
    surveys = [], 
    classes = [], 
    selectedSurvey = null, 
    onSelectSurvey = () => {}, 
    onCreateSurvey = async () => {},
    onDeleteSurvey = async () => {},
    onDuplicateSurvey = async () => {},
    isOpen,
    onClose
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

    const handleDuplicate = async (surveyId: string) => {
        try {
            await onDuplicateSurvey(surveyId)
            toast.success('アンケートを複製しました')
        } catch (error) {
            console.error('Failed to duplicate survey:', error)
            toast.error('アンケートの複製に失敗しました')
        }
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-20"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-96 bg-white shadow-xl transition-transform duration-300 ease-in-out z-30`}>
                <div className="h-full overflow-y-auto">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">アンケート一覧</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
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
                                        className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                            !selectedClassId 
                                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                : 'bg-blue-500 hover:bg-blue-700 text-white'
                                        }`}
                                        disabled={!selectedClassId}
                                        aria-disabled={!selectedClassId}
                                        title={!selectedClassId ? 'クラスを選択してください' : 'アンケートを新規作成'}
                                    >
                                        新規アンケート作成
                                    </button>
                                </div>
                            </form>
                            {surveys.map((survey) => (
                                <div
                                    key={survey.id}
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors relative group ${
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
                                            作成日: {survey.created_at ? new Date(survey.created_at).toLocaleDateString('ja-JP', {
                                                                                year: 'numeric',
                                                                                month: '2-digit',
                                                                                day: '2-digit'
                                                                            }) : '日付なし'}
                                        </p>
                                    </div>
                                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDuplicate(survey.id.toString())
                                            }}
                                            className="rounded-full p-1 hover:bg-gray-100"
                                            title="複製"
                                        >
                                            <DocumentDuplicateIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(survey.id.toString())
                                            }}
                                            className="rounded-full p-1 hover:bg-gray-100"
                                            title="削除"
                                        >
                                            <TrashIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}