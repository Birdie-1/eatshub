import { describe, expect, it } from 'vitest'
import { splitRoute } from './riderRoute'

const route = [
  [0, 0],
  [10, 0],
  [10, 10],
]

describe('splitRoute', () => {
  it('puts the rider at the start with the whole route ahead', () => {
    expect(splitRoute(route, 0)).toEqual({ point: [0, 0], ahead: route })
  })

  it('walks by distance, across corners', () => {
    expect(splitRoute(route, 0.25)).toEqual({
      point: [5, 0],
      ahead: [
        [5, 0],
        [10, 0],
        [10, 10],
      ],
    })
    expect(splitRoute(route, 0.75)).toEqual({
      point: [10, 5],
      ahead: [
        [10, 5],
        [10, 10],
      ],
    })
  })

  it('clamps progress to the route', () => {
    expect(splitRoute(route, 1).point).toEqual([10, 10])
    expect(splitRoute(route, 2).point).toEqual([10, 10])
    expect(splitRoute(route, -1).point).toEqual([0, 0])
  })
})
