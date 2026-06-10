import { useEffect, useRef } from 'react'
import type { StationWithPrice } from '../../types/station'

declare global {
  interface Window {
    kakao: any
  }
}

interface Props {
  lat: number
  lng: number
  stations: StationWithPrice[]
  onMarkerClick: (stationId: string) => void
}

export function KakaoMap({ lat, lng, stations, onMarkerClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return
    const center = new window.kakao.maps.LatLng(lat, lng)
    mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    })
    clustererRef.current = new window.kakao.maps.MarkerClusterer({
      map: mapInstanceRef.current,
      averageCenter: true,
      minLevel: 6,
    })
  }, [lat, lng])

  useEffect(() => {
    if (!mapInstanceRef.current || !clustererRef.current || !window.kakao?.maps) return
    clustererRef.current.clear()
    const markers = stations.map((station) => {
      const position = new window.kakao.maps.LatLng(station.lat, station.lng)
      const marker = new window.kakao.maps.Marker({ position })
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(station.id)
      })
      return marker
    })
    clustererRef.current.addMarkers(markers)
  }, [stations, onMarkerClick])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '50vh' }}
      aria-label="주유소 지도"
      role="img"
    />
  )
}
