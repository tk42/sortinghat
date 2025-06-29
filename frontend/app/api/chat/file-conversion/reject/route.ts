import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await auth.verifySessionCookie(sessionCookie);

    const { job_id } = await request.json();
    if (!job_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'job_id is required' 
      }, { status: 400 });
    }

    // Get job details
    const getJobQuery = `
      query GetJob($id: bigint!) {
        file_processing_jobs_by_pk(id: $id) {
          id
          conversation_id
          original_name
          file_path
        }
      }
    `;

    const jobResult = await fetchGqlAPI(getJobQuery, { id: job_id });
    const job = jobResult.data?.file_processing_jobs_by_pk;

    if (!job) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job not found' 
      }, { status: 404 });
    }

    // Mark job as rejected and reset to pending for retry
    const updateJobMutation = `
      mutation UpdateJobRejected($id: bigint!) {
        update_file_processing_jobs_by_pk(
          pk_columns: { id: $id },
          _set: { 
            status: "pending",
            progress: 0,
            result_data: { rejected: true, retry_requested: true },
            updated_at: "now()" 
          }
        ) {
          id
          status
        }
      }
    `;

    await fetchGqlAPI(updateJobMutation, { id: job_id });

    // Add rejection message to conversation
    const addMessageMutation = `
      mutation AddMessage($conversation_id: bigint!, $content: String!, $metadata: jsonb!) {
        insert_chat_messages_one(object: {
          conversation_id: $conversation_id,
          message_type: "system",
          content: $content,
          metadata: $metadata
        }) {
          id
        }
      }
    `;

    await fetchGqlAPI(addMessageMutation, {
      conversation_id: job.conversation_id,
      content: `ファイル「${job.original_name}」の変換をやり直します。再度ファイルをアップロードするか、別のファイルを選択してください。`,
      metadata: {
        conversion_rejected: true,
        job_id: job_id,
        actions: [
          { label: 'ファイルを再アップロード', action: 'upload_file' },
          { label: '手動でデータ入力', action: 'manual_input' }
        ]
      }
    });

    // Optionally restart processing with different parameters
    // This could trigger LLM reprocessing with different prompts or settings

    return NextResponse.json({
      success: true,
      data: {
        message: 'Conversion rejected, ready for retry'
      }
    });

  } catch (error) {
    console.error('Error rejecting conversion:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}