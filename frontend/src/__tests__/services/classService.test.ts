import { classService } from '@/src/services/classService'
import { apiClient } from '@/src/services/apiClient'
import { createMockClass } from '@/src/__tests__/utils/testUtils'

// Mock the API client
jest.mock('@/src/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('ClassService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('should return classes when API call succeeds', async () => {
      const mockClasses = [createMockClass(), createMockClass({ id: 2, name: 'Class 2' })]
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockClasses,
      })

      const result = await classService.list()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockClasses)
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chat/classes')
    })

    it('should return error when API call fails', async () => {
      mockApiClient.get.mockResolvedValue({
        success: false,
        error: 'Network error',
        code: 'NETWORK_ERROR',
      })

      const result = await classService.list()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.code).toBe('NETWORK_ERROR')
    })

    it('should handle validation errors', async () => {
      // Mock invalid data that doesn't match the schema
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: [{ invalid: 'data' }],
      })

      const result = await classService.list()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
    })
  })

  describe('create', () => {
    it('should create a class when data is valid', async () => {
      const newClassData = { name: 'New Class', teacher_id: 1 }
      const mockCreatedClass = createMockClass({ name: 'New Class' })
      
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockCreatedClass,
      })

      const result = await classService.create(newClassData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCreatedClass)
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chat/classes', newClassData)
    })

    it('should return error when creation fails', async () => {
      const newClassData = { name: 'New Class', teacher_id: 1 }
      
      mockApiClient.post.mockResolvedValue({
        success: false,
        error: 'Class name already exists',
        code: 'DUPLICATE_NAME',
      })

      const result = await classService.create(newClassData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Class name already exists')
      expect(result.code).toBe('DUPLICATE_NAME')
    })
  })

  describe('update', () => {
    it('should update a class when data is valid', async () => {
      const classId = 1
      const updateData = { name: 'Updated Class' }
      const mockUpdatedClass = createMockClass({ id: classId, name: 'Updated Class' })
      
      mockApiClient.put.mockResolvedValue({
        success: true,
        data: mockUpdatedClass,
      })

      const result = await classService.update(classId, updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedClass)
      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/chat/classes/${classId}`, updateData)
    })
  })

  describe('delete', () => {
    it('should delete a class successfully', async () => {
      const classId = 1
      
      mockApiClient.delete.mockResolvedValue({
        success: true,
      })

      const result = await classService.delete(classId)

      expect(result.success).toBe(true)
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/chat/classes/${classId}`)
    })
  })

  describe('importFromCSV', () => {
    it('should import class from CSV file', async () => {
      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' })
      const mockImportedClass = createMockClass({ name: 'Imported Class' })
      const mockProgress = jest.fn()
      
      mockApiClient.uploadFile.mockResolvedValue({
        success: true,
        data: mockImportedClass,
      })

      const result = await classService.importFromCSV(file, mockProgress)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockImportedClass)
      expect(mockApiClient.uploadFile).toHaveBeenCalledWith(
        '/api/chat/classes/import',
        file,
        mockProgress
      )
    })
  })
})