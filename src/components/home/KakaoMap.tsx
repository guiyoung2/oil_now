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
}

function fmtPrice(price: number | null): string {
  if (price === null) return '-'
  return price.toLocaleString('ko-KR') + '원'
}

function fmtDist(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)}km`
    : `${Math.round(meters)}m`
}

function overlayHtml(s: StationWithPrice): string {
  const gasolineRow = s.gasolinePrice != null
    ? `<div style="font-size:12px;color:#374151"><span style="color:#9ca3af">휘발유 </span><span style="font-weight:700;color:#dc2626">${fmtPrice(s.gasolinePrice)}</span></div>`
    : ''
  const dieselRow = s.dieselPrice != null
    ? `<div style="font-size:12px;color:#374151"><span style="color:#9ca3af">경유 </span><span style="font-weight:600">${fmtPrice(s.dieselPrice)}</span></div>`
    : ''
  return `<div style="background:#fff;border:1px solid #d1d5db;border-radius:10px;padding:10px 14px;box-shadow:0 4px 12px rgba(0,0,0,.15);min-width:150px;font-family:sans-serif;position:relative;cursor:default">
  <div style="font-weight:700;font-size:14px;color:#111;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px">${s.name}</div>
  <div style="font-size:12px;color:#6b7280;margin-bottom:5px">${s.brand}</div>
  ${gasolineRow}${dieselRow}
  <div style="font-size:11px;color:#9ca3af;margin-top:4px">${fmtDist(s.distance)}</div>
  <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid #d1d5db"></div>
  <div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #fff"></div>
</div>`
}

export function KakaoMap({ lat, lng, stations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)
  const overlayRef = useRef<any>(null)

  // 지도 초기화 (위치 변경 시 중심 이동)
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return

    window.kakao.maps.load(() => {
      if (!mapRef.current) return

      if (!mapInstanceRef.current) {
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

        // 지도 클릭 시 말풍선 닫기
        window.kakao.maps.event.addListener(mapInstanceRef.current, 'click', () => {
          if (overlayRef.current) {
            overlayRef.current.setMap(null)
            overlayRef.current = null
          }
        })
      } else {
        mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng))
      }

      clustererRef.current.clear()
      const markers = stations.map((station) => {
        const position = new window.kakao.maps.LatLng(station.lat, station.lng)
        const marker = new window.kakao.maps.Marker({ position })

        window.kakao.maps.event.addListener(marker, 'click', () => {
          // 기존 오버레이 닫기
          if (overlayRef.current) {
            overlayRef.current.setMap(null)
          }
          const overlay = new window.kakao.maps.CustomOverlay({
            position,
            content: overlayHtml(station),
            yAnchor: 1.1,
          })
          overlay.setMap(mapInstanceRef.current)
          overlayRef.current = overlay
        })

        return marker
      })
      clustererRef.current.addMarkers(markers)
    })
  }, [lat, lng, stations])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '50vh' }}
      aria-label="주유소 지도"
      role="img"
    />
  )
}
