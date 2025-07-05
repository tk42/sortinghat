import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// GET /api/chat/classes/[id]/surveys
// 指定されたクラスのアンケート一覧を返す
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/chat/classes/[id]/surveys - Starting');
    console.log('Class ID from params:', params.id);
    
    const sessionCookie = request.cookies.get('auth-token')?.value;
    console.log('Session cookie exists:', !!sessionCookie);
    
    if (!sessionCookie) {
      console.log('No session cookie found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Firebase セッションクッキーを検証し、uid を取得
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const firebaseUid = decoded.uid;
    console.log('Firebase UID:', firebaseUid);

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      console.log('Invalid class ID:', params.id);
      return NextResponse.json({ success: false, error: 'Invalid class ID' }, { status: 400 });
    }
    console.log('Parsed class ID:', classId);

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

    console.log('Class query result:', JSON.stringify(classResult, null, 2));

    if (classResult.errors || !classResult.data.classes.length) {
      console.log('Class not found or access denied');
      return NextResponse.json({ success: false, error: 'Class not found or access denied' }, { status: 404 });
    }

    // GraphQL でアンケート一覧を取得
    const surveysQuery = `
      query GetSurveysByClassId($class_id: bigint!) {
        surveys(where: { class_id: { _eq: $class_id } }, order_by: { created_at: desc }) {
          id
          name
          status
          class_id
          created_at
          updated_at
          class {
            id
            name
          }
          student_preferences_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `;

    console.log('Fetching surveys for class ID:', classId);
    const surveysResult = await fetchGqlAPI(surveysQuery, { class_id: classId });

    console.log('Surveys query result:', JSON.stringify(surveysResult, null, 2));

    if (surveysResult.errors) {
      console.error('GraphQL errors:', surveysResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to fetch surveys' }, { status: 500 });
    }

    const surveys = surveysResult.data.surveys || [];
    console.log('Found surveys count:', surveys.length);
    console.log('Surveys list:', JSON.stringify(surveys, null, 2));

    return NextResponse.json({ 
      success: true, 
      data: { 
        surveys: surveys
      } 
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}