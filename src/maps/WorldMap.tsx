import React from 'react'

interface WorldMapProps {
  selectedId: string | null
  highlightId: string | null
  showAnswer: boolean
  answerId?: string
  onRegionClick: (id: string) => void
  zoom?: number
}

const WorldMap: React.FC<WorldMapProps> = ({
  selectedId,
  highlightId,
  showAnswer,
  answerId = '',
  onRegionClick,
  zoom = 1,
}) => {
  const continents = [
    { id: 'asia', name: '亚洲', x: 340, y: 80, w: 180, h: 140, fill: '#FCA5A5' },
    { id: 'europe', name: '欧洲', x: 280, y: 70, w: 80, h: 70, fill: '#FCD34D' },
    { id: 'africa', name: '非洲', x: 290, y: 170, w: 90, h: 130, fill: '#FBBF24' },
    { id: 'north-america', name: '北美洲', x: 70, y: 70, w: 130, h: 120, fill: '#93C5FD' },
    { id: 'south-america', name: '南美洲', x: 120, y: 200, w: 70, h: 130, fill: '#6EE7B7' },
    { id: 'oceania', name: '大洋洲', x: 440, y: 270, w: 80, h: 60, fill: '#C4B5FD' },
    { id: 'antarctica', name: '南极洲', x: 50, y: 380, w: 480, h: 40, fill: '#E0F2FE' },
  ]
  
  const oceans = [
    { id: 'pacific', name: '太平洋', x: 180, y: 160, w: 180, h: 180, fill: '#BAE6FD' },
    { id: 'atlantic', name: '大西洋', x: 220, y: 130, w: 70, h: 200, fill: '#7DD3FC' },
    { id: 'indian', name: '印度洋', x: 390, y: 200, w: 80, h: 90, fill: '#38BDF8' },
    { id: 'arctic', name: '北冰洋', x: 150, y: 20, w: 280, h: 50, fill: '#E0F7FA' },
  ]

  const handleClick = (id: string) => {
    onRegionClick(id)
  }

  return (
    <svg
      viewBox="0 0 600 450"
      className="w-full h-full"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
    >
      <rect x="0" y="0" width="600" height="450" fill="#E0F2FE" rx="12" />
      
      <text x="300" y="28" textAnchor="middle" fill="#1E3A5F" fontSize="18" fontWeight="bold">
        世界地图
      </text>
      
      {oceans.map(ocean => (
        <g
          key={ocean.id}
          onClick={() => handleClick(ocean.id)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={ocean.x}
            y={ocean.y}
            width={ocean.w}
            height={ocean.h}
            fill={ocean.fill}
            stroke={selectedId === ocean.id ? '#10B981' : (showAnswer && answerId === ocean.id ? '#10B981' : '#93C5FD')}
            strokeWidth={selectedId === ocean.id || (showAnswer && answerId === ocean.id) ? 3 : 1}
            rx="8"
            opacity={0.6}
          />
          <text
            x={ocean.x + ocean.w / 2}
            y={ocean.y + ocean.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#1E40AF"
            pointerEvents="none"
          >
            {ocean.name}
          </text>
          <title>{ocean.name}</title>
        </g>
      ))}
      
      {continents.map(continent => (
        <g
          key={continent.id}
          onClick={() => handleClick(continent.id)}
          style={{ cursor: 'pointer' }}
          className="map-region"
        >
          <rect
            x={continent.x}
            y={continent.y}
            width={continent.w}
            height={continent.h}
            fill={continent.fill}
            stroke={selectedId === continent.id 
              ? '#EF4444' 
              : (showAnswer && answerId === continent.id 
                ? '#10B981' 
                : (highlightId === continent.id ? '#FF6B6B' : '#2D3748'))}
            strokeWidth={selectedId === continent.id || (showAnswer && answerId === continent.id) ? 4 : (highlightId === continent.id ? 3 : 1.5)}
            rx="10"
            style={{ transition: 'all 0.2s ease' }}
          />
          <text
            x={continent.x + continent.w / 2}
            y={continent.y + continent.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="13"
            fontWeight="bold"
            fill="#1F2937"
            pointerEvents="none"
          >
            {continent.name}
          </text>
          <title>{continent.name}</title>
        </g>
      ))}
    </svg>
  )
}

export default WorldMap
