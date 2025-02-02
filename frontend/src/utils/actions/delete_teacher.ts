'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'
import { Teacher } from '@/src/lib/interfaces'

// GraphQLクエリ
const DELETE_TEACHER = `
  mutation DeleteTeacher($id: bigint!) {
    delete_teachers_by_pk(id: $id) {
      id
      name
      email
      firebase_uid
    }
  }
`

interface DeleteTeacherResponse {
  data: {
    delete_teachers_by_pk: Teacher | null
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
        query: DELETE_TEACHER,
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
      console.error('教師の削除エラー:', response.data.errors)
      return { error: `教師の削除に失敗しました: ${response.data.errors[0].message}` }
    }

    const deletedTeacher = response.data.data.delete_teachers_by_pk
    if (!deletedTeacher) {
      console.error('教師の削除エラー: 教師が見つかりません')
      return { error: '指定された教師が見つかりませんでした' }
    }

    return { data: deletedTeacher }
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