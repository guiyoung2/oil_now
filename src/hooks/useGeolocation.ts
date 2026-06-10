import { useState, useEffect } from 'react'

export type GeolocationStatus = 'pending' | 'granted' | 'denied' | 'unavailable'

export interface UseGeolocationResult {
  status: GeolocationStatus
  lat: number | null
  lng: number | null
  fallbackRegion: string | null
  setFallbackRegion: (region: string) => void
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('pending')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [fallbackRegion, setFallbackRegion] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setStatus('granted')
      },
      () => {
        setStatus('denied')
      },
    )
  }, [])

  return { status, lat, lng, fallbackRegion, setFallbackRegion }
}
