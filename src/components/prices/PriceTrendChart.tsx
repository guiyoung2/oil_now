import { useEffect, useRef, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import type { PriceTrendPoint } from '../../types/avgPrice'

interface Props {
  data: PriceTrendPoint[]
}

const HEIGHT = 200

// ResponsiveContainer 대신 컨테이너 너비를 직접 측정한다.
// (ResponsiveContainer는 초기 렌더에서 width(-1) 측정 경고를 남김)
export function PriceTrendChart({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-label="휘발유 가격 변동 추이"
      role="img"
      style={{ width: '100%', height: HEIGHT }}
    >
      {width > 0 && (
        <AreaChart
          width={width}
          height={HEIGHT}
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16b364" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#16b364" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => {
              const [, m, day] = d.split('-')
              return `${parseInt(m)}/${parseInt(day)}`
            }}
            fontSize={11}
          />
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} width={44} fontSize={11} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#16b364"
            strokeWidth={2.5}
            fill="url(#priceFill)"
            dot={false}
          />
        </AreaChart>
      )}
    </div>
  )
}
