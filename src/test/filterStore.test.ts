import { act } from 'react'
import { useFilterStore } from '../store/filterStore'

beforeEach(() => {
  useFilterStore.setState({ fuelType: 'gasoline', sortOrder: 'distance' })
})

test('초기값 gasoline, distance', () => {
  const state = useFilterStore.getState()
  expect(state.fuelType).toBe('gasoline')
  expect(state.sortOrder).toBe('distance')
})

test('setFuelType → diesel로 변경', () => {
  act(() => useFilterStore.getState().setFuelType('diesel'))
  expect(useFilterStore.getState().fuelType).toBe('diesel')
})

test('setSortOrder → price로 변경', () => {
  act(() => useFilterStore.getState().setSortOrder('price'))
  expect(useFilterStore.getState().sortOrder).toBe('price')
})
