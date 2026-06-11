import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
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
        <LineChart
          width={width}
          height={HEIGHT}
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={11} />
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} width={44} fontSize={11} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      )}
    </div>
  )
}
