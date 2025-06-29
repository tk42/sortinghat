import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// Get conversation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = parseInt(params.id);
    if (isNaN(conversationId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid conversation ID' 
      }, { status: 400 });
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie);

    // Fetch conversation and messages
    const query = `
      query GetConversation($id: bigint!) {
        conversations_by_pk(id: $id) {
          id
          teacher_id
          session_id
          current_step
          context_data
          is_active
          created_at
          updated_at
        }
        chat_messages(where: {conversation_id: {_eq: $id}}, order_by: {created_at: asc}) {
          id
          conversation_id
          message_type
          content
          metadata
          created_at
        }
      }
    `;

    const result = await fetchGqlAPI(query, { id: conversationId });

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch conversation' 
      }, { status: 500 });
    }

    if (!result.data.conversations_by_pk) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation: result.data.conversations_by_pk,
        messages: result.data.chat_messages
      }
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}