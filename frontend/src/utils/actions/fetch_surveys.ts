'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'

export async function fetchSurveys(firebaseUid: string) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('Not authenticated')
  }

  // セッションクッキーを検証し、UIDが一致することを確認
  const decodedToken = await auth.verifySessionCookie(sessionCookie)
  if (decodedToken.uid !== firebaseUid) {
    throw new Error('Unauthorized access')
  }

  const query = `
    query GetSurveysByTeacherId($teacherId: String!) {
      surveys(where: { class: { teacher: { firebase_uid: { _eq: $teacherId } } } }, order_by: { created_at: desc }) {
        id
        name
        status
        class {
          id
          name
          teacher {
            id
            firebase_uid
          }
        }
        created_at
      }
    }
  `

  try {
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query,
        variables: {
          teacherId: firebaseUid,
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
      throw new Error(response.data.errors[0].message)
    }

    return response.data.data.surveys
  } catch (error) {
    console.error('Error fetching surveys:', error)
    throw error
  }
}