import React from 'react'
import ChinaMap from './ChinaMap'
import WorldMap from './WorldMap'
import GridMap from './GridMap'
import CampusMap from './CampusMap'
import type { MapType } from '../types'

interface MapComponentProps {
  mapType: MapType
  selectedId: string | null
  highlightId: string | null
  showAnswer: boolean
  answerId?: string
  onRegionClick: (id: string) => void
  zoom?: number
}

const MapComponent: React.FC<MapComponentProps> = ({
  mapType,
  selectedId,
  highlightId,
  showAnswer,
  answerId,
  onRegionClick,
  zoom = 1,
}) => {
  const props = { selectedId, highlightId, showAnswer, answerId, onRegionClick, zoom }
  
  switch (mapType) {
    case 'china':
      return <ChinaMap {...props} />
    case 'world':
      return <WorldMap {...props} />
    case 'grid':
      return <GridMap {...props} />
    case 'campus':
      return <CampusMap {...props} />
    default:
      return <ChinaMap {...props} />
  }
}

export default MapComponent
