import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// PUT /api/chat/student-preferences/[id]
// 選好データを更新
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

    const preferenceId = parseInt(params.id);
    if (isNaN(preferenceId)) {
      return NextResponse.json({ success: false, error: 'Invalid preference ID' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      student_id, student_no, mi_a, mi_b, mi_c, mi_d, mi_e, mi_f, mi_g, mi_h, 
      leader, eyesight, student_dislikes, previous_team 
    } = body;

    // まず選好データが教師のアンケートに属しているかを確認
    const ownershipQuery = `
      query CheckPreferenceOwnership($preference_id: bigint!, $firebase_uid: String!) {
        student_preferences(where: { 
          id: { _eq: $preference_id },
          survey: { class: { teacher: { firebase_uid: { _eq: $firebase_uid } } } }
        }) {
          id
          survey_id
        }
      }
    `;

    const ownershipResult = await fetchGqlAPI(ownershipQuery, { 
      preference_id: preferenceId, 
      firebase_uid: firebaseUid 
    });

    if (ownershipResult.errors || !ownershipResult.data.student_preferences.length) {
      return NextResponse.json({ success: false, error: 'Preference not found or access denied' }, { status: 404 });
    }

    // 選好データを更新
    const updateQuery = `
      mutation UpdateStudentPreference(
        $preference_id: bigint!, $student_id: bigint!, $previous_team: bigint!,
        $mi_a: Int!, $mi_b: Int!, $mi_c: Int!, $mi_d: Int!, 
        $mi_e: Int!, $mi_f: Int!, $mi_g: Int!, $mi_h: Int!, 
        $leader: Int!, $eyesight: Int!
      ) {
        update_student_preferences_by_pk(pk_columns: { id: $preference_id }, _set: {
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

    const updateResult = await fetchGqlAPI(updateQuery, {
      preference_id: preferenceId,
      student_id: student_id || 0, // If not provided, will need to be handled
      previous_team: previous_team || 0,
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

    if (updateResult.errors) {
      console.error('GraphQL errors:', updateResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to update student preference' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        student_preference: updateResult.data.update_student_preferences_by_pk 
      } 
    });
  } catch (error) {
    console.error('Error updating student preference:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chat/student-preferences/[id]
// 選好データを削除
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

    const preferenceId = parseInt(params.id);
    if (isNaN(preferenceId)) {
      return NextResponse.json({ success: false, error: 'Invalid preference ID' }, { status: 400 });
    }

    // まず選好データが教師のアンケートに属しているかを確認
    const ownershipQuery = `
      query CheckPreferenceOwnership($preference_id: bigint!, $firebase_uid: String!) {
        student_preferences(where: { 
          id: { _eq: $preference_id },
          survey: { class: { teacher: { firebase_uid: { _eq: $firebase_uid } } } }
        }) {
          id
          survey_id
        }
      }
    `;

    const ownershipResult = await fetchGqlAPI(ownershipQuery, { 
      preference_id: preferenceId, 
      firebase_uid: firebaseUid 
    });

    if (ownershipResult.errors || !ownershipResult.data.student_preferences.length) {
      return NextResponse.json({ success: false, error: 'Preference not found or access denied' }, { status: 404 });
    }

    // 選好データを削除
    const deleteQuery = `
      mutation DeleteStudentPreference($preference_id: bigint!) {
        delete_student_preferences_by_pk(id: $preference_id) {
          id
        }
      }
    `;

    const deleteResult = await fetchGqlAPI(deleteQuery, {
      preference_id: preferenceId
    });

    if (deleteResult.errors) {
      console.error('GraphQL errors:', deleteResult.errors);
      return NextResponse.json({ success: false, error: 'Failed to delete student preference' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        deleted_id: preferenceId 
      } 
    });
  } catch (error) {
    console.error('Error deleting student preference:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}