import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

beforeEach(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn(
        (_: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 1, message: 'denied' } as GeolocationPositionError)
        },
      ),
    },
  })
})

test('앱 렌더링 — FilterBar 유종 버튼 표시', async () => {
  render(<App />)
  await waitFor(() => {
    expect(screen.getByRole('radio', { name: '휘발유' })).toBeInTheDocument()
  })
})
