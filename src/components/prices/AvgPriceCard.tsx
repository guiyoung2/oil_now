interface Props {
  label: string
  price: number
  delta: number
  variant?: 'compact' | 'hero'
}

export function AvgPriceCard({ label, price, delta, variant = 'compact' }: Props) {
  const deltaText = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : '보합'
  const deltaColor = delta > 0 ? 'text-red-700' : delta < 0 ? 'text-blue-600' : 'text-sub'
  const deltaSr =
    delta > 0
      ? `전일 대비 상승 ${delta}원`
      : delta < 0
        ? `전일 대비 하락 ${Math.abs(delta)}원`
        : null

  if (variant === 'hero') {
    return (
      <div className="rounded-xl bg-gradient-to-br from-primary-deep to-primary-700 px-5 py-5 text-white">
        <div className="flex items-baseline gap-1.5 text-sm font-bold">
          <span className="opacity-90">전국 평균</span>
          <span className="opacity-60">·</span>
          <span>{label}</span>
        </div>
        <div className="mt-1.5 text-[2rem] font-extrabold leading-tight tracking-tight">
          {price.toLocaleString()}
          <span className="ml-1 text-lg font-bold">원</span>
        </div>
        <div
          className={`mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold ${deltaColor}`}
        >
          <span aria-hidden="true">{deltaText}</span>
          {deltaSr && <span className="sr-only">{deltaSr}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 rounded-lg bg-white px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
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
