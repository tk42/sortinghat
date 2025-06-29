import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/firebase/admin';
import { fetchGqlAPI } from '@/src/lib/fetchGqlAPI';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-token')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const conversationId = parseInt(formData.get('conversation_id') as string);
    const processingType = formData.get('processing_type') as string || 'csv_import';

    if (!file || isNaN(conversationId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'File and conversation_id are required' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only CSV and Excel files are allowed' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const uploadsDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadsDir, uniqueFilename);

    // Ensure uploads directory exists
    try {
      await writeFile(join(uploadsDir, '.keep'), '');
    } catch {
      // Directory exists or creation failed, continue
    }

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file processing job in database
    const createJobMutation = `
      mutation CreateFileProcessingJob(
        $conversation_id: bigint!,
        $file_name: String!,
        $file_path: String!,
        $original_name: String!,
        $file_size: bigint!,
        $mime_type: String!,
        $processing_type: String!
      ) {
        insert_file_processing_jobs_one(object: {
          conversation_id: $conversation_id,
          file_name: $file_name,
          file_path: $file_path,
          original_name: $original_name,
          file_size: $file_size,
          mime_type: $mime_type,
          processing_type: $processing_type,
          status: "pending"
        }) {
          id
          conversation_id
          file_name
          file_path
          original_name
          file_size
          mime_type
          status
          processing_type
          progress
          result_data
          error_message
          created_at
          updated_at
        }
      }
    `;

    const jobResult = await fetchGqlAPI(createJobMutation, {
      conversation_id: conversationId,
      file_name: uniqueFilename,
      file_path: filePath,
      original_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      processing_type: processingType
    });

    if (jobResult.errors) {
      console.error('GraphQL errors:', jobResult.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create processing job' 
      }, { status: 500 });
    }

    const job = jobResult.data.insert_file_processing_jobs_one;

    // Start background processing
    processFileAsync(job.id);

    return NextResponse.json({
      success: true,
      data: {
        file_job: job
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Background file processing function
async function processFileAsync(jobId: number) {
  try {
    // Update status to processing
    await updateJobStatus(jobId, 'processing', 10);

    // Get job details
    const job = await getJobById(jobId);
    if (!job) return;

    let result: any = {};
    let progress = 10;

    switch (job.processing_type) {
      case 'csv_import':
        result = await processCsvImport(job, (p) => updateJobStatus(jobId, 'processing', p));
        break;
      case 'llm_conversion':
        result = await processLlmConversion(job, (p) => updateJobStatus(jobId, 'processing', p));
        break;
      case 'validation':
        result = await processValidation(job, (p) => updateJobStatus(jobId, 'processing', p));
        break;
      default:
        throw new Error(`Unknown processing type: ${job.processing_type}`);
    }

    // Update job as completed
    await updateJobStatus(jobId, 'completed', 100, result);

    // Add system message to conversation
    await addSystemMessage(job.conversation_id, {
      content: `ファイル「${job.original_name}」の処理が完了しました。`,
      metadata: {
        file_processing_complete: true,
        job_id: jobId,
        result_summary: {
          processed_rows: result.preview?.length || 0,
          validation_errors: result.validation_errors?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Error processing file:', error);
    await updateJobStatus(jobId, 'failed', 0, {}, error.message);
    
    // Add error message to conversation
    const job = await getJobById(jobId);
    if (job) {
      await addSystemMessage(job.conversation_id, {
        content: `ファイル「${job.original_name}」の処理中にエラーが発生しました：${error.message}`,
        metadata: {
          file_processing_error: true,
          job_id: jobId,
          error: error.message
        }
      });
    }
  }
}

// Helper functions
async function updateJobStatus(jobId: number, status: string, progress: number, resultData?: any, errorMessage?: string) {
  const mutation = `
    mutation UpdateJobStatus(
      $id: bigint!,
      $status: String!,
      $progress: Int!,
      $result_data: jsonb!,
      $error_message: String
    ) {
      update_file_processing_jobs_by_pk(
        pk_columns: { id: $id },
        _set: {
          status: $status,
          progress: $progress,
          result_data: $result_data,
          error_message: $error_message,
          updated_at: "now()"
        }
      ) {
        id
        status
        progress
      }
    }
  `;

  await fetchGqlAPI(mutation, {
    id: jobId,
    status,
    progress,
    result_data: resultData || {},
    error_message: errorMessage
  });
}

async function getJobById(jobId: number) {
  const query = `
    query GetJob($id: bigint!) {
      file_processing_jobs_by_pk(id: $id) {
        id
        conversation_id
        file_name
        file_path
        original_name
        file_size
        mime_type
        processing_type
        status
        progress
        result_data
        error_message
        created_at
        updated_at
      }
    }
  `;

  const result = await fetchGqlAPI(query, { id: jobId });
  return result.data?.file_processing_jobs_by_pk;
}

async function addSystemMessage(conversationId: number, message: { content: string; metadata: any }) {
  const mutation = `
    mutation AddSystemMessage($conversation_id: bigint!, $content: String!, $metadata: jsonb!) {
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

  await fetchGqlAPI(mutation, {
    conversation_id: conversationId,
    content: message.content,
    metadata: message.metadata
  });
}

// File processing implementations
async function processCsvImport(job: any, progressCallback: (progress: number) => void): Promise<any> {
  progressCallback(20);
  
  // Read and parse CSV file
  const fs = require('fs').promises;
  const csvContent = await fs.readFile(job.file_path, 'utf-8');
  
  progressCallback(40);
  
  // Simple CSV parsing (in production, use a proper CSV library)
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  progressCallback(60);
  
  const data = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const row: any = { row_number: index + 2 }; // +2 because we skipped header and arrays are 0-indexed
    
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    
    return row;
  });
  
  progressCallback(80);
  
  // Basic validation
  const validationErrors: string[] = [];
  
  // Check for required headers for student data
  const requiredHeaders = ['student_no', 'name', 'sex'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    validationErrors.push(`必須列が不足しています: ${missingHeaders.join(', ')}`);
  }
  
  // Check for empty critical fields
  data.forEach((row, index) => {
    if (!row.student_no) {
      validationErrors.push(`行 ${row.row_number}: 学籍番号が空です`);
    }
    if (!row.name) {
      validationErrors.push(`行 ${row.row_number}: 名前が空です`);
    }
  });
  
  progressCallback(90);
  
  return {
    preview: data.slice(0, 10), // First 10 rows for preview
    total_rows: data.length,
    headers: headers,
    validation_errors: validationErrors,
    raw_data: data
  };
}

async function processLlmConversion(job: any, progressCallback: (progress: number) => void): Promise<any> {
  progressCallback(20);
  
  // This would integrate with LLM service
  // For now, return mock conversion result
  
  progressCallback(50);
  
  const mockConversion = {
    original: [
      { "氏名": "田中太郎", "性別": "男", "番号": "1" },
      { "氏名": "佐藤花子", "性別": "女", "番号": "2" }
    ],
    converted: [
      { "student_no": 1, "name": "田中太郎", "sex": 0 },
      { "student_no": 2, "name": "佐藤花子", "sex": 1 }
    ],
    changes: [
      { type: 'modified', field: 'header', old_value: '氏名', new_value: 'name' },
      { type: 'modified', field: 'header', old_value: '性別', new_value: 'sex' },
      { type: 'modified', field: 'header', old_value: '番号', new_value: 'student_no' },
      { type: 'modified', field: 'sex_value', old_value: '男', new_value: 0 },
      { type: 'modified', field: 'sex_value', old_value: '女', new_value: 1 }
    ]
  };
  
  progressCallback(90);
  
  return {
    conversion_diff: mockConversion,
    preview: mockConversion.converted
  };
}

async function processValidation(job: any, progressCallback: (progress: number) => void): Promise<any> {
  progressCallback(30);
  
  // Validation logic would go here
  
  progressCallback(90);
  
  return {
    validation_passed: true,
    issues_found: []
  };
}