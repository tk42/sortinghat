'use server'

import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import axios from 'axios'

export async function getCurrentTeacher(): Promise<{ id: number; firebase_uid: string } | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value
    
    if (!sessionCookie) {
      return null
    }

    // Firebase セッションクッキーを検証
    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    const firebaseUid = decoded.uid

    // GraphQL で教師情報を取得
    const query = `
      query GetTeacherByFirebaseUid($firebase_uid: String!) {
        teachers(where: { firebase_uid: { _eq: $firebase_uid } }) {
          id
          firebase_uid
        }
      }
    `

    const response = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query,
        variables: { firebase_uid: firebaseUid }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
        }
      }
    )

    if (response.data.errors || !response.data.data.teachers.length) {
      return null
    }

    return response.data.data.teachers[0]
  } catch (error) {
    console.error('Error getting current teacher:', error)
    return null
  }
}