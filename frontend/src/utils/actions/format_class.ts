'use server'

import axios from 'axios'
import { z } from 'zod'
import { Student } from '@/src/lib/interfaces'

const CREATE_STUDENTS = `
  mutation CreateStudents($objects: [students_insert_input!]!) {
    insert_students(objects: $objects) {
      returning {
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
  }
`

// Bulk insert 用スキーマ
const BulkStudentSchema = z.object({
  objects: z.array(
    z.object({
      student_no: z.number().int().positive(),
      name: z.string(),
      sex: z.number().int().min(1).max(2),
      memo: z.string().nullable().optional(),
    })
  )
})

export async function createStudents(formData: FormData, classId: string): Promise<Student[]> {
  if (!process.env.BACKEND_API_URL) {
    throw new Error('BACKEND_API_URL が設定されていません')
  }

  // 1) LLM で CSV→Student[]
  const llmRes = await axios.post(
    `${process.env.BACKEND_API_URL}/llm/format_class`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  if (llmRes.status !== 200 || !Array.isArray(llmRes.data.students)) {
    throw new Error('LLM応答が不正です')
  }
  const parsed = llmRes.data.students as Student[]

  // 2) GraphQL に一括挿入
  const objects = parsed.map(s => ({
    student_no: s.student_no,
    name: s.name || '',
    sex: s.sex,
    memo: s.memo || null,
    class_id: classId
  }))
  BulkStudentSchema.parse({ objects })

  const gqlRes = await axios.post(
    process.env.BACKEND_GQL_API!,
    {
      query: CREATE_STUDENTS,
      variables: { objects }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
      }
    }
  )
  if (gqlRes.data.errors) {
    throw new Error(gqlRes.data.errors[0].message)
  }

  return gqlRes.data.data.insert_students.returning as Student[]
}