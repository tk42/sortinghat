import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// POST /api/chat/students
// 新しい生徒を追加
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Firebase セッションクッキーを検証し、uid を取得
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const firebaseUid = decoded.uid;

    const body = await request.json();
    const { class_id, student_no, name, sex, memo } = body;

    if (!class_id || !student_no || !name || sex === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: class_id, student_no, name, sex' 
      }, { status: 400 });
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
      class_id: class_id, 
      firebase_uid: firebaseUid 
    });

    if (classResult.errors || !classResult.data.classes.length) {
      return NextResponse.json({ success: false, error: 'Class not found or access denied' }, { status: 404 });
    }

    // 生徒を追加
    const insertQuery = `
      mutation InsertStudent($class_id: bigint!, $student_no: Int!, $name: String!, $sex: Int!, $memo: String) {
        insert_students_one(object: {
          class_id: $class_id,
          student_no: $student_no,
          name: $name,
          sex: $sex,
          memo: $memo
        }) {
          id
          student_no
          name
          sex
          memo
          created_at
        }
      }
    `;

    const insertResult = await fetchGqlAPI(insertQuery, {
      class_id: class_id,
      student_no: student_no,
      name: name,
      sex: sex,
      memo: memo || null
    });

    if (insertResult.errors) {
      console.error('GraphQL errors:', insertResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to create student' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        student: insertResult.data.insert_students_one 
      } 
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}