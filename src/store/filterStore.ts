import { create } from 'zustand'
import type { FuelType, SortOrder } from '../types/station'

interface FilterState {
  fuelType: FuelType
  sortOrder: SortOrder
  setFuelType: (fuelType: FuelType) => void
  setSortOrder: (sortOrder: SortOrder) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  fuelType: 'gasoline_diesel',
  sortOrder: 'distance',
  setFuelType: (fuelType) => set({ fuelType }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
}))
