import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axe from 'axe-core'
import { AvgPriceCard } from '../components/prices/AvgPriceCard'
import { NewsPage } from '../pages/NewsPage'
import { PricesPage } from '../pages/PricesPage'
import { TabBar } from '../components/layout/TabBar'

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container)
  if (results.violations.length > 0) {
    const msgs = results.violations
      .map(
        (v) =>
          `[${v.id}] ${v.description}: ${v.nodes.map((n) => n.html).join(', ')}`,
      )
      .join('\n')
    throw new Error(`a11y violations:\n${msgs}`)
  }
}

test('AvgPriceCard: 상승 delta axe 위반 없음', async () => {
  const { container } = render(
    <AvgPriceCard label="휘발유" price={1650} delta={3} />,
  )
  await checkA11y(container)
})

test('AvgPriceCard: 하락 delta axe 위반 없음', async () => {
  const { container } = render(
    <AvgPriceCard label="경유" price={1500} delta={-2} />,
  )
  await checkA11y(container)
})

test('AvgPriceCard: 보합 delta axe 위반 없음', async () => {
  const { container } = render(
    <AvgPriceCard label="LPG" price={880} delta={0} />,
  )
  await checkA11y(container)
})

test('NewsPage: axe 위반 없음', async () => {
  const qc = new QueryClient()
  const { container } = render(
    <QueryClientProvider client={qc}>
      <NewsPage />
    </QueryClientProvider>,
  )
  await checkA11y(container)
})

test('PricesPage: axe 위반 없음', async () => {
  const qc = new QueryClient()
  const { container } = render(
    <QueryClientProvider client={qc}>
      <PricesPage />
    </QueryClientProvider>,
  )
  // 데이터 로드 대기
  await new Promise((r) => setTimeout(r, 50))
  await checkA11y(container)
})

test('TabBar: axe 위반 없음', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <TabBar />
    </MemoryRouter>,
  )
  await checkA11y(container)
})
