import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '../components/home/FilterBar'
import { useFilterStore } from '../store/filterStore'

beforeEach(() => {
  useFilterStore.setState({ fuelType: 'gasoline_diesel', sortOrder: 'distance' })
})

test('유종 버튼 2개 렌더링', () => {
  render(<FilterBar />)
  expect(screen.getByRole('radio', { name: '휘발유·경유' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'LPG' })).toBeInTheDocument()
})

test('LPG 클릭 → filterStore fuelType=lpg', async () => {
  const user = userEvent.setup()
  render(<FilterBar />)
  await user.click(screen.getByRole('radio', { name: 'LPG' }))
  expect(useFilterStore.getState().fuelType).toBe('lpg')
})

test('정렬 select → price 선택', async () => {
  const user = userEvent.setup()
  render(<FilterBar />)
  await user.selectOptions(screen.getByRole('combobox', { name: '정렬 기준' }), 'price')
  expect(useFilterStore.getState().sortOrder).toBe('price')
})

test('선택된 유종 버튼 aria-checked=true', () => {
  render(<FilterBar />)
  expect(screen.getByRole('radio', { name: '휘발유·경유' })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: 'LPG' })).toHaveAttribute('aria-checked', 'false')
})
