'use server'

import axios from 'axios'
import { z } from 'zod'

const CREATE_STUDENT = `
  mutation CreateStudent(
    $student_no: Int!,
    $name: String!,
    $sex: Int!,
    $memo: String,
    $classId: bigint!
  ) {
    insert_students_one(object: {
      student_no: $student_no,
      name: $name,
      sex: $sex,
      memo: $memo,
      class_id: $classId
    }) {
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
const CreateStudentSchema = z.object({
  student_no: z.number().int().positive('名簿番号は正の整数である必要があります'),
  name: z.string(),
  sex: z.number().int().min(1).max(2, '性別は1（男性）または2（女性）である必要があります'),
  memo: z.string().optional(),
  classId: z.string().min(1, 'クラスIDは必須です'),
})

export async function createStudent(formData: FormData) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    const validatedData = CreateStudentSchema.parse({
      student_no: Number(formData.get('student_no')),
      name: formData.get('name'),
      sex: Number(formData.get('sex')),
      memo: formData.get('memo'),
      classId: formData.get('classId'),
    })

    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: CREATE_STUDENT,
        variables: validatedData,
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

    return response.data.data.insert_students_one
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    throw error
  }
}