export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="#0e9f58"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-ink text-sm font-bold">주변 2km 내 주유소가 없어요</p>
      <p className="text-sub text-xs mt-1">지역을 변경하거나 다른 유종을 선택해 보세요</p>
    </div>
  )
}
