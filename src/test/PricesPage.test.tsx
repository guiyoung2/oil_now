import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PricesPage } from '../pages/PricesPage'

function renderPage() {
  const qc = new QueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <PricesPage />
    </QueryClientProvider>,
  )
}

test('전국 평균가 3유종 렌더링', async () => {
  renderPage()
  expect(await screen.findByText('휘발유')).toBeInTheDocument()
  expect(screen.getByText('경유')).toBeInTheDocument()
  expect(screen.getByText('LPG')).toBeInTheDocument()
})

test('가격 변동 추이 영역 렌더링', async () => {
  renderPage()
  expect(await screen.findByLabelText('휘발유 가격 변동 추이')).toBeInTheDocument()
})
