import { render, screen } from '@testing-library/react'
import { AvgPriceCard } from '../components/prices/AvgPriceCard'

test('라벨과 가격 렌더링', () => {
  render(<AvgPriceCard label="휘발유" price={1650} delta={3} />)
  expect(screen.getByText('휘발유')).toBeInTheDocument()
  expect(screen.getByText(/1,650/)).toBeInTheDocument()
})

test('전일 대비 상승 시 ▲와 변동폭 표시', () => {
  render(<AvgPriceCard label="휘발유" price={1650} delta={3} />)
  expect(screen.getByText('▲3')).toBeInTheDocument()
})

test('전일 대비 하락 시 ▼와 변동폭(절댓값) 표시', () => {
  render(<AvgPriceCard label="경유" price={1500} delta={-2} />)
  expect(screen.getByText('▼2')).toBeInTheDocument()
})

test('보합(delta=0) 시 보합 표시', () => {
  render(<AvgPriceCard label="LPG" price={880} delta={0} />)
  expect(screen.getByText('보합')).toBeInTheDocument()
})
