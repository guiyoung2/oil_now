import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TabBar } from '../components/layout/TabBar'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TabBar />
    </MemoryRouter>,
  )
}

test('3개 탭 렌더링', () => {
  renderAt('/')
  expect(screen.getByRole('link', { name: '실시간 유가' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '주변 주유소' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '유가 뉴스' })).toBeInTheDocument()
})

test('현재 경로(/)의 탭에 aria-current=page', () => {
  renderAt('/')
  expect(screen.getByRole('link', { name: '실시간 유가' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(screen.getByRole('link', { name: '주변 주유소' })).not.toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('/nearby 경로에서 주변 주유소 탭 활성', () => {
  renderAt('/nearby')
  expect(screen.getByRole('link', { name: '주변 주유소' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})
