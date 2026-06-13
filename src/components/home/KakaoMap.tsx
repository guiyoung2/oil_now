import { useEffect, useRef } from 'react'
import type { FuelType, StationWithPrice } from '../../types/station'

declare global {
  interface Window {
    kakao: any
  }
}

interface Props {
  lat: number
  lng: number
  stations: StationWithPrice[]
  fuelType: FuelType
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

function overlayHtml(s: StationWithPrice, fuelType: FuelType): string {
  const priceRows = fuelType === 'lpg'
    ? (s.price != null
        ? `<div style="font-size:12px;color:#1f1f1f"><span style="color:#9a9a9e">LPG </span><span style="font-weight:800;color:#0e9f58">${fmtPrice(s.price)}</span></div>`
        : '')
    : [
        s.gasolinePrice != null
          ? `<div style="font-size:12px;color:#1f1f1f"><span style="color:#9a9a9e">휘발유 </span><span style="font-weight:800;color:#0e9f58">${fmtPrice(s.gasolinePrice)}</span></div>`
          : '',
        s.dieselPrice != null
          ? `<div style="font-size:12px;color:#1f1f1f"><span style="color:#9a9a9e">경유 </span><span style="font-weight:600;color:#6b7280">${fmtPrice(s.dieselPrice)}</span></div>`
          : '',
      ].join('')

  return `<div style="background:#fff;border:1px solid #eef1f0;border-radius:14px;padding:11px 14px;box-shadow:0 4px 16px rgba(20,80,50,.16);min-width:150px;font-family:'Pretendard',sans-serif;position:relative;cursor:default">
  <div style="font-weight:800;font-size:14px;color:#1f1f1f;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px">${s.name}</div>
  <div style="font-size:12px;color:#9a9a9e;margin-bottom:5px">${s.brand}</div>
  ${priceRows}
  <div style="font-size:11px;color:#9a9a9e;margin-top:4px">${fmtDist(s.distance)}</div>
  <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid #eef1f0"></div>
  <div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #fff"></div>
</div>`
}

export function KakaoMap({ lat, lng, stations, fuelType }: Props) {
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
            content: overlayHtml(station, fuelType),
            yAnchor: 1.1,
          })
          overlay.setMap(mapInstanceRef.current)
          overlayRef.current = overlay
        })

        return marker
      })
      clustererRef.current.addMarkers(markers)
    })
  }, [lat, lng, stations, fuelType])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '50vh' }}
      aria-label="주유소 지도"
      role="img"
    />
  )
}
