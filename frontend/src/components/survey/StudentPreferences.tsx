'use client'

import { Survey, StudentPreference, Student, Constraint } from '@/src/lib/interfaces'
import { useState, useCallback, Fragment } from 'react'
import { useDropzone } from 'react-dropzone'
import { createStudentPreferences } from '@/src/utils/actions/create_student_preferences'
import { updateStudentTeams } from '@/src/utils/actions/update_student_teams'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { Dialog, Transition } from '@headlessui/react'


type MatchResult = { data: Record<string, number[]> | null, error: string | null }

interface StudentPreferencesProps {
    survey: Survey
    studentPreferences: StudentPreference[]
    setStudentPreferences: (preferences: StudentPreference[]) => void
    onUpdatePreference: (preferenceId: string, preferences: string[]) => Promise<void>
    onDeletePreference: (preferenceId: string) => Promise<void>
    matchStudentPreferences: (constraint: Constraint, preferences: StudentPreference[]) => Promise<MatchResult>
}

export default function StudentPreferences({ 
    survey, 
    studentPreferences,
    setStudentPreferences,
    onUpdatePreference,
    onDeletePreference,
    matchStudentPreferences
}: StudentPreferencesProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingValues, setEditingValues] = useState<StudentPreference | null>(null)
    const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false)
    const [constraint, setConstraint] = useState<Constraint>({
        max_num_teams: undefined,
        members_per_team: undefined,
        at_least_one_pair_sex: true,
        girl_geq_boy: true,
        boy_geq_girl: false,
        at_least_one_leader: false,
        unique_previous: 1,
        group_diff_coeff: 1.5
    })

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
            // console.log("newPreferences", newPreferences)
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

    const handleMatching = async () => {
        try {
            // survey_idを取得（student_preferencesから）
            const survey: Survey = studentPreferences[0]?.survey

            if (!survey) {
                throw new Error('Survey ID not found')
            }
            // console.log('Survey ID:', survey)  // {id: 60, name: 'アンケート_20250204_1204'}

            // console.log('Matching with constraints:', constraint)
            // console.log('Student preferences:', studentPreferences)

            // matching API call

            toast.success('マッチングの探索を開始しました！（数十秒かかることがあります）', {
                duration: 60000,
            })
            const result: MatchResult = await matchStudentPreferences(constraint, studentPreferences)
            // console.log('Matching result teams:', JSON.stringify(teams, null, 2))

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (!result.data) {
                toast.error('マッチングを見つけられませんでした')
                return
            }

            await updateStudentTeams(result.data, survey.id)

            toast.success('マッチングを見つけました')
            setIsMatchingModalOpen(false)
        } catch (error) {
            console.error('Matching error:', error)
            toast.error('マッチング探索中にエラーが発生しました')
        }
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
                        <p>アップロード中...(十数秒かかります)</p>
                    ) : isDragActive ? (
                        <p>ファイルをドロップしてください</p>
                    ) : (
                        <Fragment>
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <p>
                                    CSVファイルをドラッグ＆ドロップ、またはクリックして選択してください
                                </p>
                                <p className="flex items-center gap-1">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                                    <span>ヘッダー行を含めてください</span>
                                </p>
                                <p className="flex items-center gap-1">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                                    <span>正しく読み込めないときは名簿番号,現在の班,MI-A~H,チームの役割,苦手な生徒の名簿番号のみを含めてください</span>
                                </p>
                            </div>
                        </Fragment>
                    )}
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        )
    }

    return (
        <div className="mt-8 flow-root">
            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    onClick={() => setIsMatchingModalOpen(true)}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    マッチング条件設定
                </button>
            </div>

            <Transition.Root show={isMatchingModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setIsMatchingModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div>
                                        <div className="mt-3 sm:mt-5">
                                            <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                                                マッチング条件設定
                                            </Dialog.Title>
                                            <div className="mt-4 space-y-4">
                                                {/* <div>
                                                    <label htmlFor="max_num_teams" className="block text-sm font-medium text-gray-700">
                                                        チーム数
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="max_num_teams"
                                                        value={constraint.max_num_teams ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^[0-9]+$/.test(val)) {
                                                                setConstraint({ ...constraint, max_num_teams: val === '' ? 0 : parseInt(val) });
                                                            }
                                                        }}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="members_per_team" className="block text-sm font-medium text-gray-700">
                                                        チームあたりの最大人数
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="members_per_team"
                                                        value={constraint.members_per_team ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^[0-9]+$/.test(val)) {
                                                                setConstraint({ ...constraint, members_per_team: val === '' ? 0 : parseInt(val) });
                                                            }
                                                        }}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div> */}
                                                <div className="flex gap-6">
                                                    <div className="flex-1">
                                                        <label htmlFor="max_num_teams" className="block text-sm font-medium text-gray-700">
                                                        チーム数
                                                        </label>
                                                        <input
                                                        type="text"
                                                        id="max_num_teams"
                                                        value={constraint.max_num_teams ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^[0-9]+$/.test(val)) {
                                                                setConstraint({ ...constraint, max_num_teams: val === '' ? undefined : parseInt(val) });
                                                            }
                                                        }}
                                                        className="mt-1 block w-40 h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg px-4"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label htmlFor="members_per_team" className="block text-sm font-medium text-gray-700">
                                                        チームあたりの最大人数
                                                        </label>
                                                        <input
                                                        type="text"
                                                        id="members_per_team"
                                                        value={constraint.members_per_team ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^[0-9]+$/.test(val)) {
                                                                setConstraint({ ...constraint, members_per_team: val === '' ? undefined : parseInt(val) });
                                                            }
                                                        }}
                                                        className="mt-1 block w-40 h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg px-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="at_least_one_pair_sex"
                                                        checked={constraint.at_least_one_pair_sex}
                                                        onChange={(e) => setConstraint({ ...constraint, at_least_one_pair_sex: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="at_least_one_pair_sex" className="ml-2 block text-sm text-gray-700">
                                                        男女ペアを1組以上含む
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="girl_geq_boy"
                                                        checked={constraint.girl_geq_boy}
                                                        onChange={(e) => setConstraint({ ...constraint, girl_geq_boy: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="girl_geq_boy" className="ml-2 block text-sm text-gray-700">
                                                        女子が男子以上
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="boy_geq_girl"
                                                        checked={constraint.boy_geq_girl}
                                                        onChange={(e) => setConstraint({ ...constraint, boy_geq_girl: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="boy_geq_girl" className="ml-2 block text-sm text-gray-700">
                                                        男子が女子以上
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="at_least_one_leader"
                                                        checked={constraint.at_least_one_leader}
                                                        onChange={(e) => setConstraint({ ...constraint, at_least_one_leader: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="at_least_one_leader" className="ml-2 block text-sm text-gray-700">
                                                        リーダーを1人以上含む
                                                    </label>
                                                </div>
                                                <div>
                                                    <label htmlFor="unique_previous" className="block text-sm font-medium text-gray-700">
                                                        前回チームメンバーの重複制限（任意）
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="unique_previous"
                                                        value={constraint.unique_previous}
                                                        onChange={(e) => setConstraint({ ...constraint, unique_previous: e.target.value ? parseInt(e.target.value) : undefined })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="group_diff_coeff" className="block text-sm font-medium text-gray-700">
                                                        グループ差異係数（任意）
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        id="group_diff_coeff"
                                                        value={constraint.group_diff_coeff || ''}
                                                        onChange={(e) => setConstraint({ ...constraint, group_diff_coeff: e.target.value ? parseFloat(e.target.value) : undefined })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50 disabled:grayscale"
                                            onClick={handleMatching}
                                            disabled={constraint.max_num_teams === undefined || constraint.members_per_team === undefined}
                                        >
                                            マッチング
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                            onClick={() => setIsMatchingModalOpen(false)}
                                        >
                                            キャンセル
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-48">名簿番号</th>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    学生
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-48">
                                    前回チーム
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">A</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">B</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">C</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">D</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">F</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">G</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">H</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">視力</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">リーダー</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-96">苦手な学生（名簿番号をカンマ区切りで入力）</th>
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
                                                    type="text"
                                                    value={editingValues?.student.student_no || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            student: {
                                                                ...editingValues.student,
                                                                student_no: value === '' ? 0 : value
                                                            }
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                {preference.student.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="text"
                                                    value={editingValues?.previous_team ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            previous_team: value === '' ? 0 : value
                                                        });
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_a ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_a: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_b ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_b: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_c ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_c: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_d ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_d: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_e ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_e: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_f ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_f: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_g ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_g: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="8"
                                                    value={editingValues?.mi_h ?? ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEditingValues({
                                                            ...editingValues,
                                                            mi_h: value === '' ? 0 : value
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <select
                                                    value={editingValues?.eyesight || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            eyesight: Number(e.target.value)
                                                        } as StudentPreference);
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value={1}>どこでもいいよ</option>
                                                    <option value={3}>どちらかというと前</option>
                                                    <option value={8}>目が悪いので前</option>
                                                </select>
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
                                                    value={editingValues?.student_dislikes?.map(dislike => studentPreferences.find(p => p.student.id === dislike.student_id)?.student.student_no).join(', ') || ''}
                                                    onChange={(e) => {
                                                        if (!editingValues) return;
                                                        setEditingValues({
                                                            ...editingValues,
                                                            student_dislikes: e.target.value === '' ? [] : e.target.value.split(',').map(id => ({
                                                                student_id: parseInt(id) || 0,
                                                                updated_at: new Date().toISOString()
                                                            }))
                                                        } as StudentPreference);
                                                    }}
                                                    placeholder="例: 1, 2, 3"
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
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preference.previous_team || ''}</td>
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
                                            <td className="whitespace-wrap px-3 py-4 text-sm text-gray-500">
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