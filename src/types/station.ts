export type FuelType = 'gasoline' | 'diesel' | 'lpg' | 'premium' | 'kerosene'
export type SortOrder = 'distance' | 'price'

export interface Station {
  id: string
  name: string
  brand: string
  address: string
  lat: number
  lng: number
  is_self: boolean
}

export interface PriceSnapshot {
  fuel_type: string
  price: number
  date: string
}

export interface StationWithPrice extends Station {
  distance: number
  price: number | null
  latestDate: string | null
  gasolinePrice: number | null
  dieselPrice: number | null
}
