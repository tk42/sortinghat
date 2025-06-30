import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// GET /api/chat/surveys/[id]/preferences
// 指定されたアンケートの選好データ一覧を返す
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

    const surveyId = parseInt(params.id);
    if (isNaN(surveyId)) {
      return NextResponse.json({ success: false, error: 'Invalid survey ID' }, { status: 400 });
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
      survey_id: surveyId, 
      firebase_uid: firebaseUid 
    });

    if (surveyResult.errors || !surveyResult.data.surveys.length) {
      return NextResponse.json({ success: false, error: 'Survey not found or access denied' }, { status: 404 });
    }

    // GraphQL で選好データ一覧を取得
    const preferencesQuery = `
      query GetStudentPreferencesBySurveyId($survey_id: bigint!) {
        student_preferences(where: { survey_id: { _eq: $survey_id } }, order_by: { created_at: desc }) {
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
          student_dislikes {
            student_id
          }
          created_at
        }
      }
    `;

    const preferencesResult = await fetchGqlAPI(preferencesQuery, { survey_id: surveyId });

    if (preferencesResult.errors) {
      console.error('GraphQL errors:', preferencesResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to fetch student preferences' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        student_preferences: preferencesResult.data.student_preferences || [] 
      } 
    });
  } catch (error) {
    console.error('Error fetching student preferences:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}