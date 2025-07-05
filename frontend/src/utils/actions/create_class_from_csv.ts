'use server'

import axios from 'axios'
import { z } from 'zod'
import { Class, Student } from '@/src/lib/interfaces'

const CREATE_CLASS_WITH_STUDENTS = `
  mutation CreateClassWithStudents($class_object: classes_insert_input!, $students: [students_insert_input!]!) {
    insert_classes_one(object: $class_object) {
      id
      name
      uuid
      created_at
      teacher_id
    }
    insert_students(objects: $students) {
      affected_rows
    }
  }
`

// CSV からクラスを作成するスキーマ
const CreateClassSchema = z.object({
  name: z.string().min(1),
  teacher_id: z.number().int().positive(),
  students: z.array(
    z.object({
      student_no: z.number().int().positive(),
      name: z.string(),
      sex: z.number().int().min(1).max(2),
      memo: z.string().nullable().optional(),
    })
  )
})

export async function createClassFromCSV(
  formData: FormData, 
  className: string,
  teacherId: number
): Promise<Class> {
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

  // 2) バリデーション
  const validatedData = CreateClassSchema.parse({
    name: className,
    teacher_id: teacherId,
    students: parsed
  })

  // 3) GraphQL でクラスと生徒を一括作成
  const classUuid = `class-${Date.now()}`
  const classObject = {
    name: validatedData.name,
    teacher_id: validatedData.teacher_id,
    uuid: classUuid
  }

  // クラス作成後、そのIDを使って生徒を作成するため、まずクラスを作成
  const createClassQuery = `
    mutation CreateClass($name: String!, $teacher_id: bigint!, $uuid: bpchar!) {
      insert_classes_one(object: {
        name: $name,
        teacher_id: $teacher_id,
        uuid: $uuid
      }) {
        id
        name
        uuid
        created_at
        teacher_id
      }
    }
  `

  const classRes = await axios.post(
    process.env.BACKEND_GQL_API!,
    {
      query: createClassQuery,
      variables: classObject
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
      }
    }
  )

  if (classRes.data.errors) {
    throw new Error(classRes.data.errors[0].message)
  }

  const createdClass = classRes.data.data.insert_classes_one

  // 4) 生徒データを作成
  if (parsed.length > 0) {
    const studentObjects = parsed.map(s => ({
      student_no: s.student_no,
      name: s.name || '',
      sex: s.sex,
      memo: s.memo || null,
      class_id: createdClass.id
    }))

    const createStudentsQuery = `
      mutation CreateStudents($objects: [students_insert_input!]!) {
        insert_students(objects: $objects) {
          affected_rows
        }
      }
    `

    const studentsRes = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query: createStudentsQuery,
        variables: { objects: studentObjects }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
        }
      }
    )

    if (studentsRes.data.errors) {
      console.warn('生徒作成でエラーが発生しました:', studentsRes.data.errors)
      // クラスは作成されているので、エラーとして扱わない
    }
  }

  return createdClass as Class
}