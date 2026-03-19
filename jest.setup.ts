import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Redis
jest.mock('@/lib/redis', () => ({
  getRedis: () => ({
    get: jest.fn(),
    set: jest.fn(),
    lrange: jest.fn(),
    lpush: jest.fn(),
    del: jest.fn(),
    pipeline: () => ({
      get: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
  }),
}))
