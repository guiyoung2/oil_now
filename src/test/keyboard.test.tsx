import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { FilterBar } from '../components/home/FilterBar'
import { TabBar } from '../components/layout/TabBar'
import { StationCard } from '../components/home/StationCard'
import { useFilterStore } from '../store/filterStore'
import type { StationWithPrice } from '../types/station'

const station: StationWithPrice = {
  id: 'A0000001',
  name: '강남 SK에너지',
  brand: 'SKE',
  address: '서울 강남구',
  lat: 37.568,
  lng: 127.0,
  is_self: false,
  distance: 340,
  price: 1680,
  latestDate: '2026-06-10',
  gasolinePrice: 1680,
  dieselPrice: 1520,
}

beforeEach(() => {
  useFilterStore.setState({ fuelType: 'gasoline_diesel', sortOrder: 'distance' })
})

describe('FilterBar 키보드 내비게이션', () => {
  test('Tab 키로 FilterBar 요소 순차 접근', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)
    await user.tab()
    expect(screen.getByRole('radio', { name: '휘발유·경유' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('radio', { name: 'LPG' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('combobox', { name: '정렬 기준' })).toHaveFocus()
  })

  test('LPG 버튼 포커스 후 Space → fuelType lpg 변경', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)
    await user.tab()
    await user.tab() // LPG에 포커스
    await user.keyboard(' ')
    expect(useFilterStore.getState().fuelType).toBe('lpg')
  })

  test('LPG 버튼 포커스 후 Enter → fuelType lpg 변경', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)
    await user.tab()
    await user.tab() // LPG에 포커스
    await user.keyboard('{Enter}')
    expect(useFilterStore.getState().fuelType).toBe('lpg')
  })
})

describe('TabBar 키보드 내비게이션', () => {
  test('Tab 키로 TabBar 링크 순차 접근 가능', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <TabBar />
      </MemoryRouter>,
    )
    await user.tab()
    expect(screen.getByRole('link', { name: '실시간 유가' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: '주변 주유소' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: '유가 뉴스' })).toHaveFocus()
  })
})

describe('StationCard 키보드 활성화', () => {
  test('Tab으로 버튼에 포커스 후 Enter → onClick 호출', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <StationCard
        station={station}
        isLowest={false}
        onClick={onClick}
        fuelType="gasoline_diesel"
      />,
    )
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('Tab으로 버튼에 포커스 후 Space → onClick 호출', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <StationCard
        station={station}
        isLowest={false}
        onClick={onClick}
        fuelType="gasoline_diesel"
      />,
    )
    await user.tab()
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
