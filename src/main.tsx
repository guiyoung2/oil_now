import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest(request, print) {
        // mock 대상은 Supabase REST뿐. 그 외(카카오 지도 타일/마커, 정적 자원,
        // 내비게이션 등)는 조용히 통과시켜 콘솔 노이즈를 없앤다.
        const url = new URL(request.url)
        if (url.hostname.endsWith('supabase.co')) {
          print.warning()
        }
      },
    })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
