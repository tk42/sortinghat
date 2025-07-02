import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { Class, Survey, Student, Teacher } from '@/src/lib/interfaces'

// Mock data factories
export const createMockTeacher = (overrides?: Partial<Teacher>): Teacher => ({
  id: 1,
  firebase_uid: 'test-uid',
  name: 'Test Teacher',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockClass = (overrides?: Partial<Class>): Class => ({
  id: 1,
  name: 'Test Class 1A',
  uuid: 'test-class-uuid',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockStudent = (overrides?: Partial<Student>): Student => ({
  id: 1,
  student_no: 1,
  name: 'Test Student',
  sex: 1,
  memo: 'Test memo',
  class: createMockClass(),
  ...overrides,
})

export const createMockSurvey = (overrides?: Partial<Survey>): Survey => ({
  id: 1,
  name: 'Test Survey',
  status: 1,
  class: createMockClass(),
  class_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialState, ...renderOptions } = options || {}

  // Add providers here if needed
  // const Wrapper = ({ children }: { children: ReactNode }) => (
  //   <SomeProvider value={initialState}>
  //     {children}
  //   </SomeProvider>
  // )

  return rtlRender(ui, renderOptions)
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const mockFetch = (response: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(response),
  })
}

export const mockConsoleError = () => {
  const originalError = console.error
  const mockedError = jest.fn()
  console.error = mockedError
  
  return {
    restore: () => {
      console.error = originalError
    },
    mock: mockedError,
  }
}