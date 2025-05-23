'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'

const UPDATE_STUDENT_PREFERENCE = `
  mutation UpdateStudentPreference(
    $id: bigint!,
    $mi_a: Int!,
    $mi_b: Int!,
    $mi_c: Int!,
    $mi_d: Int!,
    $mi_e: Int!,
    $mi_f: Int!,
    $mi_g: Int!,
    $mi_h: Int!,
    $leader: Int!,
    $eyesight: Int!,
    $previous_team: bigint
  ) {
    update_student_preferences_by_pk(
      pk_columns: { id: $id }
      _set: {
        mi_a: $mi_a,
        mi_b: $mi_b,
        mi_c: $mi_c,
        mi_d: $mi_d,
        mi_e: $mi_e,
        mi_f: $mi_f,
        mi_g: $mi_g,
        mi_h: $mi_h,
        leader: $leader,
        eyesight: $eyesight,
        previous_team: $previous_team
      }
    ) {
      id
      student_id
      survey_id
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
      previous_team
      student_dislikes {
        student_id
        updated_at
      }
    }
  }
`

const DELETE_STUDENT_DISLIKES = `
  mutation DeleteStudentDislikes($preference_id: bigint!) {
    delete_student_dislikes(where: {preference_id: {_eq: $preference_id}}) {
      affected_rows
    }
  }
`

const INSERT_STUDENT_DISLIKES = `
  mutation InsertStudentDislikes($objects: [student_dislikes_insert_input!]!) {
    insert_student_dislikes(objects: $objects) {
      affected_rows
    }
  }
`

// バリデーションスキーマ
const UpdateStudentPreferenceSchema = z.object({
  id: z.string().min(1, '希望IDは必須です'),
  preferences: z.array(z.string()).min(1, '希望は1つ以上必要です'),
})

export async function updateStudentPreference(formData: FormData) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    const validatedData = UpdateStudentPreferenceSchema.parse({
      id: formData.get('id'),
      preferences: JSON.parse(formData.get('preferences') as string),
    })

    // Parse the preferences JSON string
    const preferences = JSON.parse(validatedData.preferences[0])

    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value

    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    await auth.verifySessionCookie(sessionCookie)

    // 1. Update student preferences
    const preferenceResponse = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: UPDATE_STUDENT_PREFERENCE,
        variables: {
          id: String(validatedData.id),
          mi_a: Number(preferences.mi_a),
          mi_b: Number(preferences.mi_b),
          mi_c: Number(preferences.mi_c),
          mi_d: Number(preferences.mi_d),
          mi_e: Number(preferences.mi_e),
          mi_f: Number(preferences.mi_f),
          mi_g: Number(preferences.mi_g),
          mi_h: Number(preferences.mi_h),
          leader: Number(preferences.leader),
          eyesight: Number(preferences.eyesight),
          previous_team: preferences.previous_team ? preferences.previous_team.toString() : null
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    );

    if (preferenceResponse.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(preferenceResponse.data.errors)}`);
    }

    // 2. Delete existing dislikes
    await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_STUDENT_DISLIKES,
        variables: {
          preference_id: Number(validatedData.id)
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    );

    // 3. Insert new dislikes if any
    if (preferences.student_dislikes && preferences.student_dislikes.length > 0) {
      await axios.post(
        process.env.BACKEND_GQL_API,
        {
          query: INSERT_STUDENT_DISLIKES,
          variables: {
            objects: preferences.student_dislikes.map((dislike: any) => ({
              preference_id: Number(validatedData.id),
              student_id: Number(dislike.student_id),
              updated_at: new Date().toISOString()
            }))
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
          },
        }
      );
    }

    return preferenceResponse.data.data.update_student_preferences_by_pk;
  } catch (error) {
    console.error('Error updating student preference:', error);
    throw error;
  }
}