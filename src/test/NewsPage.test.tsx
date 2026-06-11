import { render, screen } from '@testing-library/react'
import { NewsPage } from '../pages/NewsPage'

test('준비 중 안내 렌더링', () => {
  render(<NewsPage />)
  expect(screen.getByText(/준비 중/)).toBeInTheDocument()
})
