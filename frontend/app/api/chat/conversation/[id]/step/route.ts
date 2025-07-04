import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// Update conversation step
export async function PUT(
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

    const { step } = await request.json();
    if (!step) {
      return NextResponse.json({ 
        success: false, 
        error: 'Step is required' 
      }, { status: 400 });
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie);

    // Update conversation step
    const mutation = `
      mutation UpdateConversationStep($id: bigint!) {
        update_conversations_by_pk(
          pk_columns: { id: $id },
          _set: { 
            updated_at: "now()" 
          }
        ) {
          id
          updated_at
        }
      }
    `;

    const result = await fetchGqlAPI(mutation, { id: conversationId });

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update conversation step' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation: result.data.update_conversations_by_pk
      }
    });

  } catch (error) {
    console.error('Error updating conversation step:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}