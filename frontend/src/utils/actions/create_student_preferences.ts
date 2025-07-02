'use server'

import axios from 'axios'
import { z } from 'zod'
import { StudentPreference, StudentDislike } from '@/src/lib/interfaces';

const CREATE_STUDENT_PREFERENCES = `
  mutation CreateStudentPreferences($objects: [student_preferences_insert_input!]!) {
    insert_student_preferences(objects: $objects) {
      returning {
        id
        student {
          id
          student_no
          name
          sex
        }
        survey {
          id
          name
        }
        previous_team
        mi_a
        mi_b
        mi_c
        mi_d
        mi_e
        mi_f
        mi_g
        mi_h
        eyesight
        leader
        student_dislikes {
          id
          student_id
          preference_id
        }
        created_at
        updated_at
      }
    }
  }
`

const CREATE_STUDENT_DISLIKES = `
  mutation CreateStudentDislikes($objects: [student_dislikes_insert_input!]!) {
    insert_student_dislikes(objects: $objects) {
      returning {
        id
        student_id
        preference_id
      }
    }
  }
`

const GET_STUDENT_IDS = `
  query GetStudentIds($student_nos: [Int!]!, $class_id: bigint!) {
    students(where: {student_no: {_in: $student_nos}, class_id: {_eq: $class_id}}) {
      id
      student_no
    }
  }
`

interface ProcessedPreference {
  student_id: string;
  previous_team: number;
  mi_a: number;
  mi_b: number;
  mi_c: number;
  mi_d: number;
  mi_e: number;
  mi_f: number;
  mi_g: number;
  mi_h: number;
  eyesight: number;
  leader: number;
  student_dislikes: string[];
}

interface CreateStudentPreferencesResult {
  data: StudentPreference[] | null
  error: string | null
}

// バリデーションスキーマを修正
const StudentPreferenceSchema = z.object({
  student_id: z.number().int().positive(),
  survey_id: z.number().int().positive(),
  previous_team: z.number().int().positive(),
  mi_a: z.number().int().min(0).max(8).default(0),
  mi_b: z.number().int().min(0).max(8).default(0),
  mi_c: z.number().int().min(0).max(8).default(0),
  mi_d: z.number().int().min(0).max(8).default(0),
  mi_e: z.number().int().min(0).max(8).default(0),
  mi_f: z.number().int().min(0).max(8).default(0),
  mi_g: z.number().int().min(0).max(8).default(0),
  mi_h: z.number().int().min(0).max(8).default(0),
  eyesight: z.number().int().min(1).max(8).default(1),
  leader: z.number().int().min(1).max(8).default(1),
  student_dislikes: z.array(z.number().int().positive()).default([])
})

export async function createStudentPreferences(formData: FormData): Promise<CreateStudentPreferencesResult> {
  if (!process.env.BACKEND_GQL_API) {
    return { data: null, error: 'BACKEND_GQL_API is not configured' }
  }

  try {
    const fileContent = formData.get('file') as File
    const surveyId = Number(formData.get('survey_id'))
    const classId = Number(formData.get('class_id'))
    
    // CSVファイルをバックエンドに送信
    const uploadFormData = new FormData()
    uploadFormData.append('file', fileContent)
    uploadFormData.append('survey_id', surveyId.toString())

    const backendResponse = await axios.post(
      `${process.env.BACKEND_API_URL}/llm/format_survey`,
      uploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    ).catch(error => {
      console.error('Error uploading CSV file:', error)
      throw new Error('CSVファイルのアップロード中にエラーが発生しました')
    })

    // console.log('Backend response:', backendResponse.data)

    if (!backendResponse.data.preferences) {
      throw new Error('バックエンドからの応答が不正です')
    }

    const llm_processedData = backendResponse.data.preferences as ProcessedPreference[];

    // 学籍番号のリストを取得（数値として扱う）
    const studentNos = llm_processedData.map((row: ProcessedPreference) => {
      const studentNo = parseInt(row.student_id);
      if (isNaN(studentNo)) {
        throw new Error(`Invalid student number: ${row.student_id}`)
      }
      return studentNo;
    });

    // 学籍番号から学生IDを取得
    const studentResponse = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: GET_STUDENT_IDS,
        variables: {
          student_nos: studentNos,
          class_id: classId
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    )

    if (studentResponse.data.errors) {
      throw new Error(studentResponse.data.errors[0].message)
    }

    // 学籍番号とIDのマッピングを作成
    const studentIdMap = new Map(
      studentResponse.data.data.students.map((s: { id: number, student_no: number }) => 
        [s.student_no, s.id]
      )
    )

    // --- クラス不一致チェック -------------------------------
    // 取得できた学生IDが 0 件の場合は、CSV が選択クラスのデータではないと判断
    if (studentIdMap.size === 0) {
      throw new Error('アップロードしたCSVは選択されたクラスの児童生徒と一致しません。クラスを確認してください。')
    }

    // 一部の学籍番号が一致しない場合は、その一覧をユーザーに提示
    const unmatchedStudentNos = studentNos.filter(no => !studentIdMap.has(no))
    if (unmatchedStudentNos.length > 0) {
      throw new Error(`名簿番号: ${unmatchedStudentNos.join(', ')} の児童生徒が担任クラスに見つかりませんでした。クラスを確認してください。`)
    }
    // -------------------------------------------------------

    // 各行をバリデーションして変換
    const validatedData = llm_processedData.map(row => {
      const studentNo = Number(row.student_id)
      const studentId = studentIdMap.get(studentNo)
      if (!studentId) {
        throw new Error(`名簿番号: ${studentNo} の児童生徒が担任クラスに見つかりませんでした`)
      }

      // console.log('Row before validation:', row)  // バリデーション前のデータを確認

      const validated = StudentPreferenceSchema.parse({
        student_id: studentId,
        survey_id: surveyId,
        previous_team: row.previous_team,
        mi_a: row.mi_a || 0,
        mi_b: row.mi_b || 0,
        mi_c: row.mi_c || 0,
        mi_d: row.mi_d || 0,
        mi_e: row.mi_e || 0,
        mi_f: row.mi_f || 0,
        mi_g: row.mi_g || 0,
        mi_h: row.mi_h || 0,
        eyesight: row.eyesight,
        leader: row.leader,
        student_dislikes: row.student_dislikes || []
      })

      console.log('Validated data:', validated)  // バリデーション後のデータを確認

      return validated
    })

    // console.log('Final validated data:', validatedData)  // 最終的なデータを確認

    // student_preferencesを作成
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: CREATE_STUDENT_PREFERENCES,
        variables: {
          objects: validatedData.map(d => ({
            student_id: d.student_id,
            survey_id: d.survey_id,
            previous_team: d.previous_team,
            mi_a: d.mi_a,
            mi_b: d.mi_b,
            mi_c: d.mi_c,
            mi_d: d.mi_d,
            mi_e: d.mi_e,
            mi_f: d.mi_f,
            mi_g: d.mi_g,
            mi_h: d.mi_h,
            eyesight: d.eyesight,
            leader: d.leader,
            student_dislikes: {
              data: d.student_dislikes.map(student_id => ({
                student_id: studentIdMap.get(Number(student_id))
              }))
            }
          }))
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

    const createdPreferences = response.data.data.insert_student_preferences.returning as StudentPreference[];
    return { data: createdPreferences, error: null }
  } catch (error) {
    let message: string
    if (error instanceof z.ZodError) {
      message = error.errors[0].message
    } else if (error instanceof Error) {
      message = error.message
    } else {
      message = '不明なエラーが発生しました'
    }
    return { data: null, error: message }
  }
}