'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'
import { Student } from '@/src/lib/interfaces'

// GraphQLクエリ
const DELETE_STUDENT = `
  mutation DeleteStudent($id: bigint!) {
    delete_students_by_pk(id: $id) {
      id
      name
      student_no
      sex
      memo
    }
  }
`

interface DeleteStudentResponse {
  data: {
    delete_students_by_pk: Student | null
  }
  errors?: Array<{ message: string }>
}

// バリデーションスキーマ
const DeleteStudentSchema = z.object({
  id: z.string().min(1, '生徒IDは必須です'),
})

export async function deleteStudent(formData: FormData): Promise<{ data?: Student; error?: string }> {
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
    const validatedData = DeleteStudentSchema.parse({
      id: formData.get('id'),
    })

    // セッションの検証
    await auth.verifySessionCookie(sessionCookie)

    const response = await axios.post<DeleteStudentResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_STUDENT,
        variables: { 
          id: parseInt(validatedData.id)
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    )

    if (response.data.errors) {
      return { error: `生徒の削除に失敗しました: ${response.data.errors[0].message}` }
    }

    const deletedStudent = response.data.data.delete_students_by_pk
    if (!deletedStudent) {
      return { error: '生徒の削除に失敗しました' }
    }

    return { data: deletedStudent }
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
    
    console.error('生徒の削除中にエラーが発生しました:', error)
    return { error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' }
  }
}