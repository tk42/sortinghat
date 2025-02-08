'use server'

import axios from 'axios'
import { createHash } from 'crypto'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const CREATE_SURVEY = `
  mutation CreateSurvey($name: String!, $classId: bigint!, $uuid: bpchar!) {
    insert_surveys_one(object: {
      name: $name,
      status: 0,
      class_id: $classId,
      uuid: $uuid
    }) {
      id
      name
      status
      created_at
      uuid
      class {
        id
        name
        teacher {
          id
          name
        }
      }
    }
  }
`

// バリデーションスキーマ
const CreateSurveySchema = z.object({
  classId: z.string().min(1, 'クラスIDは必須です'),
})

// URL-safe base64 encoding
function base64URLEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Generate UUID from class ID and current timestamp
function generateUUID(classId: number): string {
  const currentTimestamp = new Date().toISOString()
  const data = `${classId}-${currentTimestamp}`
  const hash = createHash('sha256')
    .update(data)
    .digest('base64')
  return base64URLEncode(hash).substring(0, 36)
}

export async function createSurvey(formData: FormData) {
  try {
    // バリデーション
    const validatedData = CreateSurveySchema.parse({
      classId: formData.get('classId'),
    })

    if (!process.env.BACKEND_GQL_API) {
      console.error('Backend API URL is not configured')
      return { error: 'バックエンドAPIの設定が見つかりません' }
    }

    const surveyName = `アンケート_${new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  })}`
    const classId = parseInt(validatedData.classId)
    const uuid = generateUUID(classId)

    const requestBody = {
      query: CREATE_SURVEY,
      variables: {
        name: surveyName,
        classId: classId,
        uuid: uuid,
      },
    }

    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    )

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors)
      return { error: response.data.errors[0].message }
    }

    revalidatePath('/matching')
    return { data: response.data.data.insert_surveys_one }
  } catch (error) {
    console.error('Detailed error:', error)
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return { error: error.errors[0].message }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'アンケートの作成中に予期せぬエラーが発生しました' }
  }
}