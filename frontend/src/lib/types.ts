import { z } from 'zod'

// Enums for better type safety
export enum StudentSex {
  MALE = 1,
  FEMALE = 2,
}

export enum ConversationStep {
  INITIAL = 'initial',
  CLASS_SETUP = 'class_setup',
  SURVEY_CREATION = 'survey_creation',
  SURVEY_SETUP = 'survey_setup',
  CONSTRAINT_SETTING = 'constraint_setting',
  OPTIMIZATION_EXECUTION = 'optimization_execution',
  RESULT_CONFIRMATION = 'result_confirmation',
}

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum SurveyStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  COMPLETED = 2,
}

export enum MatchingResultStatus {
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
}

// Zod schemas for runtime validation
export const MIScoreSchema = z.tuple([
  z.number().min(1).max(8),
  z.number().min(1).max(8),
  z.number().min(1).max(8),
  z.number().min(1).max(8),
  z.number().min(1).max(8),
  z.number().min(1).max(8),
  z.number().min(1).max(8),
  z.number().min(1).max(8),
])

export const SchoolSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  postal_code: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
})

export const TeacherSchema = z.object({
  id: z.number(),
  firebase_uid: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  stripe_id: z.string().optional(),
  last_conversation_id: z.number().nullable().optional(),
  school: SchoolSchema.optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ClassSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  uuid: z.string().uuid(),
  teacher: TeacherSchema.optional(),
  created_at: z.string(),
})

export const StudentSchema = z.object({
  id: z.number(),
  student_no: z.number().min(1),
  name: z.string().min(1),
  sex: z.nativeEnum(StudentSex),
  memo: z.string().optional(),
  class: ClassSchema,
})

export const StudentDislikeSchema = z.object({
  id: z.number().optional(),
  student_id: z.number(),
  preference_id: z.number().optional(),
})

export const StudentPreferenceSchema = z.object({
  id: z.number(),
  student: StudentSchema.optional(),
  student_no: z.number().optional(),
  previous_team: z.number(),
  mi_a: z.number().min(1).max(8),
  mi_b: z.number().min(1).max(8),
  mi_c: z.number().min(1).max(8),
  mi_d: z.number().min(1).max(8),
  mi_e: z.number().min(1).max(8),
  mi_f: z.number().min(1).max(8),
  mi_g: z.number().min(1).max(8),
  mi_h: z.number().min(1).max(8),
  leader: z.number().min(0).max(1),
  eyesight: z.number().min(0).max(1),
  student_dislikes: z.array(StudentDislikeSchema).optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export const SurveySchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  status: z.nativeEnum(SurveyStatus),
  class: ClassSchema,
  class_id: z.number(),
  student_preferences: z.array(StudentPreferenceSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const ConstraintSchema = z.object({
  max_num_teams: z.number().min(1).optional(),
  members_per_team: z.number().min(2).optional(),
  at_least_one_pair_sex: z.boolean(),
  girl_geq_boy: z.boolean(),
  boy_geq_girl: z.boolean(),
  at_least_one_leader: z.boolean(),
  unique_previous: z.number().min(0).optional(),
  group_diff_coeff: z.number().min(0).max(1).optional(),
})

export const ConversationSchema = z.object({
  id: z.number(),
  teacher_id: z.number(),
  session_id: z.string(),
  current_step: z.nativeEnum(ConversationStep),
  context_data: z.record(z.any()),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ChatMessageSchema = z.object({
  id: z.number(),
  conversation_id: z.number(),
  message_type: z.nativeEnum(MessageType),
  content: z.string(),
  metadata: z.record(z.any()),
  created_at: z.string(),
})

// Type definitions derived from schemas
export type MIScore = z.infer<typeof MIScoreSchema>
export type School = z.infer<typeof SchoolSchema>
export type Teacher = z.infer<typeof TeacherSchema>
export type Class = z.infer<typeof ClassSchema>
export type Student = z.infer<typeof StudentSchema>
export type StudentDislike = z.infer<typeof StudentDislikeSchema>
export type StudentPreference = z.infer<typeof StudentPreferenceSchema>
export type Survey = z.infer<typeof SurveySchema>
export type Constraint = z.infer<typeof ConstraintSchema>
export type Conversation = z.infer<typeof ConversationSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>

// API Response types with proper error handling
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// GraphQL response types
export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: Array<string | number>
  }>
}

// Chat state types
export interface ChatState {
  conversation: Conversation | null
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  currentStep: ConversationStep
  fileProcessingJobs: FileProcessingJob[]
  optimizationJob: OptimizationJob | null
  error: string | null
}

export interface FileProcessingJob {
  id: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_type: 'csv_import' | 'llm_conversion'
  file_name: string
  result_data: Record<string, any>
  error_message?: string
  created_at: string
  updated_at: string
}

export interface OptimizationJob {
  id: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  result_data?: Record<string, any>
  error_message?: string
  created_at: string
  updated_at: string
}

// Form types for better form handling
export interface CreateClassForm {
  name: string
  teacher_id?: number
}

export interface CreateStudentForm {
  student_no: number
  name: string
  sex: StudentSex
  memo?: string
  class_id: number
}

export interface CreateSurveyForm {
  name: string
  class_id: number
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}