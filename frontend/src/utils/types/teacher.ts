import { cookies } from 'next/headers'
import { z } from 'zod'
import admin from '@/src/utils/firebase/admin'
import { Teacher } from '@/src/lib/interfaces'

// バリデーションスキーマ
export const TeacherSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  stripe_id: z.string().optional(),
})

// レスポンス型
export type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// 認証関連の共通関数
export async function verifyAuth(): Promise<string> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth-token')?.value

  if (!sessionCookie) {
    throw new Error('Not authenticated')
  }

  const decodedToken = await admin.auth().verifyIdToken(sessionCookie)
  return decodedToken.uid
}

// GraphQL関連の型
export type CreateTeacherInput = z.infer<typeof TeacherSchema>

export type UpdateTeacherInput = CreateTeacherInput & {
  stripe_id?: string
}

export type TeacherResponse = {
  teacher?: Teacher
  error?: string
}