'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'

export async function fetchStudents(classId: string) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('Not authenticated')
  }

  const query = `
    query GetStudentsByClassId($classId: bigint!) {
      students(where: { class_id: { _eq: $classId } }) {
        id
        student_no
        name
        sex
        memo
        class_id
        created_at
        updated_at
      }
    }
  `

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie)

    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query,
        variables: { 
          classId: Number(classId)  // 文字列のIDを数値に変換
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

    // GraphQLのレスポンスを適切な型に変換
    const students = response.data.data?.students || []
    return students.map(student => ({
      ...student,
      id: String(student.id),  // bigintをstringに変換
      class_id: String(student.class_id)  // bigintをstringに変換
    }))
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    console.error('Error fetching students:', error)
    throw error
  }
}