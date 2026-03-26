/**
 * 位置情報に関する型定義
 */

export type MapType = 'image' | '3d'

export interface Coordinates {
  x: number
  y: number
  width?: number
  height?: number
}

export interface WorkLocation {
  id: string
  name: string
  mapType: MapType
  mapFilePath: string // URL or path to map image
  coordinates: Coordinates
  description?: string
}

export interface LocationMarker {
  id: string
  type: 'work' | 'risk'
  title: string
  location: Coordinates
  severity?: 'low' | 'medium' | 'high' // for risk markers
  color?: string // override color
  description?: string
}

export interface WorkLocationData {
  work: {
    id: string
    title: string
    location: WorkLocation
  }
  risks: Array<{
    id: string
    title: string
    location: Coordinates
    severity: 'low' | 'medium' | 'high'
    description?: string
  }>
}
