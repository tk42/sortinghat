typescript
import { auth } from '@/src/utils/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// アカウント削除 API エンドポイント
export async function DELETE(req: NextRequest) {
  try {
    // セッションクッキー確認
    const sessionCookie = cookies().get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // セッションクッキーを検証して UID 取得
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    // Firebase Auth からユーザー削除
    await auth.deleteUser(decoded.uid);

    // セッションクッキーを破棄
    cookies().delete('auth-token');

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('Account delete error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
