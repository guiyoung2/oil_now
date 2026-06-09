import { render, screen } from '@testing-library/react'
import App from '../App'

test('App 렌더링 smoke test', () => {
  render(<App />)
  expect(screen.getByText('오일나우')).toBeInTheDocument()
})
