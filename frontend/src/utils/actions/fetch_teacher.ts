'use server'

import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI'
import { Teacher } from '@/src/lib/interfaces'
import { ActionResponse } from '@/src/utils/types/teacher'
import admin from '@/src/utils/firebase/admin'

export async function findTeacher(token: string): Promise<ActionResponse<Teacher>> {
  try {
    const decoded_token = await admin.auth().verifyIdToken(token)
    const firebase_uid = decoded_token.uid
    
    const query = `
      query Teacher($firebase_uid: String!) {
        teachers(where: {firebase_uid: {_eq: $firebase_uid}}) {
          id
          firebase_uid
          name
          email
          stripe_id
          school {
              id
              name
              city
          }
          created_at
          updated_at
        }
      }
    `
    
    const data = await fetchGqlAPI(query, { firebase_uid })
    
    if (!data || !data.teachers || data.teachers.length === 0) {
      return { success: false, error: 'Teacher not found' }
    }

    return { success: true, data: data.teachers[0] as Teacher }
  } catch (error) {
    console.error('Error finding teacher:', error)
    return { success: false, error: 'Failed to find teacher' }
  }
}