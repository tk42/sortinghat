'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { Student, DashboardStudent } from '@/src/lib/interfaces';

type HasuraStudent = Omit<Student, 'class'> & {
  class_id: number;
  created_at: string;
  updated_at: string;
};

export async function fetchStudents(classId: string): Promise<Student[]> {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('Not authenticated')
  }

  const query = `
    query GetStudentsByClassId($classId: bigint!) {
      students(where: { class_id: { _eq: $classId } }) {
        id
        student_no
        name
        sex
        memo
        class {
          id
          name
          uuid
          created_at
        }
        created_at
        updated_at
      }
    }
  `

  try {
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query,
        variables: { 
          classId: Number(classId)  // 文字列のIDを数値に変換
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

    // GraphQLのレスポンスを適切な型に変換
    const students = response.data.data?.students as Student[] || [];
    return students.map((student): Student => ({
      ...student,
      id: student.id,
      class: {
        id: student.class.id,
        name: student.class.name,
        uuid: student.class.uuid,
        teacher: undefined,
        students: [],
        surveys: [],
        created_at: student.class.created_at,
      },
      memo: student.memo || "",
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    console.error('Error fetching students:', error)
    throw error
  }
}