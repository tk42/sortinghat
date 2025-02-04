'use client'

import { Survey, StudentPreference, InputStudentPreference, Student } from '@/src/lib/interfaces'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createStudentPreferences } from '@/src/utils/actions/create_student_preferences'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface StudentPreferencesProps {
    survey: Survey
    studentPreferences: StudentPreference[]
    setStudentPreferences: (preferences: StudentPreference[]) => void
    onUpdatePreference: (preferenceId: string, preferences: string[]) => Promise<void>
    onDeletePreference: (preferenceId: string) => Promise<void>
}

export default function StudentPreferences({ 
    survey, 
    studentPreferences,
    setStudentPreferences,
    onUpdatePreference,
    onDeletePreference
}: StudentPreferencesProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingValues, setEditingValues] = useState<StudentPreference | null>(null)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return

        const file = acceptedFiles[0]
        if (file.type !== 'text/csv') {
            setError('CSVファイルのみアップロード可能です')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('survey_id', survey.id.toString())

            const newPreferences = await createStudentPreferences(formData)
            console.log("newPreferences", newPreferences)
            if (newPreferences) {
                setStudentPreferences(newPreferences)
                toast.success('アンケートを正常にアップロードしました')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'アップロードに失敗しました'
            if (errorMessage.includes('foreign key constraint')) {
                toast.error('CSVファイルに含まれる学生IDが登録されていません。先に学生データを登録してください。')
            } else {
                toast.error(errorMessage)
            }
            setError(errorMessage)
        } finally {
            setIsUploading(false)
        }
    }, [survey, setStudentPreferences])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        disabled: studentPreferences.length > 0 || isUploading
    })

    const handleEdit = (preference: StudentPreference) => {
        setEditingId(preference.id.toString());
        setEditingValues(preference);
    };

    const handleSave = async (id: string) => {
        try {
            await onUpdatePreference(id, [JSON.stringify(editingValues)]);
            setEditingId(null);
            setEditingValues(null);
        } catch (err) {
            setError('更新に失敗しました');
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditingValues(null)
    }

    if (studentPreferences.length === 0) {
        return (
            <div className="p-4">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                    }`}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <p>アップロード中...</p>
                    ) : isDragActive ? (
                        <p>ファイルをドロップしてください</p>
                    ) : (
                        <p>CSVファイルをドラッグ＆ドロップ、またはクリックして選択してください</p>
                    )}
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        )
    }

    return (
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">学生番号</th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    学生
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    前回チーム
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-A</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-B</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-C</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-D</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-E</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-F</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-G</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MI-H</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">視力</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">リーダー</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">嫌いな学生</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studentPreferences.sort((a, b) => a.student.student_no - b.student.student_no).map((preference) => (
                                <tr key={preference.id} className={preference.student.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}>
                                    {editingId === preference.id.toString() ? (
                                        <>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    value={editingValues?.student.student_no || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            student: {
                                                                student_no: Number(e.target.value)
                                                            } as Student,
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                {preference.student.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="text"
                                                    value={editingValues?.team?.team_id || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const newTeam = e.target.value ? {
                                                            team_id: parseInt(e.target.value),
                                                            name: `Team ${e.target.value}`
                                                        } : undefined;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            team: newTeam
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_a || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_a: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_b || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_b: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_c || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_c: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_d || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_d: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_e || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_e: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_f || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_f: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_g || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_g: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.mi_h || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_h: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={editingValues?.eyesight || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            eyesight: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <select
                                                    value={editingValues?.leader || 1}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            leader: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value={1}>おまかせ</option>
                                                    <option value={3}>サブリーダー</option>
                                                    <option value={8}>リーダー</option>
                                                </select>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="text"
                                                    value={editingValues?.student_dislikes?.map(dislike => dislike.student_id).join(', ') || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const studentIds = e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                                                        setEditingValues({
                                                            ...editingValues,
                                                            student_dislikes: studentIds.map(id => ({
                                                                student_id: parseInt(id),
                                                                updated_at: new Date().toISOString()
                                                            }))
                                                        } as StudentPreference);
                                                    }}
                                                    placeholder="学生IDをカンマ区切りで入力"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleSave(preference.id.toString())}
                                                        className="rounded-full p-1 hover:bg-gray-100"
                                                        title="保存"
                                                    >
                                                        <CheckIcon className="h-5 w-5 text-green-600" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="rounded-full p-1 hover:bg-gray-100"
                                                        title="キャンセル"
                                                    >
                                                        <XMarkIcon className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.student?.student_no || ''}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.student?.name || ''}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.team?.name || ''}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_a}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_b}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_c}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_d}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_e}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_f}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_g}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.mi_h}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {(() => {
                                                    switch (preference.eyesight) {
                                                        case 8:
                                                            return "はい！！目のかんけいで…";
                                                        case 3:
                                                            return "あの、目のかんけいではないけど、できれば前がいいな…";
                                                        case 1:
                                                            return "いいえ、どこでもいいよ";
                                                        default:
                                                            return preference.eyesight;
                                                    }
                                                })()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {(() => {
                                                    switch (preference.leader) {
                                                        case 8:
                                                            return "リーダー";
                                                        case 3:
                                                            return "サブリーダー";
                                                        case 1:
                                                            return "おまかせ";
                                                        default:
                                                            return preference.leader;
                                                    }
                                                })()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {preference.student_dislikes?.map((dislike, index) => (
                                                    <span key={dislike.student_id}>
                                                        {index > 0 && ", "}
                                                        {studentPreferences.find(p => p.student.id === dislike.student_id)?.student.name || `学生ID: ${dislike.student_id}`}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(preference)}
                                                        className="rounded-full p-1 hover:bg-gray-100"
                                                        title="編集"
                                                    >
                                                        <PencilIcon className="h-5 w-5 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeletePreference(preference.id.toString())}
                                                        className="rounded-full p-1 hover:bg-gray-100"
                                                        title="削除"
                                                    >
                                                        <TrashIcon className="h-5 w-5 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}