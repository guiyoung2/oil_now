import { Outlet } from 'react-router-dom'
import { TabBar } from './TabBar'

export function MainLayout() {
  return (
    <div className="flex h-svh flex-col">
      <header className="shrink-0 bg-white">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-primary"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path
                fill="#fff"
                d="M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z"
              />
            </svg>
          </span>
          <span className="text-base font-extrabold tracking-tight text-ink">오일나우</span>
        </div>
        <TabBar />
      </header>
      <main className="flex flex-1 flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  )
}
