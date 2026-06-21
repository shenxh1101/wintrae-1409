import React from 'react'

interface ChinaMapProps {
  selectedId: string | null
  highlightId: string | null
  showAnswer: boolean
  answerId?: string
  onRegionClick: (id: string) => void
  zoom?: number
}

interface ClickableProps {
  id: string
  isSelected: boolean
  isAnswer: boolean
  isHighlight: boolean
  showAnswer: boolean
  onClick: (id: string) => void
}

function getProvinceStyle(props: ClickableProps, fill: string) {
  let strokeColor = '#4A5568'
  let strokeWidth = 1
  let opacity = 1
  let actualFill = fill

  if (props.showAnswer && props.isAnswer) {
    strokeColor = '#10B981'
    strokeWidth = 4
  }
  if (props.isHighlight) {
    strokeColor = '#F97316'
    strokeWidth = 4
    opacity = 0.85
  }
  if (props.isSelected && props.isAnswer) {
    strokeColor = '#10B981'
    strokeWidth = 5
    opacity = 1
  } else if (props.isSelected && !props.isAnswer) {
    strokeColor = '#EF4444'
    strokeWidth = 5
    opacity = 1
  }

  return { fill: actualFill, stroke: strokeColor, strokeWidth, opacity }
}

function getRiverStyle(props: ClickableProps, stroke: string) {
  let strokeColor = stroke
  let strokeWidth = 5
  let opacity = 0.75

  if (props.showAnswer && props.isAnswer) {
    strokeColor = '#10B981'
    strokeWidth = 8
    opacity = 1
  }
  if (props.isHighlight) {
    strokeColor = '#F97316'
    strokeWidth = 8
    opacity = 0.9
  }
  if (props.isSelected && props.isAnswer) {
    strokeColor = '#10B981'
    strokeWidth = 10
    opacity = 1
  } else if (props.isSelected && !props.isAnswer) {
    strokeColor = '#EF4444'
    strokeWidth = 10
    opacity = 1
  }

  return { stroke: strokeColor, strokeWidth, opacity }
}

function getCityStyle(props: ClickableProps, fill: string) {
  let strokeColor = '#2D3748'
  let strokeWidth = 2
  let r = 7
  let actualFill = fill

  if (props.showAnswer && props.isAnswer) {
    strokeColor = '#10B981'
    strokeWidth = 5
    r = 11
  }
  if (props.isHighlight) {
    strokeColor = '#F97316'
    strokeWidth = 5
    r = 11
  }
  if (props.isSelected && props.isAnswer) {
    strokeColor = '#10B981'
    strokeWidth = 6
    r = 12
  } else if (props.isSelected && !props.isAnswer) {
    strokeColor = '#EF4444'
    strokeWidth = 6
    r = 12
  }

  return { fill: actualFill, stroke: strokeColor, strokeWidth, r }
}

