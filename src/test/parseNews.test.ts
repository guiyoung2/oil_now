import { parseNewsRss } from '../lib/parseNews'

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>유가 기름값 - Google 뉴스</title>
    <item>
      <title>국제 유가 3% 급락…WTI 배럴당 70달러 하회</title>
      <link>https://news.google.com/articles/1</link>
      <source url="https://yna.co.kr">연합뉴스</source>
      <pubDate>Fri, 12 Jun 2026 03:00:00 GMT</pubDate>
      <description>&lt;![CDATA[미국 원유 재고 증가로 국제 유가가 큰 폭으로 하락했다. 이번 하락은 예상보다 많은 재고량으로 인한 것으로 분석된다.]]&gt;</description>
    </item>
    <item>
      <title>국내 주유소 휘발유 가격 소폭 하락</title>
      <link>https://news.google.com/articles/2</link>
      <source url="https://news.kbs.co.kr">KBS</source>
      <pubDate>Thu, 11 Jun 2026 12:00:00 GMT</pubDate>
      <description>전국 주유소 평균 휘발유 판매가격이 소폭 하락하며 2천원대 초반을 유지하고 있다.</description>
    </item>
  </channel>
</rss>`

test('RSS XML에서 뉴스 아이템 2건 파싱', () => {
  const result = parseNewsRss(SAMPLE_RSS)
  expect(result).toHaveLength(2)
})

test('title, url, source, published_at, summary 필드 추출', () => {
  const result = parseNewsRss(SAMPLE_RSS)
  const first = result[0]
  expect(first.title).toBe('국제 유가 3% 급락…WTI 배럴당 70달러 하회')
  expect(first.url).toBe('https://news.google.com/articles/1')
  expect(first.source).toBe('연합뉴스')
  expect(first.published_at).toBeTruthy()
  expect(typeof first.summary).toBe('string')
})

test('summary는 150자 이하', () => {
  const result = parseNewsRss(SAMPLE_RSS)
  result.forEach((item) => {
    expect(item.summary.length).toBeLessThanOrEqual(150)
  })
})

test('빈 RSS에서 빈 배열 반환', () => {
  const emptyRss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel></channel></rss>`
  expect(parseNewsRss(emptyRss)).toHaveLength(0)
})

test('HTML 엔티티 디코딩 — title &amp; / summary &lt;a&gt; 처리', () => {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item>
    <title>SK이노베이션 &amp; GS칼텍스 유가 대응</title>
    <link>https://example.com/3</link>
    <source>연합뉴스</source>
    <pubDate>Fri, 12 Jun 2026 03:00:00 GMT</pubDate>
    <description>&lt;a href="https://example.com"&gt;전문 보기&lt;/a&gt; 국제 유가 상승으로 정유사 대응 분주</description>
  </item>
</channel></rss>`
  const result = parseNewsRss(rss)
  expect(result[0].title).toBe('SK이노베이션 & GS칼텍스 유가 대응')
  expect(result[0].summary).not.toContain('&lt;')
  expect(result[0].summary).not.toContain('&gt;')
  expect(result[0].summary).not.toContain('<a')
})
