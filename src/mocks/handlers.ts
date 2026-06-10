import { http, HttpResponse } from 'msw'
import { stationFixtures } from './stationFixtures'

export const handlers = [
  http.get(/\/rest\/v1\/stations/, () => {
    return HttpResponse.json(stationFixtures, {
      headers: { 'Content-Range': '0-4/5' },
    })
  }),
]
