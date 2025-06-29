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

    const { job_id, modifications } = await request.json();
    if (!job_id || !modifications) {
      return NextResponse.json({ 
        success: false, 
        error: 'job_id and modifications are required' 
      }, { status: 400 });
    }

    // Get job details
    const getJobQuery = `
      query GetJob($id: bigint!) {
        file_processing_jobs_by_pk(id: $id) {
          id
          conversation_id
          original_name
          result_data
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

    // Apply modifications to converted data
    const modifiedData = applyModifications(
      job.result_data.conversion_diff?.converted || [],
      modifications
    );

    // Update the job result data with modifications
    const updatedResultData = {
      ...job.result_data,
      conversion_diff: {
        ...job.result_data.conversion_diff,
        converted: modifiedData,
        modified: true,
        modifications_applied: modifications,
        modified_at: new Date().toISOString()
      }
    };

    const updateJobMutation = `
      mutation UpdateJobModified($id: bigint!, $result_data: jsonb!) {
        update_file_processing_jobs_by_pk(
          pk_columns: { id: $id },
          _set: { 
            result_data: $result_data,
            updated_at: "now()" 
          }
        ) {
          id
          result_data
        }
      }
    `;

    await fetchGqlAPI(updateJobMutation, { 
      id: job_id, 
      result_data: updatedResultData 
    });

    // Add modification confirmation message to conversation
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

    const modificationCount = Object.keys(modifications).length;
    await fetchGqlAPI(addMessageMutation, {
      conversation_id: job.conversation_id,
      content: `ファイル「${job.original_name}」に ${modificationCount} 件の修正を適用しました。この内容で処理を続行しますか？`,
      metadata: {
        conversion_modified: true,
        job_id: job_id,
        modification_count: modificationCount,
        actions: [
          { label: 'この内容で続行', action: 'confirm_conversion' },
          { label: 'さらに修正', action: 'modify_more' },
          { label: 'やり直し', action: 'reject_conversion' }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Modifications applied successfully',
        modified_data: modifiedData,
        modification_count: modificationCount
      }
    });

  } catch (error) {
    console.error('Error modifying conversion:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function applyModifications(originalData: any[], modifications: Record<string, any>): any[] {
  // Deep clone the original data
  const modifiedData = JSON.parse(JSON.stringify(originalData));
  
  // Apply each modification
  Object.entries(modifications).forEach(([key, value]) => {
    // Key format: "rowIndex.fieldName" (e.g., "0.name", "1.student_no")
    const [rowIndexStr, fieldName] = key.split('.');
    const rowIndex = parseInt(rowIndexStr);
    
    if (!isNaN(rowIndex) && rowIndex < modifiedData.length && fieldName) {
      // Apply the modification
      modifiedData[rowIndex][fieldName] = value;
      
      // Add modification metadata
      if (!modifiedData[rowIndex]._modifications) {
        modifiedData[rowIndex]._modifications = {};
      }
      modifiedData[rowIndex]._modifications[fieldName] = {
        original_value: originalData[rowIndex][fieldName],
        modified_value: value,
        modified_at: new Date().toISOString()
      };
    }
  });
  
  return modifiedData;
}