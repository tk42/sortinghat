import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * ミドルウェア関数
 * 
 * @param req NextRequest
 * @returns NextResponse
 */
export function middleware(req: NextRequest) {
    const token: RequestCookie | undefined = req.cookies.get('auth-token');
    const isLoginPage = req.nextUrl.pathname === '/login';

    // ログインページでトークンが存在する場合は、dashboardへリダイレクト
    if (isLoginPage && token?.value) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // ログインページ以外でトークンが存在しない場合、ログインページへリダイレクト
    if (!isLoginPage && !token?.value) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // それ以外の場合は、そのままリクエストを続行
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/dashboard',
        '/account',
        '/matching',
    ],
};