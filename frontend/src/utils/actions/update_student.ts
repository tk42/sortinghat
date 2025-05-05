'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'

const UPDATE_STUDENT = `
  mutation UpdateStudent($id: bigint!, $student_no: Int!, $name: String!, $sex: Int!, $memo: String) {
    update_students_by_pk(
      pk_columns: { id: $id }
      _set: {
        student_no: $student_no,
        name: $name,
        sex: $sex,
        memo: $memo
      }
    ) {
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

// バリデーションスキーマ
const UpdateStudentSchema = z.object({
  id: z.string().min(1, '児童生徒IDは必須です'),
  student_no: z.string().min(1, '名簿番号は必須です'),
  name: z.string(),
  sex: z.number().min(1).max(2),
  memo: z.string().nullable(),
})

export async function updateStudent(formData: FormData) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('Not authenticated')
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie)

    const validatedData = UpdateStudentSchema.parse({
      id: formData.get('id'),
      student_no: formData.get('student_no'),
      name: formData.get('name'),
      sex: Number(formData.get('sex')),
      memo: formData.get('memo') || '',
    })

    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: UPDATE_STUDENT,
        variables: {
          id: Number(validatedData.id),
          student_no: Number(validatedData.student_no),
          name: validatedData.name,
          sex: validatedData.sex,
          memo: validatedData.memo,
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

    const updatedStudent = response.data.data?.update_students_by_pk
    if (!updatedStudent) {
      throw new Error('児童生徒の更新に失敗しました')
    }

    // GraphQLのレスポンスを適切な型に変換
    return { data: {
      ...updatedStudent,
      id: String(updatedStudent.id), // bigintをstringに変換
    }}
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    console.error('児童生徒の更新中にエラーが発生しました:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: error instanceof Error ? error.message : '児童生徒の更新に失敗しました' }
  }
}