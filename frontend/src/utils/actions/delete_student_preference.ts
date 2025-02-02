'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'

const DELETE_STUDENT_PREFERENCE = `
  mutation DeleteStudentPreference($id: bigint!) {
    delete_student_preferences_by_pk(id: $id) {
      id
    }
  }
`

// バリデーションスキーマ
const DeleteStudentPreferenceSchema = z.object({
  id: z.string().min(1, '希望IDは必須です'),
})

export async function deleteStudentPreference(formData: FormData) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    const validatedData = DeleteStudentPreferenceSchema.parse({
      id: formData.get('id'),
    })

    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value

    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    await auth.verifySessionCookie(sessionCookie)
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_STUDENT_PREFERENCE,
        variables: {
          id: Number(validatedData.id),
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

    return response.data.data.delete_student_preferences_by_pk
  } catch (error) {
    console.error('Error deleting student preference:', error)
    throw error
  }
}