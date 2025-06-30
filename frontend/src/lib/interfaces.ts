export type MIScore = [number, number, number, number, number, number, number, number]

export interface School {
    id: number;
    name: string;
    postal_code: string;
    prefecture: string;
    city: string;
    address: string;
}

export interface Teacher {
    id: number;
    firebase_uid: string;
    name: string;
    email: string;
    stripe_id?: string;
    // 最後に開いた会話ID。履歴再開用
    last_conversation_id?: number | null;
    school?: School;
    created_at: string;
    updated_at: string;
}

export interface Class {
    id: number;
    name: string;
    uuid: string;
    teacher?: Teacher;
    students?: Student[];
    surveys?: Survey[];
    created_at: string;
}

export interface Student {
    id: number;
    student_no: number;
    name: string;
    sex: number;
    memo?: string;
    class: Class;
}

export interface DashboardStudent extends Omit<Student, 'class'> {
    class_id: string;
    created_at: string;
    updated_at: string;
}

export interface Survey {
    id: number;
    name: string;
    status: number;
    class: Class;
    class_id: number;
    student_preferences?: StudentPreference[];
    created_at?: string;
    updated_at?: string;
    teams?: Team[];
}

export interface Team {
    id?: number;
    team_id: number;
    name: string;
    survey?: Survey;
    student_preferences?: StudentPreference[];
}

export interface StudentDislike {
    id?: number;
    student_id: number;
    preference_id?: number;
}

export interface StudentPreference {
    id: number;
    student?: Student; // Optional for compatibility with both nested and flat structures
    student_no?: number; // For backward compatibility
    survey?: Survey;
    team?: Team;  // 未使用？
    previous_team: number;
    mi_a: number;
    mi_b: number;
    mi_c: number;
    mi_d: number;
    mi_e: number;
    mi_f: number;
    mi_g: number;
    mi_h: number;
    leader: number;
    eyesight: number;
    student_dislikes?: StudentDislike[] | string; // Support both formats
    created_at: string;
    updated_at?: string;
}

export interface Price {
    id: string;
    product: string;
    unit_amount: number;
    currency: string;
    recurring: {
        interval: string;
    };
}

export interface PaymentHistory {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
}

export interface Subscription {
    id: string;
    status: string;
    current_period_end: number;
    pause_collection?: {
        behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
    };
}

export interface Constraint {
    max_num_teams?: number;
    members_per_team?: number;
    at_least_one_pair_sex: boolean;
    girl_geq_boy: boolean;
    boy_geq_girl: boolean;
    at_least_one_leader: boolean;
    unique_previous?: number;
    group_diff_coeff?: number;
}

export interface MatchingResult {
    id: number;
    survey_id: number;
    survey: Survey;
    name: string;
    status: number;
    teams: Team[];
    created_at: string;
    updated_at: string;
}

export interface MatchingResultWithTeams extends MatchingResult {
    survey: {
        id: number;
        name: string;
        status: number;
        class: {
            id: number;
            name: string;
            uuid: string;
            teacher: Teacher;
            students: Student[];
            surveys: Survey[];
            created_at: string;
        };
        class_id: number;
        student_preferences?: StudentPreference[];
        created_at?: string;
        updated_at?: string;
        teams?: Team[];
    };
    teams: Array<Team & {
        student_preference: {
            student: {
                id: number;
                student_no: number;
                name: string;
                sex: number;
            };
            mi_a: number;
            mi_b: number;
            mi_c: number;
            mi_d: number;
            mi_e: number;
            mi_f: number;
            mi_g: number;
            mi_h: number;
            leader: number;
            eyesight: number;
            student_dislikes: StudentDislike[];
        }
    }>;
}

// GraphQL Response Interfaces
export interface TeamResponse {
    data: {
        insert_teams: {
            returning: Team[]
            affected_rows: number
        }
    }
    errors?: Array<{ message: string }>
}

export interface MatchingResultResponse {
    data: {
        insert_matching_results_one: {
            id: number
        }
    }
    errors?: Array<{ message: string }>
}

export interface StudentPreferencesResponse {
    data: {
        student_preferences: {
            id: number
            student_id: number
        }[]
    }
    errors?: Array<{ message: string }>
}

