interface Props {
  label: string
  price: number
  delta: number
}

export function AvgPriceCard({ label, price, delta }: Props) {
  const deltaText = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : '보합'
  const deltaColor = delta > 0 ? 'text-red-700' : delta < 0 ? 'text-blue-600' : 'text-sub'
  const deltaSr =
    delta > 0
      ? `전일 대비 상승 ${delta}원`
      : delta < 0
        ? `전일 대비 하락 ${Math.abs(delta)}원`
        : null

  return (
    <div className="flex-1 rounded-lg bg-white px-3 py-4 text-center shadow-[0_2px_12px_rgba(20,80,50,0.08)]">
      <div className="text-xs text-sub">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-ink">
        {price.toLocaleString()}
        <span className="ml-0.5 text-xs font-normal text-sub">원</span>
      </div>
      <div className={`mt-1 text-xs font-bold ${deltaColor}`}>
        <span aria-hidden="true">{deltaText}</span>
        {deltaSr && <span className="sr-only">{deltaSr}</span>}
      </div>
    </div>
  )
}
