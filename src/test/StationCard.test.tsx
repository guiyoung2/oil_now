import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { StationCard } from '../components/home/StationCard'
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
}

describe('StationCard', () => {
  test('이름, 거리, 가격 렌더링', () => {
    render(<StationCard station={station} isLowest={false} onClick={() => {}} />)
    expect(screen.getByText('강남 SK에너지')).toBeInTheDocument()
    expect(screen.getByText(/340m/)).toBeInTheDocument()
    expect(screen.getByText(/1,680원/)).toBeInTheDocument()
  })

  test('price null → — 표시', () => {
    render(<StationCard station={{ ...station, price: null }} isLowest={false} onClick={() => {}} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  test('isLowest=true → 가격에 text-blue-600 클래스', () => {
    render(<StationCard station={station} isLowest={true} onClick={() => {}} />)
    expect(screen.getByText(/1,680원/)).toHaveClass('text-blue-600')
  })

  test('셀프 주유소 표시', () => {
    render(<StationCard station={{ ...station, is_self: true }} isLowest={false} onClick={() => {}} />)
    expect(screen.getByText('셀프')).toBeInTheDocument()
  })

  test('onClick 핸들러 호출', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<StationCard station={station} isLowest={false} onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
