import React from 'react'

interface GridMapProps {
  selectedId: string | null
  highlightId: string | null
  showAnswer: boolean
  answerId?: string
  onRegionClick: (id: string) => void
  zoom?: number
}

const GridMap: React.FC<GridMapProps> = ({
  selectedId,
  highlightId,
  showAnswer,
  answerId = '',
  onRegionClick,
  zoom = 1,
}) => {
  const latitudes = [
    { id: 'arctic-circle', name: '北极圈 (66.5°N)', y: 40, isLine: true },
    { id: 'n30', name: '北纬30度', y: 110, isLine: true },
    { id: 'tropic-cancer', name: '北回归线 (23.5°N)', y: 125, isLine: true },
    { id: 'equator', name: '赤道 (0°)', y: 200, isLine: true },
    { id: 'tropic-capricorn', name: '南回归线 (23.5°S)', y: 275, isLine: true },
    { id: 'antarctic-circle', name: '南极圈 (66.5°S)', y: 360, isLine: true },
  ]
  
  const longitudes = [
    { id: 'prime-meridian', name: '本初子午线 (0°)', x: 250, isLine: true },
    { id: 'e120', name: '东经120度', x: 420, isLine: true },
  ]
  
  const quadrants = [
    { id: 'ne-quadrant', name: '东北半球', x: 250, y: 40, w: 250, h: 160, fill: '#FEF3C7' },
    { id: 'nw-quadrant', name: '西北半球', x: 0, y: 40, w: 250, h: 160, fill: '#DBEAFE' },
    { id: 'se-quadrant', name: '东南半球', x: 250, y: 200, w: 250, h: 160, fill: '#D1FAE5' },
    { id: 'sw-quadrant', name: '西南半球', x: 0, y: 200, w: 250, h: 160, fill: '#E9D5FF' },
  ]

  const isSelected = (id: string) => selectedId === id
  const isHighlight = (id: string) => highlightId === id
  const isAnswer = (id: string) => answerId === id && showAnswer

  const getLineStyle = (id: string) => {
    let color = '#6B7280'
    let width = 2
    let opacity = 0.6
    
    if (isSelected(id)) {
      color = '#EF4444'
      width = 4
      opacity = 1
    } else if (isAnswer(id)) {
      color = '#10B981'
      width = 4
      opacity = 1
    } else if (isHighlight(id)) {
      color = '#FF6B6B'
      width = 3
      opacity = 0.8
    }
    
    return { color, width, opacity }
  }

  return (
    <svg
      viewBox="0 0 500 400"
      className="w-full h-full"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
    >
      <rect x="0" y="0" width="500" height="400" fill="#F8FAFC" rx="12" />
      
      <text x="250" y="28" textAnchor="middle" fill="#1E3A5F" fontSize="18" fontWeight="bold">
        经纬网地图
      </text>
      
      {quadrants.map(q => (
        <g
          key={q.id}
          onClick={() => onRegionClick(q.id)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={q.x}
            y={q.y}
            width={q.w}
            height={q.h}
            fill={q.fill}
            stroke={isSelected(q.id) ? '#EF4444' : (isAnswer(q.id) ? '#10B981' : '#E5E7EB')}
            strokeWidth={isSelected(q.id) || isAnswer(q.id) ? 3 : 1}
            opacity={isHighlight(q.id) ? 0.8 : 1}
          />
          <text
            x={q.x + q.w / 2}
            y={q.y + q.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#374151"
            pointerEvents="none"
          >
            {q.name}
          </text>
          <title>{q.name}</title>
        </g>
      ))}
      
      {latitudes.map(lat => {
        const style = getLineStyle(lat.id)
        return (
          <g key={lat.id} onClick={() => onRegionClick(lat.id)} style={{ cursor: 'pointer' }}>
            <line
              x1="20"
              y1={lat.y}
              x2="480"
              y2={lat.y}
              stroke={style.color}
              strokeWidth={style.width}
              strokeDasharray={lat.id === 'equator' ? 'none' : '5,5'}
              opacity={style.opacity}
            />
            <text x="25" y={lat.y - 5} fontSize="10" fill={style.color} fontWeight="bold">
              {lat.name.split('(')[0]}
            </text>
            <title>{lat.name}</title>
          </g>
        )
      })}
      
      {longitudes.map(lon => {
        const style = getLineStyle(lon.id)
        return (
          <g key={lon.id} onClick={() => onRegionClick(lon.id)} style={{ cursor: 'pointer' }}>
            <line
              x1={lon.x}
              y1="40"
              x2={lon.x}
              y2="360"
              stroke={style.color}
              strokeWidth={style.width}
              strokeDasharray="5,5"
              opacity={style.opacity}
            />
            <text
              x={lon.x}
              y="55"
              textAnchor="middle"
              fontSize="10"
              fill={style.color}
              fontWeight="bold"
            >
              {lon.name.split('(')[0]}
            </text>
            <title>{lon.name}</title>
          </g>
        )
      })}
      
      <text x="10" y="395" fontSize="11" fill="#6B7280">方向：上北下南，左西右东</text>
    </svg>
  )
}

export default GridMap
