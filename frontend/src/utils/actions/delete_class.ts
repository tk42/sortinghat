'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { Class } from '@/src/lib/interfaces'

// GraphQLクエリ
const DELETE_CLASS = `
  mutation DeleteClass($id: bigint!) {
    delete_classes_by_pk(id: $id) {
      id
      name
    }
  }
`

interface DeleteClassResponse {
  data: {
    delete_classes_by_pk: Class | null
  }
  errors?: Array<{ message: string }>
}

export async function deleteClass(id: string): Promise<Class> {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('バックエンドAPIが設定されていません')
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('認証されていません')
  }

  try {
    // セッションの検証
    await auth.verifySessionCookie(sessionCookie)

    const response = await axios.post<DeleteClassResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_CLASS,
        variables: { 
          id: parseInt(id)
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
      throw new Error(`クラスの削除に失敗しました: ${response.data.errors[0].message}`)
    }

    const deletedClass = response.data.data.delete_classes_by_pk
    if (!deletedClass) {
      throw new Error('クラスの削除に失敗しました')
    }

    return deletedClass
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('APIエラー:', {
        status: error.response?.status,
        data: error.response?.data,
      })
      throw new Error(`APIエラー: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`)
    }
    
    console.error('クラスの削除中にエラーが発生しました:', error)
    throw error instanceof Error 
      ? error
      : new Error('予期せぬエラーが発生しました')
  }
}