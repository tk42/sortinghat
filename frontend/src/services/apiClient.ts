import { APIError, APIResponse } from '@/src/lib/types'

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

export class APIClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number
  private defaultRetries: number

  constructor(baseURL = '', options: {
    defaultHeaders?: Record<string, string>
    defaultTimeout?: number
    defaultRetries?: number
  } = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    }
    this.defaultTimeout = options.defaultTimeout || 10000
    this.defaultRetries = options.defaultRetries || 3
  }

  /**
   * Make an HTTP request with automatic retries and error handling
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
    } = config

    const url = `${this.baseURL}${endpoint}`
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    }

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    // Retry logic
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        
        // Parse response
        const responseData = await this.parseResponse(response)
        
        if (!response.ok) {
          throw new APIError(
            responseData.error || `HTTP ${response.status}: ${response.statusText}`,
            'HTTP_ERROR',
            response.status,
            responseData
          )
        }

        return {
          success: true,
          data: responseData.data || responseData,
        }
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors (4xx) or validation errors
        if (error instanceof APIError && error.statusCode && error.statusCode < 500) {
          break
        }
        
        // Don't retry on the last attempt
        if (attempt === retries) {
          break
        }
        
        // Wait before retrying (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000)
      }
    }

    // If we get here, all retries failed
    const errorMessage = lastError?.message || 'Request failed'
    return {
      success: false,
      error: errorMessage,
      code: lastError instanceof APIError ? lastError.code : 'UNKNOWN_ERROR',
    }
  }

  /**
   * Parse response data, handling different content types
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return await response.json()
    }
    
    if (contentType?.includes('text/')) {
      return await response.text()
    }
    
    return await response.blob()
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', async () => {
        try {
          const responseData = JSON.parse(xhr.responseText)
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              data: responseData.data || responseData,
            })
          } else {
            resolve({
              success: false,
              error: responseData.error || `Upload failed with status ${xhr.status}`,
              code: 'UPLOAD_ERROR',
            })
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Failed to parse upload response',
            code: 'PARSE_ERROR',
          })
        }
      })

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Upload failed due to network error',
          code: 'NETWORK_ERROR',
        })
      })

      xhr.open('POST', `${this.baseURL}${endpoint}`)
      
      // Add default headers except Content-Type (let browser set it for FormData)
      Object.entries(this.defaultHeaders).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, value)
        }
      })
      
      xhr.send(formData)
    })
  }
}

// Create default API client instance
export const apiClient = new APIClient('', {
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  defaultTimeout: 15000,
  defaultRetries: 2,
})

// GraphQL specific client
export class GraphQLClient extends APIClient {
  constructor(endpoint: string, adminSecret?: string) {
    super(endpoint, {
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...(adminSecret && { 'x-hasura-admin-secret': adminSecret }),
      },
    })
  }

  async query<T>(query: string, variables?: any): Promise<APIResponse<T>> {
    const response = await this.post<{ data: T; errors?: any[] }>('', {
      query,
      variables,
    })

    if (!response.success) {
      return response as APIResponse<T>
    }

    if (response.data?.errors && response.data.errors.length > 0) {
      return {
        success: false,
        error: response.data.errors[0].message,
        code: 'GRAPHQL_ERROR',
      }
    }

    return {
      success: true,
      data: response.data?.data as T,
    }
  }

  async mutate<T>(mutation: string, variables?: any): Promise<APIResponse<T>> {
    return this.query<T>(mutation, variables)
  }
}

// Create GraphQL client instance
export const graphqlClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_BACKEND_GQL_API || '',
  process.env.HASURA_GRAPHQL_ADMIN_SECRET
)