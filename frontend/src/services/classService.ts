import { BaseService } from './baseService'
import { Class, CreateClassForm, APIResponse } from '@/src/lib/types'
import { validateAPIResponse } from '@/src/lib/validators'
import { ClassSchema } from '@/src/lib/types'
import { z } from 'zod'

const ClassListSchema = z.array(ClassSchema)

export class ClassService extends BaseService<Class, CreateClassForm, Partial<CreateClassForm>> {
  constructor() {
    super('/api/chat/classes', ClassListSchema, ClassSchema)
  }

  /**
   * Import class from CSV file
   */
  async importFromCSV(file: File): Promise<APIResponse<Class>> {
    return this.uploadFile('/import', file)
  }

  /**
   * Get students for a specific class
   */
  async getStudents(classId: number): Promise<APIResponse<any[]>> {
    return this.customOperation<any[]>(`${this.baseEndpoint}/${classId}/students`, 'GET')
  }

  /**
   * Get surveys for a specific class
   */
  async getSurveys(classId: number): Promise<APIResponse<any[]>> {
    return this.customOperation<any[]>(`${this.baseEndpoint}/${classId}/surveys`, 'GET')
  }
}

// Export singleton instance
export const classService = new ClassService()