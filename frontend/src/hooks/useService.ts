import { useState, useCallback, useEffect } from 'react'
import { APIResponse } from '@/src/lib/types'

export interface UseServiceState<T> {
  data: T | null
  loading: boolean
  error: string | null
  code?: string
}

export interface UseServiceActions<T> {
  execute: () => Promise<void>
  reset: () => void
  setData: (data: T) => void
}

export interface UseServiceReturn<T> extends UseServiceState<T>, UseServiceActions<T> {}

/**
 * Hook for handling service operations with loading states and error handling
 */
export function useService<T>(
  serviceCall: () => Promise<APIResponse<T>>,
  deps: any[] = [],
  options: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: string, code?: string) => void
  } = {}
): UseServiceReturn<T> {
  const [state, setState] = useState<UseServiceState<T>>({
    data: null,
    loading: false,
    error: null,
    code: undefined,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, code: undefined }))
    
    try {
      const response = await serviceCall()
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
          code: undefined,
        })
        
        if (options.onSuccess && response.data !== undefined) {
          options.onSuccess(response.data)
        }
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error occurred',
          code: response.code,
        })
        
        if (options.onError) {
          options.onError(response.error || 'Unknown error occurred', response.code)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred'
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        code: 'UNEXPECTED_ERROR',
      })
      
      if (options.onError) {
        options.onError(errorMessage, 'UNEXPECTED_ERROR')
      }
    }
  }, deps)

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      code: undefined,
    })
  }, [])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null, code: undefined }))
  }, [])

  // Execute immediately if requested
  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

/**
 * Hook for handling list operations with additional filtering and sorting
 */
export function useServiceList<T>(
  serviceCall: (options?: any) => Promise<APIResponse<T[]>>,
  deps: any[] = [],
  options: {
    immediate?: boolean
    onSuccess?: (data: T[]) => void
    onError?: (error: string, code?: string) => void
    defaultSort?: { field: string; direction: 'asc' | 'desc' }
    defaultFilters?: Record<string, any>
  } = {}
) {
  const [sortConfig, setSortConfig] = useState(options.defaultSort)
  const [filters, setFilters] = useState(options.defaultFilters || {})
  const [selectedItems, setSelectedItems] = useState<Set<any>>(new Set())

  const serviceCallWithOptions = useCallback(() => {
    return serviceCall({
      sort: sortConfig,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    })
  }, [serviceCall, sortConfig, filters, ...deps])

  const service = useService(serviceCallWithOptions, [serviceCallWithOptions], options)

  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }, [])

  const handleFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const handleSelection = useCallback((selected: Set<any>) => {
    setSelectedItems(selected)
  }, [])

  return {
    ...service,
    sortConfig,
    filters,
    selectedItems,
    handleSort,
    handleFilter,
    clearFilters,
    handleSelection,
    setSortConfig,
    setFilters,
  }
}

/**
 * Hook for handling CRUD operations on a single entity
 */
export function useServiceCRUD<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  service: {
    list: () => Promise<APIResponse<T[]>>
    getById: (id: string | number) => Promise<APIResponse<T>>
    create: (data: CreateInput) => Promise<APIResponse<T>>
    update: (id: string | number, data: UpdateInput) => Promise<APIResponse<T>>
    delete: (id: string | number) => Promise<APIResponse<void>>
  },
  options: {
    onSuccess?: (action: 'list' | 'get' | 'create' | 'update' | 'delete', data?: any) => void
    onError?: (action: 'list' | 'get' | 'create' | 'update' | 'delete', error: string) => void
  } = {}
) {
  const [items, setItems] = useState<T[]>([])
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResponse = useCallback(<R,>(
    response: APIResponse<R>,
    action: 'list' | 'get' | 'create' | 'update' | 'delete'
  ): R | null => {
    if (response.success) {
      setError(null)
      if (options.onSuccess) {
        options.onSuccess(action, response.data)
      }
      return response.data || null
    } else {
      const errorMsg = response.error || 'Unknown error occurred'
      setError(errorMsg)
      if (options.onError) {
        options.onError(action, errorMsg)
      }
      return null
    }
  }, [options])

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const response = await service.list()
      const data = handleResponse(response, 'list')
      if (data) {
        setItems(data)
      }
    } finally {
      setLoading(false)
    }
  }, [service, handleResponse])

  const getById = useCallback(async (id: string | number) => {
    setLoading(true)
    try {
      const response = await service.getById(id)
      const data = handleResponse(response, 'get')
      if (data) {
        setCurrentItem(data)
      }
      return data
    } finally {
      setLoading(false)
    }
  }, [service, handleResponse])

  const create = useCallback(async (data: CreateInput) => {
    setLoading(true)
    try {
      const response = await service.create(data)
      const newItem = handleResponse(response, 'create')
      if (newItem) {
        setItems(prev => [...prev, newItem])
        return newItem
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [service, handleResponse])

  const update = useCallback(async (id: string | number, data: UpdateInput) => {
    setLoading(true)
    try {
      const response = await service.update(id, data)
      const updatedItem = handleResponse(response, 'update')
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          (item as any).id === id ? updatedItem : item
        ))
        if (currentItem && (currentItem as any).id === id) {
          setCurrentItem(updatedItem)
        }
        return updatedItem
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [service, handleResponse, currentItem])

  const remove = useCallback(async (id: string | number) => {
    setLoading(true)
    try {
      const response = await service.delete(id)
      const success = handleResponse(response, 'delete')
      if (success !== null) {
        setItems(prev => prev.filter(item => (item as any).id !== id))
        if (currentItem && (currentItem as any).id === id) {
          setCurrentItem(null)
        }
        return true
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [service, handleResponse, currentItem])

  return {
    items,
    currentItem,
    loading,
    error,
    list,
    getById,
    create,
    update,
    delete: remove,
    setCurrentItem,
    setItems,
  }
}

export default useService