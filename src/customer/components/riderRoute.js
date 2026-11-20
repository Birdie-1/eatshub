/**
 * Mock map geometry for the C10 rider map (RiderMap.jsx). Coordinates are in the SVG's 320×200 viewBox.
 * The route enters from the left edge (the restaurant side, which the map doesn't show) and ends at the
 * customer's pin.
 */
export const MAP_WIDTH = 320
export const MAP_HEIGHT = 200

export const ROUTE = [
  [0, 46],
  [118, 46],
  [118, 118],
  [214, 118],
  [214, 158],
  [272, 158],
]

/** Roads drawn under the route (each a polyline); the route itself runs along some of them. */
export const ROADS = [
  [
    [0, 46],
    [320, 46],
  ],
  [
    [0, 118],
    [320, 118],
  ],
  [
    [0, 158],
    [320, 158],
  ],
  [
    [48, 0],
    [48, 200],
  ],
  [
    [118, 0],
    [118, 200],
  ],
  [
    [214, 0],
    [214, 200],
  ],
  [
    [286, 0],
    [286, 200],
  ],
]

const length = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1)

/**
 * The rider's point `progress` (0–1, by distance) along `points`, and the part of the route still ahead
 * of it (starting at that point), for drawing the highlighted line.
 */
export function splitRoute(points, progress) {
  const legs = points.slice(1).map((point, i) => length(points[i], point))
  let left = Math.min(1, Math.max(0, progress)) * legs.reduce((sum, leg) => sum + leg, 0)
  for (let i = 0; i < legs.length; i++) {
    if (left <= legs[i] && legs[i] > 0) {
      const [[x1, y1], [x2, y2]] = [points[i], points[i + 1]]
      const t = left / legs[i]
      const point = [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]
      const rest = points.slice(i + 1)
      return { point, ahead: t === 1 ? rest : [point, ...rest] }
    }
    left -= legs[i]
  }
  const end = points.at(-1)
  return { point: end, ahead: [end] }
}
