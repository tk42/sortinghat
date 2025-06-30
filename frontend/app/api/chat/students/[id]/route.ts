import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// PUT /api/chat/students/[id]
// 生徒情報を更新
export async function PUT(
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

    const studentId = parseInt(params.id);
    if (isNaN(studentId)) {
      return NextResponse.json({ success: false, error: 'Invalid student ID' }, { status: 400 });
    }

    const body = await request.json();
    const { student_no, name, sex, memo } = body;

    if (!student_no || !name || sex === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: student_no, name, sex' 
      }, { status: 400 });
    }

    // まず生徒が教師のクラスに属しているかを確認
    const ownershipQuery = `
      query CheckStudentOwnership($student_id: bigint!, $firebase_uid: String!) {
        students(where: { 
          id: { _eq: $student_id },
          class: { teacher: { firebase_uid: { _eq: $firebase_uid } } }
        }) {
          id
          class_id
        }
      }
    `;

    const ownershipResult = await fetchGqlAPI(ownershipQuery, { 
      student_id: studentId, 
      firebase_uid: firebaseUid 
    });

    if (ownershipResult.errors || !ownershipResult.data.students.length) {
      return NextResponse.json({ success: false, error: 'Student not found or access denied' }, { status: 404 });
    }

    // 生徒情報を更新
    const updateQuery = `
      mutation UpdateStudent($student_id: bigint!, $student_no: Int!, $name: String!, $sex: Int!, $memo: String) {
        update_students_by_pk(pk_columns: { id: $student_id }, _set: {
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

    const updateResult = await fetchGqlAPI(updateQuery, {
      student_id: studentId,
      student_no: student_no,
      name: name,
      sex: sex,
      memo: memo || null
    });

    if (updateResult.errors) {
      console.error('GraphQL errors:', updateResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to update student' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        student: updateResult.data.update_students_by_pk 
      } 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chat/students/[id]
// 生徒を削除
export async function DELETE(
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

    const studentId = parseInt(params.id);
    if (isNaN(studentId)) {
      return NextResponse.json({ success: false, error: 'Invalid student ID' }, { status: 400 });
    }

    // まず生徒が教師のクラスに属しているかを確認
    const ownershipQuery = `
      query CheckStudentOwnership($student_id: bigint!, $firebase_uid: String!) {
        students(where: { 
          id: { _eq: $student_id },
          class: { teacher: { firebase_uid: { _eq: $firebase_uid } } }
        }) {
          id
          class_id
        }
      }
    `;

    const ownershipResult = await fetchGqlAPI(ownershipQuery, { 
      student_id: studentId, 
      firebase_uid: firebaseUid 
    });

    if (ownershipResult.errors || !ownershipResult.data.students.length) {
      return NextResponse.json({ success: false, error: 'Student not found or access denied' }, { status: 404 });
    }

    // 生徒を削除
    const deleteQuery = `
      mutation DeleteStudent($student_id: bigint!) {
        delete_students_by_pk(id: $student_id) {
          id
        }
      }
    `;

    const deleteResult = await fetchGqlAPI(deleteQuery, {
      student_id: studentId
    });

    if (deleteResult.errors) {
      console.error('GraphQL errors:', deleteResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        deleted_id: studentId 
      } 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}