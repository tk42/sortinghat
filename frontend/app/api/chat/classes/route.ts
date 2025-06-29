import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// GET /api/chat/classes
// 認証済み教師のクラス一覧を返す
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Firebase セッションクッキーを検証し、uid を取得
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const firebaseUid = decoded.uid;

    // GraphQL でクラス一覧を取得
    const query = `
      query GetClassesByFirebaseUid($firebase_uid: String!) {
        classes(where: { teacher: { firebase_uid: { _eq: $firebase_uid } } }) {
          id
          name
          uuid
          created_at
        }
      }
    `;

    const result = await fetchGqlAPI(query, { firebase_uid: firebaseUid });

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json({ success: false, error: 'Failed to fetch classes' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { classes: result.data.classes } });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