const ChinaMap: React.FC<ChinaMapProps> = ({
  selectedId,
  highlightId,
  showAnswer,
  answerId = '',
  onRegionClick,
  zoom = 1,
}) => {
  const provinces = [
    { id: 'heilongjiang', name: '黑龙江省', x: 420, y: 60, w: 80, h: 60, fill: '#A7F3D0' },
    { id: 'jilin', name: '吉林省', x: 420, y: 125, w: 60, h: 40, fill: '#6EE7B7' },
    { id: 'liaoning', name: '辽宁省', x: 400, y: 165, w: 70, h: 45, fill: '#34D399' },
    { id: 'neimenggu', name: '内蒙古自治区', x: 220, y: 70, w: 200, h: 90, fill: '#FCD34D' },
    { id: 'xinjiang', name: '新疆维吾尔自治区', x: 50, y: 80, w: 170, h: 130, fill: '#FCA5A5' },
    { id: 'xizang', name: '西藏自治区', x: 80, y: 210, w: 140, h: 100, fill: '#C4B5FD' },
    { id: 'qinghai', name: '青海省', x: 200, y: 170, w: 80, h: 70, fill: '#A5B4FC' },
    { id: 'gansu', name: '甘肃省', x: 260, y: 145, w: 80, h: 60, fill: '#818CF8' },
    { id: 'ningxia', name: '宁夏回族自治区', x: 290, y: 175, w: 30, h: 45, fill: '#6366F1' },
    { id: 'shaanxi', name: '陕西省', x: 310, y: 180, w: 45, h: 80, fill: '#93C5FD' },
    { id: 'shanxi', name: '山西省', x: 340, y: 155, w: 40, h: 60, fill: '#60A5FA' },
    { id: 'hebei', name: '河北省', x: 360, y: 140, w: 50, h: 55, fill: '#3B82F6' },
    { id: 'beijing', name: '北京市', x: 370, y: 145, w: 20, h: 20, fill: '#EF4444' },
    { id: 'tianjin', name: '天津市', x: 390, y: 155, w: 18, h: 18, fill: '#F97316' },
    { id: 'shandong', name: '山东省', x: 370, y: 190, w: 55, h: 45, fill: '#FBBF24' },
    { id: 'henan', name: '河南省', x: 330, y: 230, w: 60, h: 50, fill: '#F59E0B' },
    { id: 'jiangsu', name: '江苏省', x: 385, y: 225, w: 45, h: 50, fill: '#84CC16' },
    { id: 'shanghai', name: '上海市', x: 405, y: 250, w: 18, h: 18, fill: '#22C55E' },
    { id: 'zhejiang', name: '浙江省', x: 395, y: 270, w: 45, h: 50, fill: '#10B981' },
    { id: 'anhui', name: '安徽省', x: 355, y: 260, w: 45, h: 55, fill: '#14B8A6' },
    { id: 'hubei', name: '湖北省', x: 320, y: 270, w: 50, h: 50, fill: '#06B6D4' },
    { id: 'hunan', name: '湖南省', x: 315, y: 315, w: 50, h: 55, fill: '#0EA5E9' },
    { id: 'jiangxi', name: '江西省', x: 355, y: 310, w: 45, h: 60, fill: '#38BDF8' },
    { id: 'fujian', name: '福建省', x: 390, y: 315, w: 40, h: 50, fill: '#7DD3FC' },
    { id: 'taiwan', name: '台湾省', x: 410, y: 340, w: 20, h: 45, fill: '#BAE6FD' },
    { id: 'guangdong', name: '广东省', x: 325, y: 370, w: 65, h: 45, fill: '#F472B6' },
    { id: 'guangxi', name: '广西壮族自治区', x: 270, y: 365, w: 60, h: 50, fill: '#EC4899' },
    { id: 'hainan', name: '海南省', x: 305, y: 420, w: 30, h: 25, fill: '#DB2777' },
    { id: 'sichuan', name: '四川省', x: 225, y: 240, w: 90, h: 80, fill: '#D946EF' },
    { id: 'chongqing', name: '重庆市', x: 285, y: 260, w: 30, h: 35, fill: '#A855F7' },
    { id: 'guizhou', name: '贵州省', x: 260, y: 320, w: 55, h: 50, fill: '#9333EA' },
    { id: 'yunnan', name: '云南省', x: 195, y: 315, w: 70, h: 75, fill: '#7C3AED' },
    { id: 'hongkong', name: '香港特别行政区', x: 375, y: 410, w: 10, h: 10, fill: '#FF6B6B' },
    { id: 'macau', name: '澳门特别行政区', x: 355, y: 412, w: 8, h: 8, fill: '#4ECDC4' },
  ]

  const rivers = [
    {
      id: 'yangtze',
      name: '长江',
      path: 'M 100 280 Q 180 268 250 278 Q 310 295 370 292 Q 400 288 420 290',
      stroke: '#3B82F6',
      labelX: 250,
      labelY: 272,
    },
    {
      id: 'yellow',
      name: '黄河',
      path: 'M 120 180 Q 190 165 260 182 Q 310 205 340 208 Q 370 205 380 210',
      stroke: '#F59E0B',
      labelX: 240,
      labelY: 175,
    },
  ]

  const cities = [
    { id: 'xian', name: '西安', x: 320, y: 200, fill: '#EF4444', labelX: 320, labelY: 188 },
    { id: 'hangzhou', name: '杭州', x: 388, y: 285, fill: '#EF4444', labelX: 388, labelY: 273 },
  ]

  const c = (id: string): ClickableProps => ({
    id,
    isSelected: selectedId === id,
    isAnswer: answerId === id,
    isHighlight: highlightId === id,
    showAnswer,
    onClick: onRegionClick,
  })

  return (
    <svg
      viewBox="0 0 500 480"
      className="w-full h-full"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
    >
      <rect x="0" y="0" width="500" height="480" fill="#E0F7FA" rx="12" />

      <text x="250" y="30" textAnchor="middle" fill="#2D3748" fontSize="18" fontWeight="bold">
        中国地图
      </text>

      {rivers.map(river => {
        const style = getRiverStyle(c(river.id), river.stroke)
        return (
          <g
            key={river.id}
            className="map-region"
            onClick={() => onRegionClick(river.id)}
            style={{ cursor: 'pointer' }}
          >
            <path
              d={river.path}
              fill="none"
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeLinecap="round"
              opacity={style.opacity}
              style={{ transition: 'all 0.25s ease' }}
            />
            <path
              d={river.path}
              fill="none"
              stroke="transparent"
              strokeWidth="22"
              strokeLinecap="round"
              style={{ cursor: 'pointer' }}
            />
            <text
              x={river.labelX}
              y={river.labelY}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill={style.stroke}
              pointerEvents="none"
              style={{ transition: 'all 0.25s ease', paintOrder: 'stroke' }}
              stroke="white"
              strokeWidth="3"
            >
              {river.name}
            </text>
            <title>{river.name} - 点击作答</title>
          </g>
        )
      })}

      {provinces.map(province => {
        const style = getProvinceStyle(c(province.id), province.fill)
        return (
          <g
            key={province.id}
            className="map-region"
            onClick={() => onRegionClick(province.id)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={province.x}
              y={province.y}
              width={province.w}
              height={province.h}
              rx="4"
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              opacity={style.opacity}
              style={{ transition: 'all 0.2s ease' }}
            />
            {province.w > 40 && (
              <text
                x={province.x + province.w / 2}
                y={province.y + province.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={province.w > 60 ? '10' : '8'}
                fill="#1F2937"
                pointerEvents="none"
                style={{ transition: 'all 0.2s ease' }}
              >
                {province.name.replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区/g, '')}
              </text>
            )}
            <title>{province.name}</title>
          </g>
        )
      })}

      {cities.map(city => {
        const style = getCityStyle(c(city.id), city.fill)
        const textFill =
          (c(city.id).isSelected && !c(city.id).isAnswer) ? '#EF4444'
          : ((c(city.id).isSelected && c(city.id).isAnswer) || (c(city.id).showAnswer && c(city.id).isAnswer)) ? '#10B981'
          : c(city.id).isHighlight ? '#F97316'
          : '#7F1D1D'

        return (
          <g
            key={city.id}
            className="map-region"
            onClick={() => onRegionClick(city.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={city.x + 0.001}
              cy={city.y}
              r={style.r + 8}
              fill="transparent"
              style={{ cursor: 'pointer' }}
            />
            <circle
              cx={city.x}
              cy={city.y}
              r={style.r}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              style={{ transition: 'all 0.25s ease' }}
            />
            <text
              x={city.labelX}
              y={city.labelY}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill={textFill}
              pointerEvents="none"
              paintOrder="stroke"
              stroke="white"
              strokeWidth="3"
              style={{ transition: 'all 0.25s ease' }}
            >
              {city.name}
            </text>
            <title>{city.name} - 点击作答</title>
          </g>
        )
      })}
    </svg>
  )
}

export default ChinaMap