// Chat and Conversation Interfaces - Updated for new UX flow
export type ConversationStep = 'initial' | 'class_setup' | 'survey_creation' | 'survey_setup' | 'constraint_setting' | 'optimization_execution' | 'result_confirmation';

export interface Conversation {
    id: number;
    teacher_id: number;
    session_id: string;
    current_step: ConversationStep;
    context_data: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type MessageType = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    id: number;
    conversation_id: number;
    message_type: MessageType;
    content: string;
    metadata: {
        step_indicator?: {
            current: number;
            total: number;
            step_name: string;
        };
        file_references?: string[];
        actions?: Array<{
            label: string;
            action: string;
            data?: any;
        }>;
        progress?: {
            current: number;
            total: number;
            status: string;
        };
    };
    created_at: string;
}

export type FileProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProcessingType = 'csv_import' | 'llm_conversion' | 'validation';

export interface FileProcessingJob {
    id: number;
    conversation_id: number;
    file_name: string;
    file_path: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    status: FileProcessingStatus;
    processing_type: ProcessingType;
    progress: number;
    result_data: {
        preview?: any[];
        validation_errors?: string[];
        conversion_diff?: {
            original: any[];
            converted: any[];
            changes: Array<{
                type: 'added' | 'removed' | 'modified';
                field: string;
                old_value?: any;
                new_value?: any;
            }>;
        };
    };
    error_message?: string;
    created_at: string;
    updated_at: string;
}

export type OptimizationJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface OptimizationJob {
    id: number;
    conversation_id: number;
    survey_id?: number;
    status: OptimizationJobStatus;
    progress: number;
    constraints_data: Constraint;
    result_data: {
        teams?: Team[];
        optimization_status?: string;
        objective_value?: number;
        computation_time?: number;
        feasibility_score?: number;
    };
    error_message?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export type PromptType = 'csv_conversion' | 'constraint_generation' | 'optimization_explanation';

export interface PromptVersion {
    id: number;
    prompt_type: PromptType;
    version: string;
    template: string;
    variables: Record<string, any>;
    metadata: {
        success_rate?: number;
        avg_processing_time?: number;
        user_satisfaction?: number;
        usage_count?: number;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ConversationStepRecord {
    id: number;
    conversation_id: number;
    step_name: string;
    started_at: string;
    completed_at?: string;
    step_data: Record<string, any>;
    success?: boolean;
    error_message?: string;
}

// Chat UI State Interfaces
export interface ChatState {
    conversation: Conversation | null;
    messages: ChatMessage[];
    isLoading: boolean;
    isTyping: boolean;
    currentStep: ConversationStep;
    fileProcessingJobs: FileProcessingJob[];
    optimizationJob: OptimizationJob | null;
    error: string | null;
}

export type ChatAction = 
    | { type: 'SET_CONVERSATION'; payload: Conversation }
    | { type: 'ADD_MESSAGE'; payload: ChatMessage }
    | { type: 'UPDATE_MESSAGES'; payload: ChatMessage[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_TYPING'; payload: boolean }
    | { type: 'SET_CURRENT_STEP'; payload: ConversationStep }
    | { type: 'UPDATE_FILE_JOB'; payload: FileProcessingJob }
    | { type: 'SET_OPTIMIZATION_JOB'; payload: OptimizationJob }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_CHAT' };

// File Upload Progress Interface
export interface FileUploadProgress {
    fileId: string;
    fileName: string;
    stage: 'uploading' | 'parsing' | 'llm_processing' | 'validation' | 'completed' | 'error';
    progress: number;
    error?: string;
    diffPreview?: {
        original: any[];
        converted: any[];
        changes: Array<{
            type: 'added' | 'removed' | 'modified';
            field: string;
            old_value?: any;
            new_value?: any;
        }>;
    };
}

// Chat API Response Interfaces
export interface ChatResponse {
    success: boolean;
    data?: {
        conversation?: Conversation;
        messages?: ChatMessage[];
        file_job?: FileProcessingJob;
        optimization_job?: OptimizationJob;
    };
    error?: string;
}

export interface SendMessageRequest {
    conversation_id?: number;
    content: string;
    message_type?: MessageType;
    file?: File;
    metadata?: Record<string, any>;
}