'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'

export async function fetchStudentPreferences(surveyId: string) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('Not authenticated')
  }

  const query = `
    query GetStudentPreferencesBySurveyId($surveyId: bigint!) {
      student_preferences(where: { survey_id: { _eq: $surveyId } }, order_by: { created_at: desc }) {
        id
        student {
          id
          student_no
          name
          sex
        }
        survey {
          id
          name
        }
        previous_team
        mi_a
        mi_b
        mi_c
        mi_d
        mi_e
        mi_f
        mi_g
        mi_h
        leader
        eyesight
        student_dislikes {
          student_id
        }
      }
    }
  `

  try {
    await auth.verifySessionCookie(sessionCookie)
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query,
        variables: {
          surveyId: Number(surveyId),
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

    return response.data.data.student_preferences
  } catch (error) {
    console.error('Error fetching student preferences:', error)
    throw error
  }
}