import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// Get last active conversation for teacher
export async function GET(
  request: NextRequest,
  { params }: { params: { teacher_id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const teacherId = parseInt(params.teacher_id);
    if (isNaN(teacherId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid teacher ID' 
      }, { status: 400 });
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie);

    // Fetch last active conversation
    const query = `
      query GetLastConversation($teacher_id: bigint!) {
        conversations(
          where: {
            teacher_id: {_eq: $teacher_id}, 
            is_active: {_eq: true}
          }, 
          order_by: {updated_at: desc}, 
          limit: 1
        ) {
          id
          teacher_id
          session_id
          context_data
          is_active
          created_at
          updated_at
        }
      }
    `;

    const result = await fetchGqlAPI(query, { teacher_id: teacherId });

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch last conversation' 
      }, { status: 500 });
    }

    const conversation = result.data.conversations[0];
    if (!conversation) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active conversation found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation
      }
    });

  } catch (error) {
    console.error('Error fetching last conversation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}