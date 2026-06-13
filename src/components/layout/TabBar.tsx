import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: '실시간 유가' },
  { to: '/nearby', label: '주변 주유소' },
  { to: '/news', label: '유가 뉴스' },
]

export function TabBar() {
  return (
    <nav className="flex border-b border-line bg-white shrink-0" aria-label="주요 메뉴">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center min-h-[44px] text-sm font-semibold border-b-2 transition-colors ${
              isActive
                ? 'text-ink border-primary'
                : 'text-sub border-transparent'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
