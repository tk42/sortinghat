'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import DeleteClassButton from '@/src/components/dashboard/DeleteClassButton'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { updateClass } from '@/src/utils/actions/update_class'
import { Class } from '@/src/lib/interfaces'
import { toast } from 'react-hot-toast'

// interface Class {
//   id: string
//   name: string
//   created_at: string
// }

interface ClassListProps {
  classes: Class[]
  selectedClassId: string | null
  onSelectClass: (classId: string) => void
  onCreateClass: (formData: FormData) => Promise<Class | null>
}

export default function ClassList({ 
  classes = [], 
  selectedClassId, 
  onSelectClass,
  onCreateClass
}: ClassListProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState<string>('')
  const [newClass, setNewClass] = useState({
    name: ''
  })

  const handleEdit = (classItem: Class) => {
    setEditingId(classItem.id.toString())
    setEditedName(classItem.name)
  }

  const handleSave = async (id: string) => {
    const toastId = toast.loading("追加中...")
    try {
      await updateClass(id, editedName)
      setEditingId(null)
      router.refresh()
      toast.success("追加しました", { id: toastId })
    } catch (error) {
      console.error('Error updating class:', error)
      toast.error("追加に失敗しました", { id: toastId })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedName('')
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClass.name.trim()) return

    const formData = new FormData()
    formData.append('name', newClass.name)

    const createdClass = await onCreateClass(formData)
    if (createdClass) {
      setNewClass({ name: '' })
      router.refresh()
    }
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  クラス名
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900" style={{ minWidth: '120px' }}>
                  作成日時
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">アクション</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            <tr className="border-t border-gray-200">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0" style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="クラス名を入力"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" style={{ minWidth: '120px' }}>
                  -
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  <button
                    onClick={handleCreateClass}
                    disabled={!newClass.name.trim()}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                  >
                    追加
                  </button>
                </td>
              </tr>
              {classes.map((classItem) => (
                <tr 
                  key={classItem.id}
                  onClick={() => onSelectClass(classItem.id.toString())}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedClassId === classItem.id.toString() ? 'bg-indigo-50' : ''
                  }`}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0" style={{ minWidth: '200px' }}>
                    {editingId === classItem.id.toString() ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSave(classItem.id.toString())
                          } else if (e.key === 'Escape') {
                            handleCancel()
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      classItem.name
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" style={{ minWidth: '120px' }}>
                    {new Date(classItem.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\//g, '/')}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <div className="flex gap-2 justify-end">
                      {editingId === classItem.id.toString() ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSave(classItem.id.toString())}
                            className="rounded-full p-1 hover:bg-gray-100"
                            title="保存"
                          >
                            <CheckIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-full p-1 hover:bg-gray-100"
                            title="キャンセル"
                          >
                            <XMarkIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(classItem)}
                            className="rounded-full p-1 hover:bg-gray-100"
                            title="編集"
                          >
                            <PencilIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                          </button>
                          <DeleteClassButton classId={classItem.id.toString()} onSuccess={() => router.refresh()}>
                            <button
                              type="button"
                              className="rounded-full p-1 hover:bg-gray-100"
                              title="削除"
                            >
                              <TrashIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                            </button>
                          </DeleteClassButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}