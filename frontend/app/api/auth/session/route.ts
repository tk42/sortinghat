// app/api/auth/session/route.ts
import { auth } from '@/src/utils/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    
    // セッションクッキーの有効期限を設定（例：5日間）
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // IDトークンからFirebaseセッションクッキーを作成
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // セッションクッキーを設定
    cookies().set('auth-token', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // セッションクッキーを削除
    cookies().delete('auth-token');
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}