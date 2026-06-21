import React from 'react'

interface CampusMapProps {
  selectedId: string | null
  highlightId: string | null
  showAnswer: boolean
  answerId?: string
  onRegionClick: (id: string) => void
  zoom?: number
}

const CampusMap: React.FC<CampusMapProps> = ({
  selectedId,
  highlightId,
  showAnswer,
  answerId = '',
  onRegionClick,
  zoom = 1,
}) => {
  const buildings = [
    { id: 'classroom', name: '教学楼', x: 140, y: 60, w: 120, h: 80, fill: '#93C5FD' },
    { id: 'lab', name: '实验楼', x: 280, y: 60, w: 100, h: 70, fill: '#C4B5FD' },
    { id: 'office', name: '教师办公室', x: 140, y: 160, w: 80, h: 50, fill: '#FCD34D' },
    { id: 'library', name: '图书馆', x: 240, y: 150, w: 90, h: 60, fill: '#FCA5A5' },
    { id: 'canteen', name: '食堂', x: 350, y: 150, w: 80, h: 60, fill: '#6EE7B7' },
    { id: 'gym', name: '体育馆', x: 350, y: 230, w: 90, h: 70, fill: '#FDBA74' },
    { id: 'playground', name: '操场', x: 40, y: 220, w: 130, h: 120, fill: '#BBF7D0' },
    { id: 'garden', name: '花园', x: 200, y: 240, w: 110, h: 70, fill: '#86EFAC' },
    { id: 'dorm', name: '宿舍楼', x: 380, y: 60, w: 70, h: 70, fill: '#A5B4FC' },
  ]
  
  const gates = [
    { id: 'north-gate', name: '北门', x: 210, y: 10, w: 60, h: 25, fill: '#F87171' },
    { id: 'south-gate', name: '南门', x: 210, y: 355, w: 60, h: 25, fill: '#60A5FA' },
  ]

  const handleClick = (id: string) => {
    onRegionClick(id)
  }

  const isSelected = (id: string) => selectedId === id
  const isHighlight = (id: string) => highlightId === id
  const isAnswer = (id: string) => answerId === id && showAnswer

  const getStroke = (id: string) => {
    if (isSelected(id)) return '#EF4444'
    if (isAnswer(id)) return '#10B981'
    if (isHighlight(id)) return '#FF6B6B'
    return '#374151'
  }

  const getStrokeWidth = (id: string) => {
    if (isSelected(id) || isAnswer(id)) return 4
    if (isHighlight(id)) return 3
    return 1.5
  }

  return (
    <svg
      viewBox="0 0 480 400"
      className="w-full h-full"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
    >
      <rect x="0" y="0" width="480" height="400" fill="#F0FDF4" rx="12" />
      
      <text x="240" y="28" textAnchor="middle" fill="#14532D" fontSize="18" fontWeight="bold">
        校园平面图
      </text>
      
      <rect x="20" y="40" width="440" height="340" fill="none" stroke="#065F46" strokeWidth="3" rx="8" />
      
      {buildings.map(building => (
        <g
          key={building.id}
          onClick={() => handleClick(building.id)}
          style={{ cursor: 'pointer' }}
          className="map-region"
        >
          <rect
            x={building.x}
            y={building.y}
            width={building.w}
            height={building.h}
            fill={building.fill}
            stroke={getStroke(building.id)}
            strokeWidth={getStrokeWidth(building.id)}
            rx="6"
            style={{ transition: 'all 0.2s ease' }}
          />
          <text
            x={building.x + building.w / 2}
            y={building.y + building.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={building.w > 90 ? '13' : '11'}
            fontWeight="bold"
            fill="#1F2937"
            pointerEvents="none"
          >
            {building.name}
          </text>
          <title>{building.name}</title>
        </g>
      ))}
      
      {gates.map(gate => (
        <g
          key={gate.id}
          onClick={() => handleClick(gate.id)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={gate.x}
            y={gate.y}
            width={gate.w}
            height={gate.h}
            fill={gate.fill}
            stroke={getStroke(gate.id)}
            strokeWidth={getStrokeWidth(gate.id)}
            rx="4"
            strokeDasharray="4,2"
          />
          <text
            x={gate.x + gate.w / 2}
            y={gate.y + gate.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#7F1D1D"
            pointerEvents="none"
          >
            {gate.name}
          </text>
          <title>{gate.name}</title>
        </g>
      ))}
      
      <line x1="60" y1="35" x2="60" y2="55" stroke="#059669" strokeWidth="2" />
      <polygon points="60,30 55,45 65,45" fill="#059669" />
      <text x="60" y="25" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#059669">北</text>
      
      <text x="440" y="385" textAnchor="end" fontSize="10" fill="#065F46">
        比例尺 1:1000
      </text>
    </svg>
  )
}

export default CampusMap
