import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useGeolocation } from '../hooks/useGeolocation'

const mockGetCurrentPosition = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: mockGetCurrentPosition },
  })
})

describe('useGeolocation', () => {
  test('위치 허용 시 granted + 좌표 반환', async () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 37.5665, longitude: 126.978 } } as GeolocationPosition)
    })
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.status).toBe('granted'))
    expect(result.current.lat).toBe(37.5665)
    expect(result.current.lng).toBe(126.978)
  })

  test('위치 거부 시 denied + 좌표 null', async () => {
    mockGetCurrentPosition.mockImplementation(
      (_: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, message: 'denied' } as GeolocationPositionError)
      },
    )
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.status).toBe('denied'))
    expect(result.current.lat).toBeNull()
    expect(result.current.lng).toBeNull()
  })

  test('geolocation 미지원 시 unavailable', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    })
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.status).toBe('unavailable'))
  })

  test('setFallbackRegion으로 fallback 지역 설정', async () => {
    mockGetCurrentPosition.mockImplementation(
      (_: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, message: 'denied' } as GeolocationPositionError)
      },
    )
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.status).toBe('denied'))
    act(() => result.current.setFallbackRegion('서울'))
    expect(result.current.fallbackRegion).toBe('서울')
  })
})
