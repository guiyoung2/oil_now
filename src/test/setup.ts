import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

// jsdom에는 ResizeObserver가 없음 (PriceTrendChart에서 사용)
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
