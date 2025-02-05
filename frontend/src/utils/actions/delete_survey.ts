'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { Survey } from '@/src/lib/interfaces'

// GraphQLクエリ
const DELETE_SURVEY = `
  mutation DeleteSurvey($id: bigint!) {
    # 最初に student_dislikes を削除
    delete_student_dislikes(where: {
      _and: [
        { student_preference: { survey_id: { _eq: $id } } }
      ]
    }) {
      affected_rows
    }
    # 次に student_preferences を削除
    delete_student_preferences(where: {survey_id: {_eq: $id}}) {
      affected_rows
    }
    # 関連する teams を削除
    delete_teams(where: {matching_result: {survey: {id: {_eq: $id}}}}) {
      affected_rows
    }
    # 最後にアンケートを削除
    delete_surveys_by_pk(id: $id) {
      id
      name
    }
  }
`

interface DeleteSurveyResponse {
  data: {
    delete_student_dislikes: {
      affected_rows: number
    }
    delete_student_preferences: {
      affected_rows: number
    }
    delete_teams: {
      affected_rows: number
    }
    delete_surveys_by_pk: Survey | null
  }
  errors?: Array<{ message: string }>
}

export async function deleteSurvey(id: string): Promise<Survey> {
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

    const response = await axios.post<DeleteSurveyResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_SURVEY,
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
      throw new Error(`アンケートの削除に失敗しました: ${response.data.errors[0].message}`)
    }

    // student_dislikes の削除結果を確認
    const deletedDislikes = response.data.data.delete_student_dislikes
    if (!deletedDislikes) {
      console.error('student_dislikes の削除結果が不明です')
    } else {
      console.log(`${deletedDislikes.affected_rows} 件の student_dislikes を削除しました`)
    }

    // student_preferences の削除結果を確認
    const deletedPreferences = response.data.data.delete_student_preferences
    if (!deletedPreferences) {
      console.error('student_preferences の削除結果が不明です')
    } else {
      console.log(`${deletedPreferences.affected_rows} 件の student_preferences を削除しました`)
    }

    // teams の削除結果を確認
    const deletedTeams = response.data.data.delete_teams
    if (!deletedTeams) {
      console.error('teams の削除結果が不明です')
    } else {
      console.log(`${deletedTeams.affected_rows} 件の teams を削除しました`)
    }

    const deletedSurvey = response.data.data.delete_surveys_by_pk
    if (!deletedSurvey) {
      console.error('Delete Survey Response Data:', response.data)
      throw new Error('アンケートの削除に失敗しました: レスポンスが空です')
    }

    return deletedSurvey
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('APIエラー詳細:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      })
      throw new Error(`APIエラー: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`)
    }
    
    console.error('アンケートの削除中にエラーが発生しました:', error)
    throw error instanceof Error 
      ? error
      : new Error('予期せぬエラーが発生しました')
  }
}