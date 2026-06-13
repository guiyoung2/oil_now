import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: '실시간 유가' },
  { to: '/nearby', label: '주변 주유소' },
  { to: '/news', label: '유가 뉴스' },
]

export function TabBar() {
  return (
    <nav className="flex gap-1.5 bg-white px-3 pb-2 shrink-0" aria-label="주요 메뉴">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center min-h-[44px] rounded-full text-[13px] font-bold transition-colors ${
              isActive
                ? 'bg-primary-700 text-white'
                : 'bg-surface text-sub hover:bg-line'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
