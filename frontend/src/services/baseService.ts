import { z } from 'zod'
import { APIClient } from './apiClient'
import { APIResponse } from '@/src/lib/types'

export interface CRUDOperations<T, CreateInput, UpdateInput> {
  list(): Promise<APIResponse<T[]>>
  getById(id: string | number): Promise<APIResponse<T>>
  create(data: CreateInput): Promise<APIResponse<T>>
  update(id: string | number, data: UpdateInput): Promise<APIResponse<T>>
  delete(id: string | number): Promise<APIResponse<void>>
}

export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterOptions {
  [key: string]: any
}

export interface ListOptions {
  pagination?: PaginationOptions
  sort?: SortOptions
  filters?: FilterOptions
}

export abstract class BaseService<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> 
  implements CRUDOperations<T, CreateInput, UpdateInput> {
  
  protected apiClient: APIClient
  protected baseEndpoint: string
  protected listSchema: z.ZodSchema<T[]>
  protected itemSchema: z.ZodSchema<T>
  
  constructor(
    baseEndpoint: string,
    listSchema: z.ZodSchema<T[]>,
    itemSchema: z.ZodSchema<T>
  ) {
    this.apiClient = new APIClient()
    this.baseEndpoint = baseEndpoint
    this.listSchema = listSchema
    this.itemSchema = itemSchema
  }

  async list(options?: ListOptions): Promise<APIResponse<T[]>> {
    try {
      const params = this.buildQueryParams(options)
      const response = await this.apiClient.get<T[]>(this.baseEndpoint, { params })
      
      if (!response.success) {
        return response as APIResponse<T[]>
      }
      
      const validatedData = this.validateData(this.listSchema, response.data)
      return { success: true, data: validatedData }
    } catch (error) {
      return this.handleError('LIST_ERROR', error)
    }
  }

  async getById(id: string | number): Promise<APIResponse<T>> {
    try {
      const response = await this.apiClient.get<T>(`${this.baseEndpoint}/${id}`)
      
      if (!response.success) {
        return response as APIResponse<T>
      }
      
      const validatedData = this.validateData(this.itemSchema, response.data)
      return { success: true, data: validatedData }
    } catch (error) {
      return this.handleError('GET_ERROR', error)
    }
  }

  async create(data: CreateInput): Promise<APIResponse<T>> {
    try {
      const response = await this.apiClient.post<T>(this.baseEndpoint, data)
      
      if (!response.success) {
        return response as APIResponse<T>
      }
      
      const validatedData = this.validateData(this.itemSchema, response.data)
      return { success: true, data: validatedData }
    } catch (error) {
      return this.handleError('CREATE_ERROR', error)
    }
  }

  async update(id: string | number, data: UpdateInput): Promise<APIResponse<T>> {
    try {
      const response = await this.apiClient.put<T>(`${this.baseEndpoint}/${id}`, data)
      
      if (!response.success) {
        return response as APIResponse<T>
      }
      
      const validatedData = this.validateData(this.itemSchema, response.data)
      return { success: true, data: validatedData }
    } catch (error) {
      return this.handleError('UPDATE_ERROR', error)
    }
  }

  async delete(id: string | number): Promise<APIResponse<void>> {
    try {
      const response = await this.apiClient.delete(`${this.baseEndpoint}/${id}`)
      
      if (!response.success) {
        return response as APIResponse<void>
      }
      
      return { success: true, data: undefined }
    } catch (error) {
      return this.handleError('DELETE_ERROR', error)
    }
  }

  // Utility methods for specialized operations
  protected async customOperation<R>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    data?: any,
    schema?: z.ZodSchema<R>
  ): Promise<APIResponse<R>> {
    try {
      const response = await this.apiClient.request<R>(endpoint, {
        method,
        body: data,
      })
      
      if (!response.success) {
        return response as APIResponse<R>
      }
      
      if (schema) {
        const validatedData = this.validateData(schema, response.data)
        return { success: true, data: validatedData }
      }
      
      return response
    } catch (error) {
      return this.handleError('CUSTOM_OPERATION_ERROR', error)
    }
  }

  protected async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<APIResponse<any>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }
      
      const response = await this.apiClient.request(endpoint, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      })
      
      return response
    } catch (error) {
      return this.handleError('UPLOAD_ERROR', error)
    }
  }

  private buildQueryParams(options?: ListOptions): Record<string, string> {
    const params: Record<string, string> = {}
    
    if (options?.pagination) {
      if (options.pagination.page) {
        params.page = options.pagination.page.toString()
      }
      if (options.pagination.limit) {
        params.limit = options.pagination.limit.toString()
      }
      if (options.pagination.offset) {
        params.offset = options.pagination.offset.toString()
      }
    }
    
    if (options?.sort) {
      params.sortBy = options.sort.field
      params.sortDirection = options.sort.direction
    }
    
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[`filter_${key}`] = String(value)
        }
      })
    }
    
    return params
  }

  private validateData<R>(schema: z.ZodSchema<R>, data: any): R {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }
  }

  private handleError<R>(code: string, error: any): APIResponse<R> {
    console.error(`${code}:`, error)
    
    let message = 'An unexpected error occurred'
    
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    } else if (error?.message) {
      message = error.message
    }
    
    return {
      success: false,
      error: message,
      code,
    }
  }
}

// Specialized base service for GraphQL operations
export abstract class GraphQLService<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> 
  extends BaseService<T, CreateInput, UpdateInput> {
  
  protected abstract queries: {
    list: string
    getById: string
    create: string
    update: string
    delete: string
  }

  protected async executeGraphQL<R>(
    query: string,
    variables?: Record<string, any>,
    schema?: z.ZodSchema<R>
  ): Promise<APIResponse<R>> {
    try {
      const response = await this.apiClient.post<R>('/api/graphql', {
        query,
        variables,
      })
      
      if (!response.success) {
        return response as APIResponse<R>
      }
      
      if (schema) {
        const validatedData = this.validateData(schema, response.data)
        return { success: true, data: validatedData }
      }
      
      return response
    } catch (error) {
      return this.handleError('GRAPHQL_ERROR', error)
    }
  }

  async list(options?: ListOptions): Promise<APIResponse<T[]>> {
    const variables = this.buildGraphQLVariables(options)
    return this.executeGraphQL<T[]>(this.queries.list, variables, this.listSchema)
  }

  async getById(id: string | number): Promise<APIResponse<T>> {
    return this.executeGraphQL<T>(this.queries.getById, { id }, this.itemSchema)
  }

  async create(data: CreateInput): Promise<APIResponse<T>> {
    return this.executeGraphQL<T>(this.queries.create, { data }, this.itemSchema)
  }

  async update(id: string | number, data: UpdateInput): Promise<APIResponse<T>> {
    return this.executeGraphQL<T>(this.queries.update, { id, data }, this.itemSchema)
  }

  async delete(id: string | number): Promise<APIResponse<void>> {
    return this.executeGraphQL<void>(this.queries.delete, { id })
  }

  private buildGraphQLVariables(options?: ListOptions): Record<string, any> {
    const variables: Record<string, any> = {}
    
    if (options?.pagination) {
      if (options.pagination.limit) {
        variables.limit = options.pagination.limit
      }
      if (options.pagination.offset) {
        variables.offset = options.pagination.offset
      }
    }
    
    if (options?.sort) {
      variables.orderBy = {
        [options.sort.field]: options.sort.direction
      }
    }
    
    if (options?.filters) {
      variables.where = options.filters
    }
    
    return variables
  }
}

export default BaseService