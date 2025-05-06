// app/api/auth/session/route.ts
import { auth } from '@/src/utils/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    
    // セッションクッキーの有効期限を設定（例：5日間）
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // セッションクッキー有効期限（ミリ秒）
    const maxAge = expiresIn / 1000;         // Cookie maxAge は秒単位
    
    // IDトークンからFirebaseセッションクッキーを作成
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // セッションクッキーを設定
    cookies().set('auth-token', sessionCookie, {
      maxAge: maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// クライアントのリロード時にセッションを復元する用のエンドポイント
export async function GET() {
  try {
    const sessionCookie = cookies().get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({}, { status: 204 });
    }
    // セッションクッキーを検証
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    // カスタムトークンを生成
    const customToken = await auth.createCustomToken(decoded.uid);
    const res = NextResponse.json({ customToken }, { status: 200 });
    return res;
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

// export async function DELETE() {
//   try {
//     // セッションクッキーを削除
//     cookies().delete('auth-token');
    
//     return NextResponse.json({ status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }