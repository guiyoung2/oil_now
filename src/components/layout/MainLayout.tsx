import { Outlet } from 'react-router-dom'
import { TabBar } from './TabBar'

export function MainLayout() {
  return (
    <div className="flex h-svh flex-col">
      <header>
        <TabBar />
      </header>
      <main className="flex flex-1 flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  )
}
