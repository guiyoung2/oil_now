import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

beforeEach(() => {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
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

test('앱 첫 화면 — 실시간 유가 대시보드 표시', async () => {
  render(<App />)
  await waitFor(() => {
    expect(screen.getByText('전국 평균가')).toBeInTheDocument()
  })
})
