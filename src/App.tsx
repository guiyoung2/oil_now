import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from './components/layout/MainLayout'
import { PricesPage } from './pages/PricesPage'
import { HomePage } from './pages/HomePage'
import { NewsPage } from './pages/NewsPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<PricesPage />} />
            <Route path="/nearby" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
          </Route>
          <Route path="/stations/:id" element={<div className="p-4">상세 화면 (Step 5)</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
