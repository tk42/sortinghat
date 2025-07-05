// Base service classes
export { BaseService, GraphQLService } from './baseService'
export type { CRUDOperations, ListOptions, PaginationOptions, SortOptions, FilterOptions } from './baseService'

// API Client
export { apiClient, graphqlClient, APIClient, GraphQLClient } from './apiClient'
export type { RequestConfig } from './apiClient'
export type { APIResponse } from '@/src/lib/types'

// Service implementations
export { classService, ClassService } from './classService'
export { studentService, StudentService } from './studentService'

// Service hooks
export { useService, useServiceList, useServiceCRUD } from '../hooks/useService'
export type { UseServiceState, UseServiceActions, UseServiceReturn } from '../hooks/useService'

// Service utilities
export { validateAPIResponse } from '../lib/validators'