// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/login'

  // 認証検証 API へリクエスト（相対パス利用）
  let isValid = false
  try {
      const baseUrl = process.env.API_BASE_URL || req.nextUrl.origin
      const res = await fetch(`${baseUrl}/api/auth/session/verify`, {
        headers: { cookie: req.headers.get('cookie') || '' }
      })
      const data = await res.json()
      isValid = Boolean(data.valid)
  } catch (err) {
      console.error('middleware fetch /api/auth/session/verify failed:', err)
  }

  // ログインページでトークン有効 → /dashboard へ
  if (isLoginPage && isValid) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  // それ以外のページでトークン無効 → /login へ
  if (!isLoginPage && !isValid) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/class', '/dashboard', '/account', '/matching'],
}