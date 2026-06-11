import { Outlet } from 'react-router-dom'
import { TabBar } from './TabBar'

export function MainLayout() {
  return (
    <div className="flex h-svh flex-col">
      <TabBar />
      <Outlet />
    </div>
  )
}
