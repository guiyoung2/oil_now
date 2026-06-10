import type { Station, PriceSnapshot } from '../types/station'

export interface StationRow extends Station {
  price_snapshots: PriceSnapshot[]
}

// 모든 좌표는 서울 중심(37.5665, 126.978) 기준 약 1km 이내
export const stationFixtures: StationRow[] = [
  {
    id: 'A0000001',
    name: '강남 SK에너지',
    brand: 'SKE',
    address: '서울 강남구 테헤란로 123',
    lat: 37.5745,
    lng: 126.984,
    is_self: false,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1680, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1520, date: '2026-06-10' },
      { fuel_type: 'lpg', price: 890, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000002',
    name: '종로 GS칼텍스',
    brand: 'GSC',
    address: '서울 종로구 종로 456',
    lat: 37.5615,
    lng: 126.987,
    is_self: true,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1650, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1500, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000003',
    name: '용산 현대오일뱅크',
    brand: 'HDO',
    address: '서울 용산구 한강대로 789',
    lat: 37.5705,
    lng: 126.968,
    is_self: false,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1700, date: '2026-06-10' },
      { fuel_type: 'lpg', price: 900, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000004',
    name: '마포 S-OIL',
    brand: 'SOL',
    address: '서울 마포구 마포대로 321',
    lat: 37.5595,
    lng: 126.971,
    is_self: false,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1660, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1510, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000005',
    name: '성북 알뜰주유소',
    brand: 'ETC',
    address: '서울 성북구 성북로 567',
    lat: 37.5785,
    lng: 126.982,
    is_self: true,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1620, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1480, date: '2026-06-10' },
      { fuel_type: 'lpg', price: 870, date: '2026-06-10' },
    ],
  },
]
