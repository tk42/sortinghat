import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// Create new conversation
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { teacher_id, session_id } = await request.json();

    if (!teacher_id || !session_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'teacher_id and session_id are required' 
      }, { status: 400 });
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie);

    // Create conversation in database
    const conversationMutation = `
      mutation CreateConversation($teacher_id: bigint!, $session_id: String!) {
        insert_conversations_one(object: {
          teacher_id: $teacher_id,
          session_id: $session_id,
          is_active: true
        }) {
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

    const conversationResult = await fetchGqlAPI(conversationMutation, {
      teacher_id,
      session_id
    });

    if (!conversationResult.errors) {
      // CreateConversation が成功したら Teacher に last_conversation_id を保存
      const conversationId = conversationResult.insert_conversations_one?.id ?? conversationResult.data?.insert_conversations_one?.id;
      if (conversationId) {
        const updateTeacherMutation = `
          mutation UpdateTeacherLastConversation($teacher_id: bigint!, $conversation_id: bigint!) {
            update_teachers_by_pk(pk_columns: {id: $teacher_id}, _set: { last_conversation_id: $conversation_id }) {
              id
              last_conversation_id
            }
          }
        `;
        // エラーは無視して続行（会話自体は作成済みなのでユーザに影響を与えない）
        await fetchGqlAPI(updateTeacherMutation, {
          teacher_id,
          conversation_id: conversationId,
        });
      }
    }

    if (conversationResult.errors) {
      console.error('GraphQL errors:', conversationResult.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create conversation' 
      }, { status: 500 });
    }

    // フロントで teacher の last_conversation_id を再取得するまでは
    // authState.teacher に反映されないが、API レスポンスにも含めておくと便利
    return NextResponse.json({
      success: true,
      data: {
        conversation: conversationResult.data.insert_conversations_one,
        last_conversation_id: conversationResult.data.insert_conversations_one.id
      }
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}