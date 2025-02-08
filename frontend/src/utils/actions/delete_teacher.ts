'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'
import { Teacher } from '@/src/lib/interfaces'

// GraphQLクエリ
const DELETE_TEACHER_CASCADE = `
  mutation DeleteTeacherCascade($teacherId: bigint!) {
    # 1. Delete all teams first (because it references student_preferences)
    delete_teams(where: {
      matching_result: {
        survey: {
          class: {
            teacher_id: { _eq: $teacherId }
          }
        }
      }
    }) {
      affected_rows
    }
    
    # 2. Delete all matching results
    delete_matching_results(where: {
      survey: {
        class: {
          teacher_id: { _eq: $teacherId }
        }
      }
    }) {
      affected_rows
    }

    # 3. Now safe to delete student preferences and dislikes
    delete_student_dislikes(where: {
      student: {
        class: {
          teacher_id: { _eq: $teacherId }
        }
      }
    }) {
      affected_rows
    }
    delete_student_preferences(where: {
      student: {
        class: {
          teacher_id: { _eq: $teacherId }
        }
      }
    }) {
      affected_rows
    }
    
    # 4. Delete all surveys
    delete_surveys(where: {
      class: {
        teacher_id: { _eq: $teacherId }
      }
    }) {
      affected_rows
    }
    
    # 5. Delete all students
    delete_students(where: {
      class: {
        teacher_id: { _eq: $teacherId }
      }
    }) {
      affected_rows
    }
    
    # 6. Delete all classes
    delete_classes(where: {
      teacher_id: { _eq: $teacherId }
    }) {
      affected_rows
    }
    
    # 7. Finally delete the teacher
    delete_teachers_by_pk(id: $teacherId) {
      id
      name
      email
      firebase_uid
    }
  }
`

interface DeleteTeacherResponse {
  data: {
    delete_teachers_by_pk: Teacher | undefined
  }
  errors?: Array<{ message: string }>
}

// バリデーションスキーマ
const DeleteTeacherSchema = z.object({
  id: z.string().min(1, '教師IDは必須です'),
})

export async function deleteTeacher(formData: FormData): Promise<{ data?: Teacher; error?: string }> {
  if (!process.env.BACKEND_GQL_API) {
    return { error: 'バックエンドAPIが設定されていません' }
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    return { error: '認証されていません' }
  }

  try {
    // フォームデータのバリデーション
    const validatedData = DeleteTeacherSchema.parse({
      id: formData.get('id'),
    })

    // セッションの検証
    await auth.verifySessionCookie(sessionCookie)

    const response = await axios.post<DeleteTeacherResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_TEACHER_CASCADE,
        variables: { teacherId: parseInt(validatedData.id) },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    )

    if (response.data.errors) {
      const errorMessage = response.data.errors.map(e => e.message).join('\n')
      return { error: `教師の削除中にエラーが発生しました: ${errorMessage}` }
    }

    return { data: response.data.data.delete_teachers_by_pk }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    if (axios.isAxiosError(error)) {
      console.error('APIエラー:', {
        status: error.response?.status,
        data: error.response?.data,
      })
      return { error: `APIエラー: ${error.response?.status} - ${JSON.stringify(error.response?.data)}` }
    }
    
    console.error('教師の削除中にエラーが発生しました:', error)
    return { error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' }
  }
}