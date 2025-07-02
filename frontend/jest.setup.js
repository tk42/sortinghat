import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Firebase Auth
jest.mock('@/src/utils/firebase/authprovider', () => ({
  useAuthContext: () => ({
    state: {
      user: { uid: 'test-uid', email: 'test@example.com' },
      teacher: { id: 1, name: 'Test Teacher' },
      isLoading: false,
      error: null,
    },
  }),
}))

// Mock sessionStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

// Setup cleanup
beforeEach(() => {
  localStorageMock.clear()
  jest.clearAllMocks()
})