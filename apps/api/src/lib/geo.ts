/**
 * Geo utilities - Haversine distance, cell calculations
 * Menggunakan formula Haversine untuk kalkulasi jarak
 */

export interface Coordinate {
  lat: number
  lng: number
}

/**
 * Kalkulasi jarak Haversine antara dua titik dalam km
 */
export function haversine(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371 // Radius Bumi dalam km
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Generate grid cells untuk heatmap
 */
export interface GridCell {
  cell_id: string
  lat: number
  lng: number
  north: number
  south: number
  east: number
  west: number
}

export interface BBox {
  north: number
  south: number
  east: number
  west: number
}

export function generateGridCells(bbox: BBox, cellSizeMeters: number = 200): GridCell[] {
  const cells: GridCell[] = []
  
  // Convert meter to degrees (approximate)
  const latStep = cellSizeMeters / 111320 // 1 degree lat ≈ 111.32 km
  const lngStep = cellSizeMeters / (111320 * Math.cos(toRad((bbox.north + bbox.south) / 2)))
  
  let lat = bbox.south
  let cellIndex = 0
  
  while (lat < bbox.north) {
    let lng = bbox.west
    
    while (lng < bbox.east) {
      const cell: GridCell = {
        cell_id: `cell_${cellIndex}`,
        lat: lat + latStep / 2,
        lng: lng + lngStep / 2,
        north: Math.min(lat + latStep, bbox.north),
        south: lat,
        east: Math.min(lng + lngStep, bbox.east),
        west: lng
      }
      
      cells.push(cell)
      cellIndex++
      lng += lngStep
    }
    
    lat += latStep
    
    // Cap cells untuk performa
    if (cells.length >= 2500) break
  }
  
  return cells
}

/**
 * Hash BBox untuk cache key
 */
export function hashBBox(bbox: BBox): string {
  const str = `${bbox.north.toFixed(4)},${bbox.south.toFixed(4)},${bbox.east.toFixed(4)},${bbox.west.toFixed(4)}`
  
  // Simple hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(36)
}

/**
 * Decay function untuk cannibalization (distance-decay)
 * decay(d) = e^(-lambda × d)
 */
export function distanceDecay(distanceKm: number, lambda: number = 0.5): number {
  return Math.exp(-lambda * distanceKm)
}

/**
 * Interpolasi nilai sel dari sel tetangganya
 */
export function interpolateCellValue(
  cells: GridCell[],
  targetLat: number,
  targetLng: number,
  valueKey: string = 'value'
): number | null {
  // Find nearest neighbors
  const neighbors = cells
    .map(cell => ({
      ...cell,
      distance: haversine({ lat: cell.lat, lng: cell.lng }, { lat: targetLat, lng: targetLng })
    }))
    .filter(c => c.distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4)
  
  if (neighbors.length === 0) return null
  
  // Inverse distance weighting
  let totalWeight = 0
  let weightedSum = 0
  
  for (const neighbor of neighbors) {
    const weight = 1 / (neighbor.distance * neighbor.distance)
    const value = (neighbor as any)[valueKey] || 0
    weightedSum += weight * value
    totalWeight += weight
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : null
}

/**
 * Normalisasi nilai ke percentile 0-100
 */
export function normalizeToPercentile(values: number[]): number[] {
  if (values.length === 0) return []
  
  const sorted = [...values].sort((a, b) => a - b)
  
  return values.map(val => {
    const rank = sorted.findIndex(v => v >= val)
    return ((rank + 1) / sorted.length) * 100
  })
}

/**
 * Z-score normalization
 */
export function zScore(values: number[]): number[] {
  if (values.length === 0) return []
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
  
  if (std === 0) return values.map(() => 0)
  
  return values.map(val => (val - mean) / std)
}

/**
 * Kalkulasi luas poligon (simplified - untuk Voronoi)
 * Menggunakan formula Shoelace
 */
export function polygonArea(coordinates: number[][]): number {
  let area = 0
  const n = coordinates.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += coordinates[i][1] * coordinates[j][0]
    area -= coordinates[j][1] * coordinates[i][0]
  }
  
  area = Math.abs(area) / 2
  
  // Convert dari degrees^2 ke km^2 (approximate)
  const latCenter = coordinates.reduce((sum, c) => sum + c[1], 0) / n
  const kmPerDegreeLat = 111.32
  const kmPerDegreeLng = 111.32 * Math.cos(latCenter * Math.PI / 180)
  
  return area * kmPerDegreeLat * kmPerDegreeLng
}

/**
 * Cek apakah point berada dalam polygon
 */
export function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  let inside = false
  const n = polygon.length
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]
    
    if (((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}
