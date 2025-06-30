import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// GET /api/chat/classes/[id]/students
// 指定されたクラスの生徒一覧を返す
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Firebase セッションクッキーを検証し、uid を取得
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const firebaseUid = decoded.uid;

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json({ success: false, error: 'Invalid class ID' }, { status: 400 });
    }

    // まずクラスが教師のものかを確認
    const classQuery = `
      query GetClassOwnership($class_id: bigint!, $firebase_uid: String!) {
        classes(where: { 
          id: { _eq: $class_id }, 
          teacher: { firebase_uid: { _eq: $firebase_uid } } 
        }) {
          id
          name
        }
      }
    `;

    const classResult = await fetchGqlAPI(classQuery, { 
      class_id: classId, 
      firebase_uid: firebaseUid 
    });

    if (classResult.errors || !classResult.data.classes.length) {
      return NextResponse.json({ success: false, error: 'Class not found or access denied' }, { status: 404 });
    }

    // GraphQL で生徒一覧を取得
    const studentsQuery = `
      query GetStudentsByClassId($class_id: bigint!) {
        students(where: { class_id: { _eq: $class_id } }, order_by: { student_no: asc }) {
          id
          student_no
          name
          sex
          memo
          created_at
        }
      }
    `;

    const studentsResult = await fetchGqlAPI(studentsQuery, { class_id: classId });

    if (studentsResult.errors) {
      console.error('GraphQL errors:', studentsResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        students: studentsResult.data.students || [] 
      } 
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}