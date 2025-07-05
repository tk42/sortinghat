'use server'

import axios from 'axios'
import { z } from 'zod'
import { Survey, StudentPreference } from '@/src/lib/interfaces'

const CREATE_SURVEY_WITH_PREFERENCES = `
  mutation CreateSurveyWithPreferences($survey_object: surveys_insert_input!, $preferences: [student_preferences_insert_input!]!) {
    insert_surveys_one(object: $survey_object) {
      id
      name
      status
      class_id
      created_at
    }
    insert_student_preferences(objects: $preferences) {
      affected_rows
    }
  }
`

// CSV からアンケートを作成するスキーマ
const CreateSurveySchema = z.object({
  name: z.string().min(1),
  class_id: z.number().int().positive(),
  student_preferences: z.array(
    z.object({
      student_id: z.number().int().positive(), // これは実際はstudent_no（出席番号）
      previous_team: z.number().int().min(0).max(8),
      mi_a: z.number().int().min(0).max(8), // 0も許可
      mi_b: z.number().int().min(0).max(8),
      mi_c: z.number().int().min(0).max(8),
      mi_d: z.number().int().min(0).max(8),
      mi_e: z.number().int().min(0).max(8),
      mi_f: z.number().int().min(0).max(8),
      mi_g: z.number().int().min(0).max(8),
      mi_h: z.number().int().min(0).max(8),
      leader: z.number().int().min(1).max(8),
      eyesight: z.number().int().min(1).max(8),
      student_dislikes: z.array(z.number().int().positive()).default([])
    })
  )
})

export async function createSurveyFromCSV(
  formData: FormData, 
  surveyName: string,
  classId: number
): Promise<Survey> {
  if (!process.env.BACKEND_API_URL) {
    throw new Error('BACKEND_API_URL が設定されていません')
  }

  // 1) LLM で CSV→StudentPreference[]
  const llmRes = await axios.post(
    `${process.env.BACKEND_API_URL}/llm/format_survey`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  
  if (llmRes.status !== 200 || !Array.isArray(llmRes.data.preferences)) {
    throw new Error('LLM応答が不正です')
  }
  
  const parsed = llmRes.data.preferences as StudentPreference[]

  // 2) バリデーション
  const validatedData = CreateSurveySchema.parse({
    name: surveyName,
    class_id: classId,
    student_preferences: parsed
  })

  // 3) GraphQL でアンケートを作成
  const surveyUuid = `survey-${Date.now()}`
  const surveyObject = {
    name: validatedData.name,
    class_id: validatedData.class_id,
    status: 1,
    uuid: surveyUuid
  }

  // アンケート作成
  const createSurveyQuery = `
    mutation CreateSurvey($name: String!, $class_id: bigint!, $status: Int!, $uuid: bpchar!) {
      insert_surveys_one(object: {
        name: $name,
        class_id: $class_id,
        status: $status,
        uuid: $uuid
      }) {
        id
        name
        status
        class_id
        created_at
      }
    }
  `

  const surveyRes = await axios.post(
    process.env.BACKEND_GQL_API!,
    {
      query: createSurveyQuery,
      variables: surveyObject
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
      }
    }
  )

  if (surveyRes.data.errors) {
    throw new Error(surveyRes.data.errors[0].message)
  }

  const createdSurvey = surveyRes.data.data.insert_surveys_one

  // 4) 生徒の選好データを作成
  if (parsed.length > 0) {
    // まず、クラスの生徒一覧を取得してstudent_noからstudent_idのマッピングを作成
    const studentsQuery = `
      query GetStudentsByClassId($class_id: bigint!) {
        students(where: { class_id: { _eq: $class_id } }) {
          id
          student_no
        }
      }
    `

    const studentsRes = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query: studentsQuery,
        variables: { class_id: classId }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
        }
      }
    )

    if (studentsRes.data.errors) {
      throw new Error(`生徒データの取得に失敗しました: ${studentsRes.data.errors[0].message}`)
    }

    const students = studentsRes.data.data.students
    const studentNoToIdMap = new Map(students.map((s: any) => [s.student_no, s.id]))

    // 選好データオブジェクトを作成
    const preferenceObjects = parsed
      .map((p: any) => {
        // LLMからのレスポンスでは student_id が実際は student_no (出席番号) を示している
        let studentNo = p.student_id || p.student?.student_no || p.student_no
        
        if (!studentNo) {
          console.warn('No student identifier found in preference object:', JSON.stringify(p, null, 2))
          return null
        }
        
        const studentId = studentNoToIdMap.get(studentNo)
        if (!studentId) {
          console.warn(`Student not found for student_no: ${studentNo}, available student_nos:`, Array.from(studentNoToIdMap.keys()).slice(0, 5))
          return null
        }
        
        const dislikeData = (Array.isArray(p.student_dislikes) ? p.student_dislikes : []).map((dislike: any) => {
          const studentNo = typeof dislike === 'number' ? dislike : dislike.student_id
          const dislikedId = studentNoToIdMap.get(studentNo)
          if (!dislikedId) {
            console.warn(`Disliked student not found for student_no: ${studentNo}`)
            return null
          }
          return { student_id: dislikedId }
        }).filter((item: { student_id: number } | null): item is { student_id: number } => item !== null)

        return {
          survey_id: createdSurvey.id,
          student_id: studentId, // 実際のデータベースID
          previous_team: p.previous_team ?? 0,
          mi_a: p.mi_a,
          mi_b: p.mi_b,
          mi_c: p.mi_c,
          mi_d: p.mi_d,
          mi_e: p.mi_e,
          mi_f: p.mi_f,
          mi_g: p.mi_g,
          mi_h: p.mi_h,
          leader: p.leader,
          eyesight: p.eyesight,
          ...(dislikeData.length > 0 && {
            student_dislikes: { data: dislikeData }
          })
        }
      })
      .filter(p => p !== null) // 見つからなかった生徒を除外

    const createPreferencesQuery = `
      mutation CreateStudentPreferences($objects: [student_preferences_insert_input!]!) {
        insert_student_preferences(objects: $objects) {
          affected_rows
        }
      }
    `

    const preferencesRes = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query: createPreferencesQuery,
        variables: { objects: preferenceObjects }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!
        }
      }
    )

    if (preferencesRes.data.errors) {
      console.warn('選好データ作成でエラーが発生しました:', preferencesRes.data.errors)
      // アンケートは作成されているので、エラーとして扱わない
    }
  }

  return createdSurvey as Survey
}