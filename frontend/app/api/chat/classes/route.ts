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

// POST /api/chat/classes
// 新しいクラスを作成（生徒データ付き）
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
    const { name, students } = body;

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required field: name' 
      }, { status: 400 });
    }

    // まず教師IDを取得
    const teacherQuery = `
      query GetTeacherByFirebaseUid($firebase_uid: String!) {
        teachers(where: { firebase_uid: { _eq: $firebase_uid } }) {
          id
        }
      }
    `;

    const teacherResult = await fetchGqlAPI(teacherQuery, { firebase_uid: firebaseUid });

    if (teacherResult.errors || !teacherResult.data.teachers.length) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    const teacherId = teacherResult.data.teachers[0].id;

    // クラスを作成
    const classQuery = `
      mutation CreateClass($name: String!, $teacher_id: bigint!, $uuid: bpchar!) {
        insert_classes_one(object: {
          name: $name,
          teacher_id: $teacher_id,
          uuid: $uuid
        }) {
          id
          name
          uuid
          created_at
        }
      }
    `;

    const classUuid = `class-${Date.now()}`;
    const classResult = await fetchGqlAPI(classQuery, {
      name: name,
      teacher_id: teacherId,
      uuid: classUuid
    });

    if (classResult.errors) {
      console.error('GraphQL errors:', classResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to create class' }, { status: 500 });
    }

    const newClass = classResult.data.insert_classes_one;

    // 生徒データがあれば追加
    if (students && Array.isArray(students)) {
      const studentsToInsert = students.map(student => ({
        class_id: newClass.id,
        student_no: student.student_no,
        name: student.name,
        sex: student.sex,
        memo: student.memo || null
      }));

      const studentsQuery = `
        mutation InsertStudents($students: [students_insert_input!]!) {
          insert_students(objects: $students) {
            affected_rows
          }
        }
      `;

      const studentsResult = await fetchGqlAPI(studentsQuery, {
        students: studentsToInsert
      });

      if (studentsResult.errors) {
        console.error('GraphQL errors when inserting students:', studentsResult.errors);
        // クラスは作成されたが、生徒の追加に失敗した場合は警告として扱う
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        class: newClass 
      } 
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
