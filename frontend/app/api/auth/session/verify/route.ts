// frontend/app/api/auth/session/verify/route.ts
import { auth } from '@/src/utils/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const sessionCookie = cookies().get('auth-token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ valid: false });
  }
  try {
    // 第二引数 true を渡すとリボーク（取り消し）もチェックできます
    await auth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('verifySessionCookie error:', error);
    return NextResponse.json({ valid: false });
  }
}