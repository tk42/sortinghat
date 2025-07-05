import {
  StudentSchema,
  ClassSchema,
  SurveySchema,
  ConstraintSchema,
  ChatMessageSchema,
  ConversationSchema,
  StudentPreferenceSchema,
  APIError,
  ValidationError,
} from './types'
import { z } from 'zod'

/**
 * Validates data against a Zod schema and throws appropriate errors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ValidationError(
        `Validation failed: ${firstError.message}`,
        firstError.path.join('.'),
        data
      )
    }
    throw error
  }
}

/**
 * Safely validates data and returns a result object instead of throwing
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, error: errorMessages.join(', ') }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Specific validators for common use cases
export const validateStudent = (data: unknown) => validateData(StudentSchema, data)
export const validateClass = (data: unknown) => validateData(ClassSchema, data)
export const validateSurvey = (data: unknown) => validateData(SurveySchema, data)
export const validateConstraint = (data: unknown) => validateData(ConstraintSchema, data)
export const validateChatMessage = (data: unknown) => validateData(ChatMessageSchema, data)
export const validateConversation = (data: unknown) => validateData(ConversationSchema, data)
export const validateStudentPreference = (data: unknown) => validateData(StudentPreferenceSchema, data)

// Safe validators
export const safeValidateStudent = (data: unknown) => safeValidateData(StudentSchema, data)
export const safeValidateClass = (data: unknown) => safeValidateData(ClassSchema, data)
export const safeValidateSurvey = (data: unknown) => safeValidateData(SurveySchema, data)
export const safeValidateConstraint = (data: unknown) => safeValidateData(ConstraintSchema, data)

/**
 * Validates API responses
 */
export function validateAPIResponse<T>(
  schema: z.ZodSchema<T>,
  response: any
): T {
  if (!response) {
    throw new APIError('Empty response', 'EMPTY_RESPONSE')
  }

  if (response.errors && response.errors.length > 0) {
    throw new APIError(
      response.errors[0].message,
      'API_ERROR',
      undefined,
      response.errors
    )
  }

  if (!response.success && response.error) {
    throw new APIError(response.error, 'API_ERROR')
  }

  if (response.data) {
    return validateData(schema, response.data)
  }

  throw new APIError('Invalid response format', 'INVALID_RESPONSE')
}

/**
 * Type guards for runtime type checking
 */
export function isStudent(obj: any): obj is z.infer<typeof StudentSchema> {
  return safeValidateStudent(obj).success
}

export function isClass(obj: any): obj is z.infer<typeof ClassSchema> {
  return safeValidateClass(obj).success
}

export function isSurvey(obj: any): obj is z.infer<typeof SurveySchema> {
  return safeValidateSurvey(obj).success
}

export function isConstraint(obj: any): obj is z.infer<typeof ConstraintSchema> {
  return safeValidateConstraint(obj).success
}

/**
 * Helper for form validation
 */
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => safeValidateData(schema, data),
    validateField: (fieldName: string, value: unknown) => {
      const fieldSchema = (schema as any).shape[fieldName]
      if (!fieldSchema) {
        return { success: false, error: `Field ${fieldName} not found in schema` }
      }
      return safeValidateData(fieldSchema, value)
    },
  }
}

/**
 * Converts legacy interface data to new typed format
 */
export function migrateLegacyData<T>(
  schema: z.ZodSchema<T>,
  legacyData: any,
  migrationMap?: Record<string, string>
): T {
  let processedData = { ...legacyData }

  // Apply field mapping if provided
  if (migrationMap) {
    for (const [oldField, newField] of Object.entries(migrationMap)) {
      if (oldField in processedData) {
        processedData[newField] = processedData[oldField]
        delete processedData[oldField]
      }
    }
  }

  return validateData(schema, processedData)
}