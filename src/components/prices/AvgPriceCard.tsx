interface Props {
  label: string
  price: number
  delta: number
}

export function AvgPriceCard({ label, price, delta }: Props) {
  const deltaText = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : '보합'
  const deltaColor =
    delta > 0 ? 'text-red-500' : delta < 0 ? 'text-blue-600' : 'text-gray-400'
  return (
    <div className="flex-1 rounded-lg border bg-white px-3 py-4 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-gray-900">
        {price.toLocaleString()}
        <span className="ml-0.5 text-xs font-normal text-gray-400">원</span>
      </div>
      <div className={`mt-1 text-xs font-medium ${deltaColor}`}>
        <span aria-hidden="true">{deltaText}</span>
        {delta !== 0 && (
          <span className="sr-only">
            {delta > 0 ? `전일 대비 상승 ${delta}원` : `전일 대비 하락 ${Math.abs(delta)}원`}
          </span>
        )}
      </div>
    </div>
  )
}
