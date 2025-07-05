import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/utils/firebase/admin'
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI'

// GET /api/chat/surveys/[id]/results
// 指定されたアンケートの最適化結果（最新）を返す
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    const firebaseUid = decoded.uid

    const surveyId = parseInt(params.id)
    if (isNaN(surveyId)) {
      return NextResponse.json({ success: false, error: 'Invalid survey ID' }, { status: 400 })
    }

    // 所有権チェック
    const surveyQuery = `
      query GetSurveyOwnership($survey_id: bigint!, $firebase_uid: String!) {
        surveys(where: {
          id: { _eq: $survey_id },
          class: { teacher: { firebase_uid: { _eq: $firebase_uid } } }
        }) {
          id
        }
      }
    `
    const surveyResult = await fetchGqlAPI(surveyQuery, { survey_id: surveyId, firebase_uid: firebaseUid })
    if (surveyResult.errors || !surveyResult.data.surveys.length) {
      return NextResponse.json(
        { success: false, error: 'Survey not found or access denied' },
        { status: 404 }
      )
    }

    // 最適化結果を取得 (最新1件)
    const resultsQuery = `
      query GetMatchingResults($survey_id: bigint!) {
        matching_results(
          where: { survey_id: { _eq: $survey_id } }
          order_by: { created_at: desc }
        ) {
          id
          survey_id
          name
          status
          constraints_json
          created_at
          updated_at
          teams {
            team_id
            name
            student_preference {
              student {
                id
                student_no
                name
                sex
              }
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
            }
          }
        }
      }
    `
    const resultsResult = await fetchGqlAPI(resultsQuery, { survey_id: surveyId })
    if (resultsResult.errors) {
      console.error('GraphQL errors:', resultsResult.errors)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch matching results' },
        { status: 500 }
      )
    }

    const list = resultsResult.data.matching_results || []
    return NextResponse.json({ success: true, data: { matchingResults: list } })
  } catch (error) {
    console.error('Error fetching matching results:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}