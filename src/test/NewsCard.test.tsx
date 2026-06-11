import { render, screen } from '@testing-library/react'
import { NewsCard } from '../components/news/NewsCard'

const ITEM = {
  id: 'uuid-1',
  title: '국제 유가 3% 급락…WTI 배럴당 70달러 하회',
  url: 'https://example.com/news/1',
  source: '연합뉴스',
  published_at: '2026-06-12T03:00:00Z',
  summary: '미국 원유 재고 증가로 국제 유가가 큰 폭으로 하락했다.',
  collected_at: '2026-06-12T06:00:00Z',
}

test('제목 렌더링', () => {
  render(<NewsCard item={ITEM} />)
  expect(screen.getByText(ITEM.title)).toBeInTheDocument()
})

test('언론사 렌더링', () => {
  render(<NewsCard item={ITEM} />)
  expect(screen.getByText('연합뉴스')).toBeInTheDocument()
})

test('summary 렌더링', () => {
  render(<NewsCard item={ITEM} />)
  expect(screen.getByText(ITEM.summary)).toBeInTheDocument()
})

test('외부 링크 — target="_blank" + rel="noopener noreferrer"', () => {
  render(<NewsCard item={ITEM} />)
  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', ITEM.url)
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})
