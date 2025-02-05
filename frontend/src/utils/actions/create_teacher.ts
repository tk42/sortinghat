'use server'

import { cookies } from 'next/headers'
import admin from '@/src/utils/firebase/admin'
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI'
import { Teacher } from '@/src/lib/interfaces'
import { z } from 'zod'
import { TeacherSchema, ActionResponse, verifyAuth } from '@/src/utils/types/teacher'

export async function createTeacher(
  name: string,
  email: string,
  stripe_id?: string,
  idToken?: string
): Promise<ActionResponse<Teacher>> {
  try {
    // バリデーション
    TeacherSchema.parse({ name, email, stripe_id })

    let firebase_uid: string;
    if (idToken) {
      // IDトークンが提供された場合はそれを使用
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      firebase_uid = decodedToken.uid;
    } else {
      // 従来のセッショントークンを使用
      firebase_uid = await verifyAuth();
    }
    
    const query = `
      mutation AddTeacher($firebase_uid: String!, $name: String!, $email: String!, $stripe_id: String) {
        insert_teachers_one(object: {
          firebase_uid: $firebase_uid,
          name: $name,
          email: $email,
          stripe_id: $stripe_id
        }) {
          id
          firebase_uid
          name
          email
          stripe_id
          created_at
          updated_at
        }
      }
    `

    const variables = {
      firebase_uid,
      name,
      email,
      stripe_id,
    }
    
    console.log('Executing GraphQL mutation with variables:', variables)
    const data = await fetchGqlAPI(query, variables)
    console.log('GraphQL response:', data)
    
    if (!data || !data.insert_teachers_one) {
      console.error('GraphQL error:', data)
      return { success: false, error: 'Failed to create teacher: No data returned' }
    }
    
    return { success: true, data: data.insert_teachers_one as Teacher }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error creating teacher:', error)
    if (error instanceof Error) {
      return { success: false, error: `Failed to create teacher: ${error.message}` }
    }
    return { success: false, error: 'Failed to create teacher' }
  }
}