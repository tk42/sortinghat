'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Class, Student } from '@/src/lib/interfaces'
import ClassList from '@/src/components/dashboard/ClassList'
import StudentList from '@/src/components/dashboard/StudentList'
import { useAuthContext } from '@/src/utils/firebase/authprovider'
import { createClass } from '@/src/utils/actions/create_class'
import { createStudent } from '@/src/utils/actions/create_student'
import { updateStudent } from '@/src/utils/actions/update_student'
import { deleteStudent } from '@/src/utils/actions/delete_student'
import { fetchStudents } from '@/src/utils/actions/fetch_students'

// interface Class {
//   id: string
//   name: string
//   created_at: string
// }


// interface Student {
//   id: string
//   student_no: number
//   name: string
//   sex: number
//   memo: string | null
//   class_id: string
//   created_at: string
//   updated_at: string
// }

// function SubmitButton() {
//   const { pending } = useFormStatus()
//   return (
//     <button
//       type="submit"
//       disabled={pending}
//       className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
//     >
//       {pending ? '作成中...' : '新規クラスを作成'}
//     </button>
//   )
// }


interface ClassroomClientProps {
  initialClasses: Class[]
}

export default function ClassroomClient({ initialClasses }: ClassroomClientProps) {
  const { state } = useAuthContext()
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    if (selectedClassId) {
      loadStudents()
    } else {
      setStudents([])
    }
  }, [selectedClassId])

  async function loadStudents() {
    if (selectedClassId) {
      try {
        const fetchedStudents = await fetchStudents(selectedClassId)
        setStudents(fetchedStudents)
      } catch (error) {
        console.error('Error in loadStudents:', error)
        setStudents([])
      }
    }
  }

  async function handleCreateStudent(formData: FormData) {
    try {
      const student = await createStudent(formData)
      if (student) {
        setStudents([...students, student])
        router.refresh() // ページ全体を更新
      }
      return student
    } catch (error) {
      console.error('Error creating student:', error)
      return null
    }
  }

  async function handleUpdateStudent(formData: FormData) {
    try {
      const result = await updateStudent(formData)
      if (result.error) {
        console.error('Error updating student:', result.error)
        return null
      }
      
      if (result.data) {
        // データベースから最新のデータを取得
        await loadStudents()
        
        return result.data
      }
      
      return null
    } catch (error) {
      console.error('Error updating student:', error)
      return null
    }
  }

  async function handleDeleteStudent(formData: FormData) {
    try {
      const result = await deleteStudent(formData)
      if (result.error) {
        console.error('Error deleting student:', result.error)
        return false
      }
      router.refresh()
      return true
    } catch (error) {
      console.error('Error deleting student:', error)
      return false
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4">
          <div className="sm:flex sm:items-center">
            {/* 既存のクラス一覧のヘッダー部分 */}
          </div>
          <ClassList
            classes={initialClasses || []}
            selectedClassId={selectedClassId}
            onSelectClass={(classId) => {
              setSelectedClassId(classId)
              router.refresh() // クラス選択時にページを更新
            }}
            onCreateClass={async (formData: FormData) => {
              if (!state.teacher?.id) {
                console.error('Teacher information is not available');
                return null;
              }

              try {
                formData.append('teacherId', state.teacher.id.toString())
                formData.append('teacherCreatedAt', state.teacher.created_at)
                
                const result = await createClass(formData)
                
                if (result.error) {
                  console.error('Error returned from createClass:', result.error);
                  return null;
                }

                router.refresh()
                return result.data;
              } catch (error) {
                console.error('Error creating class:', error)
                return null;
              }
            }}
          />
        </div>
        <div className="col-span-8">
          {selectedClassId && (
            <StudentList
              classId={selectedClassId}
              initialStudents={students}
              onCreateStudent={handleCreateStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
        </div>
      </div>
    </div>
  )
}