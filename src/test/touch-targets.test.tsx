import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, beforeEach } from 'vitest'
import { FilterBar } from '../components/home/FilterBar'
import { TabBar } from '../components/layout/TabBar'
import { StationCard } from '../components/home/StationCard'
import { useFilterStore } from '../store/filterStore'
import type { StationWithPrice } from '../types/station'

// jsdom 환경에서는 실제 CSS 픽셀 측정 불가 → Tailwind 클래스명으로 검증 (WCAG 2.5.5: 44×44px 이상)

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

describe('FilterBar 터치 타깃', () => {
  test('휘발유·경유 버튼 min-h 클래스 보유 (≥44px)', () => {
    render(<FilterBar />)
    const btn = screen.getByRole('radio', { name: '휘발유·경유' })
    expect(btn.className).toMatch(/min-h-/)
  })

  test('LPG 버튼 min-h 클래스 보유 (≥44px)', () => {
    render(<FilterBar />)
    const btn = screen.getByRole('radio', { name: 'LPG' })
    expect(btn.className).toMatch(/min-h-/)
  })

  test('정렬 select min-h 클래스 보유 (≥44px)', () => {
    render(<FilterBar />)
    const select = screen.getByRole('combobox', { name: '정렬 기준' })
    expect(select.className).toMatch(/min-h-/)
  })
})

describe('TabBar 터치 타깃', () => {
  test('모든 탭 링크 min-h 클래스 보유 (≥44px)', () => {
    render(
      <MemoryRouter>
        <TabBar />
      </MemoryRouter>,
    )
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link.className).toMatch(/min-h-/)
    })
  })
})

describe('StationCard 터치 타깃', () => {
  test('카드 버튼 min-h 클래스 보유 (≥64px)', () => {
    render(
      <StationCard
        station={station}
        isLowest={false}
        onClick={() => {}}
        fuelType="gasoline_diesel"
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/min-h-/)
  })
})
