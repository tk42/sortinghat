'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'

// GraphQLクエリ
const UPDATE_CLASS = `
  mutation UpdateClass($id: bigint!, $name: String!) {
    update_classes_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name }
    ) {
      id
      name
    }
  }
`

// 型定義
interface Class {
  id: number
  name: string
}

interface UpdateClassResponse {
  data: {
    update_classes_by_pk: Class | null
  }
  errors?: Array<{ message: string }>
}

export async function updateClass(id: string, name: string): Promise<Class> {
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

    const response = await axios.post<UpdateClassResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: UPDATE_CLASS,
        variables: { 
          id: parseInt(id),
          name
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
      throw new Error(`クラスの更新に失敗しました: ${response.data.errors[0].message}`)
    }

    const updatedClass = response.data.data.update_classes_by_pk
    if (!updatedClass) {
      throw new Error('クラスの更新に失敗しました')
    }

    return updatedClass
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('APIエラー:', {
        status: error.response?.status,
        data: error.response?.data,
      })
      throw new Error(`APIエラー: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`)
    }
    
    console.error('クラスの更新中にエラーが発生しました:', error)
    throw error instanceof Error 
      ? error
      : new Error('予期せぬエラーが発生しました')
  }
}