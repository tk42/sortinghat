import { useState, useEffect, useCallback } from 'react'
import { classService } from '@/src/services'
import { Class, CreateClassForm, APIResponse } from '@/src/lib/types'
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications'

export interface UseClassesOptions {
  autoLoad?: boolean
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function useClasses(options: UseClassesOptions = {}) {
  const { autoLoad = true, onError, onSuccess } = options
  
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const toastHelpers = useToastHelpers()

  // Load classes from API
  const loadClasses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await classService.list()
      
      if (response.success) {
        setClasses(response.data || [])
        setError(null)
      } else {
        const errorMessage = response.error || 'クラスの読み込みに失敗しました'
        setError(errorMessage)
        if (onError) {
          onError(errorMessage)
        } else {
          toastHelpers.error('読み込みエラー', errorMessage)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      } else {
        toastHelpers.error('読み込みエラー', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [onError, toastHelpers])

  // Create a new class
  const createClass = useCallback(async (classData: CreateClassForm): Promise<Class | null> => {
    setIsLoading(true)
    
    try {
      const response = await classService.create(classData)
      
      if (response.success && response.data) {
        setClasses(prev => [...prev, response.data!])
        const successMessage = `クラス「${response.data.name}」を作成しました`
        if (onSuccess) {
          onSuccess(successMessage)
        } else {
          toastHelpers.success('作成完了', successMessage)
        }
        return response.data
      } else {
        const errorMessage = response.error || 'クラスの作成に失敗しました'
        if (onError) {
          onError(errorMessage)
        } else {
          toastHelpers.error('作成エラー', errorMessage)
        }
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (onError) {
        onError(errorMessage)
      } else {
        toastHelpers.error('作成エラー', errorMessage)
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [onError, onSuccess, toastHelpers])

  // Update an existing class
  const updateClass = useCallback(async (
    id: number, 
    classData: Partial<CreateClassForm>
  ): Promise<Class | null> => {
    setIsLoading(true)
    
    try {
      const response = await classService.update(id, classData)
      
      if (response.success && response.data) {
        setClasses(prev => 
          prev.map(cls => cls.id === id ? response.data! : cls)
        )
        const successMessage = `クラス「${response.data.name}」を更新しました`
        if (onSuccess) {
          onSuccess(successMessage)
        } else {
          toastHelpers.success('更新完了', successMessage)
        }
        return response.data
      } else {
        const errorMessage = response.error || 'クラスの更新に失敗しました'
        if (onError) {
          onError(errorMessage)
        } else {
          toastHelpers.error('更新エラー', errorMessage)
        }
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (onError) {
        onError(errorMessage)
      } else {
        toastHelpers.error('更新エラー', errorMessage)
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [onError, onSuccess, toastHelpers])

  // Delete a class
  const deleteClass = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await classService.delete(id)
      
      if (response.success) {
        setClasses(prev => prev.filter(cls => cls.id !== id))
        const successMessage = 'クラスを削除しました'
        if (onSuccess) {
          onSuccess(successMessage)
        } else {
          toastHelpers.success('削除完了', successMessage)
        }
        return true
      } else {
        const errorMessage = response.error || 'クラスの削除に失敗しました'
        if (onError) {
          onError(errorMessage)
        } else {
          toastHelpers.error('削除エラー', errorMessage)
        }
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (onError) {
        onError(errorMessage)
      } else {
        toastHelpers.error('削除エラー', errorMessage)
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [onError, onSuccess, toastHelpers])

  // Import classes from CSV
  const importFromCSV = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Class | null> => {
    setIsLoading(true)
    
    try {
      const response = await classService.importFromCSV(file, onProgress)
      
      if (response.success && response.data) {
        setClasses(prev => [...prev, response.data!])
        const successMessage = `CSVファイルから「${response.data.name}」を作成しました`
        if (onSuccess) {
          onSuccess(successMessage)
        } else {
          toastHelpers.success('インポート完了', successMessage)
        }
        return response.data
      } else {
        const errorMessage = response.error || 'CSVファイルのインポートに失敗しました'
        if (onError) {
          onError(errorMessage)
        } else {
          toastHelpers.error('インポートエラー', errorMessage)
        }
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (onError) {
        onError(errorMessage)
      } else {
        toastHelpers.error('インポートエラー', errorMessage)
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [onError, onSuccess, toastHelpers])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadClasses()
    }
  }, [autoLoad, loadClasses])

  return {
    classes,
    isLoading,
    error,
    loadClasses,
    createClass,
    updateClass,
    deleteClass,
    importFromCSV,
    // Utility functions
    clearError: () => setError(null),
    getClassById: (id: number) => classes.find(cls => cls.id === id),
    getClassByName: (name: string) => classes.find(cls => cls.name === name),
  }
}