import { act } from 'react'
import { useFilterStore } from '../store/filterStore'

beforeEach(() => {
  useFilterStore.setState({ fuelType: 'gasoline_diesel', sortOrder: 'distance' })
})

test('초기값 gasoline_diesel, distance', () => {
  const state = useFilterStore.getState()
  expect(state.fuelType).toBe('gasoline_diesel')
  expect(state.sortOrder).toBe('distance')
})

test('setFuelType → lpg로 변경', () => {
  act(() => useFilterStore.getState().setFuelType('lpg'))
  expect(useFilterStore.getState().fuelType).toBe('lpg')
})

test('setSortOrder → price로 변경', () => {
  act(() => useFilterStore.getState().setSortOrder('price'))
  expect(useFilterStore.getState().sortOrder).toBe('price')
})
