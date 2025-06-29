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
          result_data
          status
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

    if (job.status !== 'completed') {
      return NextResponse.json({ 
        success: false, 
        error: 'Job is not completed' 
      }, { status: 400 });
    }

    // Mark conversion as confirmed
    const updateJobMutation = `
      mutation UpdateJobConfirmed($id: bigint!) {
        update_file_processing_jobs_by_pk(
          pk_columns: { id: $id },
          _set: { 
            result_data: { confirmed: true },
            updated_at: "now()" 
          }
        ) {
          id
          result_data
        }
      }
    `;

    await fetchGqlAPI(updateJobMutation, { id: job_id });

    // Process the confirmed data (create student records, etc.)
    if (job.result_data.conversion_diff?.converted) {
      await processConfirmedData(job.conversation_id, job.result_data.conversion_diff.converted);
    }

    // Add confirmation message to conversation
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
      content: `ファイル「${job.original_name}」の変換が確定されました。データを処理しています...`,
      metadata: {
        conversion_confirmed: true,
        job_id: job_id,
        next_actions: [
          { label: '制約条件を設定', action: 'set_constraints' },
          { label: '最適化を実行', action: 'run_optimization' }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Conversion confirmed successfully'
      }
    });

  } catch (error) {
    console.error('Error confirming conversion:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function processConfirmedData(conversationId: number, convertedData: any[]): Promise<void> {
  try {
    // Get conversation context to determine class/survey
    const getConversationQuery = `
      query GetConversation($id: bigint!) {
        conversations_by_pk(id: $id) {
          id
          context_data
          current_step
        }
      }
    `;

    const conversationResult = await fetchGqlAPI(getConversationQuery, { id: conversationId });
    const conversation = conversationResult.data?.conversations_by_pk;

    if (!conversation) return;

    // Extract class_id and survey_id from context
    const classId = conversation.context_data?.class_id;
    const surveyId = conversation.context_data?.survey_id;

    if (!classId || !surveyId) {
      console.warn('Missing class_id or survey_id in conversation context');
      return;
    }

    // Process student data
    for (const studentData of convertedData) {
      // Create or update student record
      const upsertStudentMutation = `
        mutation UpsertStudent(
          $student_no: Int!,
          $name: String!,
          $sex: Int!,
          $class_id: bigint!,
          $memo: String
        ) {
          insert_students_one(
            object: {
              student_no: $student_no,
              name: $name,
              sex: $sex,
              class_id: $class_id,
              memo: $memo
            },
            on_conflict: {
              constraint: students_student_no_class_id_key,
              update_columns: [name, sex, memo, updated_at]
            }
          ) {
            id
            student_no
            name
          }
        }
      `;

      const studentResult = await fetchGqlAPI(upsertStudentMutation, {
        student_no: parseInt(studentData.student_no),
        name: studentData.name,
        sex: parseInt(studentData.sex),
        class_id: classId,
        memo: studentData.memo || null
      });

      const studentId = studentResult.data?.insert_students_one?.id;

      // If this is survey response data, create student preferences
      if (studentId && studentData.mi_a !== undefined) {
        const upsertPreferencesMutation = `
          mutation UpsertStudentPreferences(
            $student_id: bigint!,
            $survey_id: bigint!,
            $previous_team: Int!,
            $mi_a: Int!, $mi_b: Int!, $mi_c: Int!, $mi_d: Int!,
            $mi_e: Int!, $mi_f: Int!, $mi_g: Int!, $mi_h: Int!,
            $leader: Int!, $eyesight: Int!
          ) {
            insert_student_preferences_one(
              object: {
                student_id: $student_id,
                survey_id: $survey_id,
                previous_team: $previous_team,
                mi_a: $mi_a, mi_b: $mi_b, mi_c: $mi_c, mi_d: $mi_d,
                mi_e: $mi_e, mi_f: $mi_f, mi_g: $mi_g, mi_h: $mi_h,
                leader: $leader, eyesight: $eyesight
              },
              on_conflict: {
                constraint: student_preferences_student_id_survey_id_key,
                update_columns: [
                  previous_team, mi_a, mi_b, mi_c, mi_d, mi_e, mi_f, mi_g, mi_h,
                  leader, eyesight, updated_at
                ]
              }
            ) {
              id
            }
          }
        `;

        await fetchGqlAPI(upsertPreferencesMutation, {
          student_id: studentId,
          survey_id: surveyId,
          previous_team: parseInt(studentData.previous_team) || 0,
          mi_a: parseInt(studentData.mi_a) || 1,
          mi_b: parseInt(studentData.mi_b) || 1,
          mi_c: parseInt(studentData.mi_c) || 1,
          mi_d: parseInt(studentData.mi_d) || 1,
          mi_e: parseInt(studentData.mi_e) || 1,
          mi_f: parseInt(studentData.mi_f) || 1,
          mi_g: parseInt(studentData.mi_g) || 1,
          mi_h: parseInt(studentData.mi_h) || 1,
          leader: parseInt(studentData.leader) || 1,
          eyesight: parseInt(studentData.eyesight) || 1
        });
      }
    }

    // Update conversation context to mark data as processed
    const updateContextMutation = `
      mutation UpdateConversationContext($id: bigint!, $context_data: jsonb!) {
        update_conversations_by_pk(
          pk_columns: { id: $id },
          _set: { 
            context_data: $context_data,
            current_step: "constraint_setting",
            updated_at: "now()" 
          }
        ) {
          id
          current_step
        }
      }
    `;

    const updatedContext = {
      ...conversation.context_data,
      data_processed: true,
      student_count: convertedData.length,
      processed_at: new Date().toISOString()
    };

    await fetchGqlAPI(updateContextMutation, {
      id: conversationId,
      context_data: updatedContext
    });

  } catch (error) {
    console.error('Error processing confirmed data:', error);
    throw error;
  }
}