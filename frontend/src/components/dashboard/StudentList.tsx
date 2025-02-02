'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Student {
  id: string
  student_no: number
  name: string
  sex: number
  memo: string | null
  class_id: string
  created_at: string
  updated_at: string
}

interface StudentListProps {
  classId: string
  initialStudents: Student[]
  onCreateStudent: (formData: FormData) => Promise<Student | null>
  onUpdateStudent: (formData: FormData) => Promise<Student | null>
  onDeleteStudent: (formData: FormData) => Promise<boolean>
}

export default function StudentList({ 
  classId, 
  initialStudents = [], 
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentListProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)

  // initialStudents が変更されたら state を更新
  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedStudentNo, setEditedStudentNo] = useState<number>(0)
  const [editedName, setEditedName] = useState<string>('')
  const [editedSex, setEditedSex] = useState<number>(0)
  const [editedMemo, setEditedMemo] = useState<string>('')
  const [newStudent, setNewStudent] = useState({
    student_no: 0,
    name: '',
    sex: 0,
    memo: ''
  })

  const getSexLabel = (sex: number): string => {
    return sex === 1 ? '男性' : '女性'
  }

  // バリデーション用の関数を追加
  const isValidStudentData = (studentNo: number, name: string, sex: number) => {
    return studentNo > 0 && name.trim() !== '' && (sex === 1 || sex === 2);
  };

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('student_no', newStudent.student_no.toString())
    formData.append('name', newStudent.name)
    formData.append('sex', newStudent.sex.toString())
    formData.append('memo', newStudent.memo)
    formData.append('classId', classId)

    const createdStudent = await onCreateStudent(formData)
    if (createdStudent) {
      setStudents([...students, createdStudent])
      setNewStudent({
        student_no: 0,
        name: '',
        sex: 0,
        memo: ''
      })
    }
  }

  const handleEdit = (student: Student) => {
    setEditingId(student.id)
    setEditedStudentNo(student.student_no)
    setEditedName(student.name)
    setEditedSex(student.sex || 1)
    setEditedMemo(student.memo || '')
  }

  const handleSave = async (id: string) => {
    // バリデーションチェック
    if (!isValidStudentData(editedStudentNo, editedName, editedSex)) {
      return;
    }

    try {
      const formData = new FormData()
      formData.append('id', id)
      formData.append('student_no', editedStudentNo.toString())
      formData.append('name', editedName)
      formData.append('sex', editedSex.toString())
      formData.append('memo', editedMemo)

      const updatedStudent = await onUpdateStudent(formData)
      if (updatedStudent) {
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === id ? updatedStudent : student
          )
        )
        
        setEditingId(null)
        setEditedStudentNo(0)
        setEditedName('')
        setEditedSex(1)
        setEditedMemo('')
        
        // 成功メッセージを表示（必要に応じてUIに追加）
        // alert('生徒情報を更新しました')
      } else {
        // 更新が失敗した場合
        // alert('生徒情報の更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('生徒情報の更新中にエラーが発生しました')
    }
  }

  const handleDelete = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)

    const success = await onDeleteStudent(formData)
    if (success) {
      setStudents(students.filter(student => student.id !== id))
    }
  }

  return (
    <div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    生徒番号
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    名前
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    性別
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    メモ
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">編集</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...students].sort((a, b) => a.student_no - b.student_no).map((student) => (
                  <tr key={student.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={editedStudentNo.toString()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                              setEditedStudentNo(value ? parseInt(value) : 0);
                            }
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        student.student_no
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {editingId === student.id ? (
                        <select
                          value={editedSex}
                          onChange={(e) => setEditedSex(parseInt(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">選択してください</option>
                          <option value="1">男性</option>
                          <option value="2">女性</option>
                        </select>
                      ) : (
                        getSexLabel(student.sex)
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editedMemo}
                          onChange={(e) => setEditedMemo(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        student.memo
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      {editingId === student.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSave(student.id)}
                            disabled={!isValidStudentData(editedStudentNo, editedName, editedSex)}
                            className={`${
                              isValidStudentData(editedStudentNo, editedName, editedSex)
                                ? 'rounded-full p-1 hover:bg-gray-100'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title="保存"
                          >
                            <CheckIcon className="h-5 w-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditedStudentNo(0)
                              setEditedName('')
                              setEditedSex(0)
                              setEditedMemo('')
                            }}
                            className="rounded-full p-1 hover:bg-gray-100"
                            title="キャンセル"
                          >
                            <XMarkIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(student)}
                            className="rounded-full p-1 hover:bg-gray-100"
                            title="編集"
                          >
                            <PencilIcon className="h-5 w-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="rounded-full p-1 hover:bg-gray-100"
                            title="削除"
                          >
                            <TrashIcon className="h-5 w-5 text-red-600" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {/* 新規追加用の入力行 */}
                <tr className="border-t border-gray-200">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                    <input
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={newStudent.student_no || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setNewStudent({ ...newStudent, student_no: value ? parseInt(value) : 0 });
                        }
                      }}
                      placeholder="生徒番号を入力"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="名前を入力"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <select
                      value={newStudent.sex}
                      onChange={(e) => setNewStudent({ ...newStudent, sex: parseInt(e.target.value) })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value={0}>-</option>
                      <option value={1}>男性</option>
                      <option value={2}>女性</option>
                    </select>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <input
                      type="text"
                      value={newStudent.memo}
                      onChange={(e) => setNewStudent({ ...newStudent, memo: e.target.value })}
                      placeholder="メモを入力"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <button
                      onClick={handleCreateStudent}
                      disabled={!newStudent.student_no || !newStudent.name || !newStudent.sex}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                      追加
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}