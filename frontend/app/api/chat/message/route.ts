import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

// Send message in conversation
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie);

    const formData = await request.formData();
    const conversationId = parseInt(formData.get('conversation_id') as string);
    const content = formData.get('content') as string;
    const messageType = formData.get('message_type') as string || 'user';
    const file = formData.get('file') as File | null;

    if (isNaN(conversationId) || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'conversation_id and content are required' 
      }, { status: 400 });
    }

    // Store user message
    const userMessageMutation = `
      mutation CreateMessage($conversation_id: bigint!, $message_type: String!, $content: String!, $metadata: jsonb!) {
        insert_chat_messages_one(object: {
          conversation_id: $conversation_id,
          message_type: $message_type,
          content: $content,
          metadata: $metadata
        }) {
          id
          conversation_id
          message_type
          content
          metadata
          created_at
        }
      }
    `;

    const metadata: any = {};
    if (file) {
      // Handle file upload (simplified for now)
      metadata.file_references = [file.name];
    }

    const userMessageResult = await fetchGqlAPI(userMessageMutation, {
      conversation_id: conversationId,
      message_type: messageType,
      content,
      metadata
    });

    if (userMessageResult.errors) {
      console.error('GraphQL errors:', userMessageResult.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save message' 
      }, { status: 500 });
    }

    // Generate AI response (simplified for now)
    const aiResponse = await generateAIResponse(content, conversationId);
    
    // Store AI response
    const aiMessageResult = await fetchGqlAPI(userMessageMutation, {
      conversation_id: conversationId,
      message_type: 'assistant',
      content: aiResponse.content,
      metadata: aiResponse.metadata || {}
    });

    // Fetch all messages for this conversation
    const messagesQuery = `
      query GetMessages($conversation_id: bigint!) {
        chat_messages(
          where: {conversation_id: {_eq: $conversation_id}}, 
          order_by: {created_at: asc}
        ) {
          id
          conversation_id
          message_type
          content
          metadata
          created_at
        }
      }
    `;

    const messagesResult = await fetchGqlAPI(messagesQuery, { 
      conversation_id: conversationId 
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messagesResult.data.chat_messages
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Simplified AI response generation (placeholder)
async function generateAIResponse(userMessage: string, conversationId: number) {
  // This is a placeholder - in a real implementation, this would:
  // 1. Fetch conversation context and current step
  // 2. Use the appropriate prompt template
  // 3. Call LLM API (OpenAI, etc.)
  // 4. Process the response and extract actions/metadata
  
  const responses = {
    default: "こんにちは！班分け最適化のお手伝いをさせていただきます。まずはクラス情報を設定しましょう。",
    class: "クラス情報を設定していただき、ありがとうございます。次にアンケートを作成しましょう。",
    survey: "アンケートの準備ができました。制約条件を設定してください。",
    constraints: "制約条件を確認しました。最適化を実行しますか？",
    optimization: "最適化が完了しました！結果をご確認ください。"
  };

  // Simple keyword-based response selection
  let responseKey = 'default';
  if (userMessage.includes('クラス')) responseKey = 'class';
  else if (userMessage.includes('アンケート')) responseKey = 'survey';
  else if (userMessage.includes('制約')) responseKey = 'constraints';
  else if (userMessage.includes('最適化')) responseKey = 'optimization';

  return {
    content: responses[responseKey as keyof typeof responses],
    metadata: {
      step_indicator: {
        current: 1,
        total: 5,
        step_name: 'クラス設定'
      }
    }
  };
}