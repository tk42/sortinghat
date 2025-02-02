'use server'

import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI'
import { Teacher, TEACHER_FIELDS } from '@/src/lib/interfaces'
import { z } from 'zod'
import { TeacherSchema, ActionResponse } from '@/src/utils/types/teacher'
import admin from '@/src/utils/firebase/admin'

export async function updateTeacher(
  token: string,
  name: string,
  email: string
): Promise<ActionResponse<Teacher>> {
  try {
    // バリデーション
    TeacherSchema.parse({ name, email })

    const decoded_token = await admin.auth().verifyIdToken(token)
    const firebase_uid = decoded_token.uid
    
    const query = `
      ${TEACHER_FIELDS}
      mutation UpdateTeacher($firebase_uid: String!, $name: String!, $email: String!) {
        update_teachers(
          where: {firebase_uid: {_eq: $firebase_uid}},
          _set: {
            name: $name,
            email: $email
          }
        ) {
          returning {
            ...TeacherFields
          }
        }
      }
    `
    
    const data = await fetchGqlAPI(query, {
      firebase_uid,
      name,
      email,
    })

    if (!data || !data.update_teachers || !data.update_teachers.returning[0]) {
      return { success: false, error: 'Failed to update teacher: No data returned' }
    }
    
    return { success: true, data: data.update_teachers.returning[0] as Teacher }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error updating teacher:', error)
    return { success: false, error: 'Failed to update teacher' }
  }
}