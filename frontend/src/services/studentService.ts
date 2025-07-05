import { apiClient } from './apiClient'
import { Student, CreateStudentForm, APIResponse } from '@/src/lib/types'
import { validateAPIResponse } from '@/src/lib/validators'
import { StudentSchema } from '@/src/lib/types'
import { z } from 'zod'

const StudentListSchema = z.array(StudentSchema)

export class StudentService {
  /**
   * Get all students for a specific class
   */
  async listByClass(classId: number): Promise<APIResponse<Student[]>> {
    try {
      const response = await apiClient.get<Student[]>(`/api/chat/classes/${classId}/students`)
      
      if (!response.success) {
        return response
      }

      // Validate response data
      const validatedStudents = validateAPIResponse(StudentListSchema, response)
      
      return {
        success: true,
        data: validatedStudents,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch students',
        code: 'FETCH_ERROR',
      }
    }
  }

  /**
   * Get a specific student by ID
   */
  async getById(id: number): Promise<APIResponse<Student>> {
    try {
      const response = await apiClient.get<Student>(`/api/chat/students/${id}`)
      
      if (!response.success) {
        return response
      }

      const validatedStudent = validateAPIResponse(StudentSchema, response)
      
      return {
        success: true,
        data: validatedStudent,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch student',
        code: 'FETCH_ERROR',
      }
    }
  }

  /**
   * Create a new student
   */
  async create(studentData: CreateStudentForm): Promise<APIResponse<Student>> {
    try {
      const response = await apiClient.post<Student>('/api/chat/students', studentData)
      
      if (!response.success) {
        return response
      }

      const validatedStudent = validateAPIResponse(StudentSchema, response)
      
      return {
        success: true,
        data: validatedStudent,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create student',
        code: 'CREATE_ERROR',
      }
    }
  }

  /**
   * Update an existing student
   */
  async update(id: number, studentData: Partial<CreateStudentForm>): Promise<APIResponse<Student>> {
    try {
      const response = await apiClient.put<Student>(`/api/chat/students/${id}`, studentData)
      
      if (!response.success) {
        return response
      }

      const validatedStudent = validateAPIResponse(StudentSchema, response)
      
      return {
        success: true,
        data: validatedStudent,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update student',
        code: 'UPDATE_ERROR',
      }
    }
  }

  /**
   * Delete a student
   */
  async delete(id: number): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/api/chat/students/${id}`)
      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete student',
        code: 'DELETE_ERROR',
      }
    }
  }

  /**
   * Bulk create students from array
   */
  async bulkCreate(students: CreateStudentForm[]): Promise<APIResponse<Student[]>> {
    try {
      const response = await apiClient.post<Student[]>('/api/chat/students/bulk', { students })
      
      if (!response.success) {
        return response
      }

      const validatedStudents = validateAPIResponse(StudentListSchema, response)
      
      return {
        success: true,
        data: validatedStudents,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create students',
        code: 'BULK_CREATE_ERROR',
      }
    }
  }

  /**
   * Import students from CSV file
   */
  async importFromCSV(
    classId: number,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse<Student[]>> {
    try {
      const response = await apiClient.uploadFile<Student[]>(
        `/api/chat/classes/${classId}/students/import`,
        file,
        onProgress
      )
      
      if (!response.success) {
        return response
      }

      const validatedStudents = validateAPIResponse(StudentListSchema, response)
      
      return {
        success: true,
        data: validatedStudents,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import students',
        code: 'IMPORT_ERROR',
      }
    }
  }

  /**
   * Search students by name or student number
   */
  async search(classId: number, query: string): Promise<APIResponse<Student[]>> {
    try {
      const response = await apiClient.get<Student[]>(
        `/api/chat/classes/${classId}/students/search?q=${encodeURIComponent(query)}`
      )
      
      if (!response.success) {
        return response
      }

      const validatedStudents = validateAPIResponse(StudentListSchema, response)
      
      return {
        success: true,
        data: validatedStudents,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search students',
        code: 'SEARCH_ERROR',
      }
    }
  }
}

// Export singleton instance
export const studentService = new StudentService()