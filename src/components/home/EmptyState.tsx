export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <p className="text-gray-500 text-sm">주변 2km 내 주유소가 없어요</p>
      <p className="text-gray-400 text-xs mt-1">지역을 변경하거나 다른 유종을 선택해 보세요</p>
    </div>
  )
}
