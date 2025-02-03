'use server'

import axios from 'axios'
import { createHash } from 'crypto'
import { z } from 'zod'

const CREATE_CLASS = `
  mutation CreateClass($name: String!, $teacherId: bigint!, $uuid: bpchar!) {
    insert_classes_one(object: {
      name: $name,
      teacher_id: $teacherId,
      uuid: $uuid
    }) {
      id
      name
      uuid
      created_at
    }
  }
`

// URL-safe base64 encoding
function base64URLEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Generate UUID from teacher ID, creation timestamp, and current timestamp
function generateUUID(teacherId: number, createdAt: string): string {
  const currentTimestamp = new Date().toISOString()
  const data = `${teacherId}-${createdAt}-${currentTimestamp}`
  const hash = createHash('sha256')
    .update(data)
    .digest('base64')
  return base64URLEncode(hash).substring(0, 36)
}

// バリデーションスキーマ
const CreateClassSchema = z.object({
  name: z.string().min(1, 'クラス名は必須です'),
  teacherId: z.string().min(1, '教師IDは必須です'),
  teacherCreatedAt: z.string().min(1, '教師の作成日時は必須です'),
})

export async function createClass(formData: FormData) {
  try {
    // デバッグ: フォームデータの内容を確認
    // Array.from(formData.entries()).forEach(([key, value]) => {
    //   console.log(`${key}: ${value}`);
    // });

    // バリデーション
    const validatedData = CreateClassSchema.parse({
      name: formData.get('name'),
      teacherId: formData.get('teacherId'),
      teacherCreatedAt: formData.get('teacherCreatedAt'),
    })

    // デバッグ: バリデーション後のデータを確認
    // console.log('Validated data:', validatedData);

    const uuid = generateUUID(
      parseInt(validatedData.teacherId),
      validatedData.teacherCreatedAt
    )

    // デバッグ: 生成されたUUIDを確認
    // console.log('Generated UUID:', uuid);

    if (!process.env.BACKEND_GQL_API) {
      console.error('Backend API URL is not configured');
      return { error: 'バックエンドAPIの設定が見つかりません' }
    }

    // デバッグ: リクエストの内容を確認
    const requestBody = {
      query: CREATE_CLASS,
      variables: {
        name: validatedData.name,
        teacherId: parseInt(validatedData.teacherId), // 文字列から数値に変換
        uuid,
      },
    };
    // console.log('Request body:', JSON.stringify(requestBody));
    // console.log('API URL:', process.env.BACKEND_GQL_API);

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

    // デバッグ: レスポンスの内容を確認
    // console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      return { error: response.data.errors[0].message }
    }

    return { data: response.data.data.insert_classes_one }
  } catch (error) {
    // デバッグ: エラーの詳細を確認
    console.error('Detailed error:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return { error: error.errors[0].message }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'クラスの作成中に予期せぬエラーが発生しました' }
  }
}