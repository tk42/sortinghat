// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/login'

  // 認証検証 API へリクエスト
  const res = await fetch(new URL('/api/auth/session/verify', req.url), {
    headers: { cookie: req.headers.get('cookie') || '' },
  })
  const { valid: isValid } = await res.json()

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