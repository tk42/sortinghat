import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// POST /api/chat/student-preferences
// 新しい選好データを追加
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
    const { 
      survey_id, student_id, student_no, mi_a, mi_b, mi_c, mi_d, mi_e, mi_f, mi_g, mi_h, 
      leader, eyesight, student_dislikes 
    } = body;

    if (!survey_id || (!student_id && !student_no) || mi_a === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Use student_id if provided, otherwise find student by student_no
    let actualStudentId = student_id;
    if (!actualStudentId && student_no) {
      // Need to find student_id from student_no - this requires a separate query
      const studentQuery = `
        query FindStudentByNo($survey_id: bigint!, $student_no: Int!) {
          surveys(where: { id: { _eq: $survey_id } }) {
            class {
              students(where: { student_no: { _eq: $student_no } }) {
                id
              }
            }
          }
        }
      `;
      
      const studentResult = await fetchGqlAPI(studentQuery, { 
        survey_id: survey_id, 
        student_no: student_no 
      });
      
      if (studentResult.errors || !studentResult.data.surveys[0]?.class?.students[0]) {
        return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
      }
      
      actualStudentId = studentResult.data.surveys[0].class.students[0].id;
    }

    // まずアンケートが教師のものかを確認
    const surveyQuery = `
      query GetSurveyOwnership($survey_id: bigint!, $firebase_uid: String!) {
        surveys(where: { 
          id: { _eq: $survey_id }, 
          class: { teacher: { firebase_uid: { _eq: $firebase_uid } } } 
        }) {
          id
          name
        }
      }
    `;

    const surveyResult = await fetchGqlAPI(surveyQuery, { 
      survey_id: survey_id, 
      firebase_uid: firebaseUid 
    });

    if (surveyResult.errors || !surveyResult.data.surveys.length) {
      return NextResponse.json({ success: false, error: 'Survey not found or access denied' }, { status: 404 });
    }

    // 選好データを追加
    const insertQuery = `
      mutation InsertStudentPreference(
        $survey_id: bigint!, $student_id: bigint!, $previous_team: bigint!,
        $mi_a: Int!, $mi_b: Int!, $mi_c: Int!, $mi_d: Int!, 
        $mi_e: Int!, $mi_f: Int!, $mi_g: Int!, $mi_h: Int!, 
        $leader: Int!, $eyesight: Int!
      ) {
        insert_student_preferences_one(object: {
          survey_id: $survey_id,
          student_id: $student_id,
          previous_team: $previous_team,
          mi_a: $mi_a,
          mi_b: $mi_b,
          mi_c: $mi_c,
          mi_d: $mi_d,
          mi_e: $mi_e,
          mi_f: $mi_f,
          mi_g: $mi_g,
          mi_h: $mi_h,
          leader: $leader,
          eyesight: $eyesight
        }) {
          id
          student {
            id
            student_no
            name
            sex
          }
          survey {
            id
            name
          }
          previous_team
          mi_a
          mi_b
          mi_c
          mi_d
          mi_e
          mi_f
          mi_g
          mi_h
          leader
          eyesight
          created_at
        }
      }
    `;

    const insertResult = await fetchGqlAPI(insertQuery, {
      survey_id: survey_id,
      student_id: actualStudentId,
      previous_team: 0, // Default to 0 for new preferences
      mi_a: mi_a,
      mi_b: mi_b,
      mi_c: mi_c,
      mi_d: mi_d,
      mi_e: mi_e,
      mi_f: mi_f,
      mi_g: mi_g,
      mi_h: mi_h,
      leader: leader,
      eyesight: eyesight
    });

    if (insertResult.errors) {
      console.error('GraphQL errors:', insertResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to create student preference' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        student_preference: insertResult.data.insert_student_preferences_one 
      } 
    });
  } catch (error) {
    console.error('Error creating student preference:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}