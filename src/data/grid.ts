import type { Question } from '../types'

export const gridQuestions: Question[] = [
  {
    id: 'gr-001',
    mapType: 'grid',
    difficulty: 'easy',
    type: 'latitude',
    targetId: 'equator',
    prompt: '请点击赤道的位置',
    explanation: '赤道是地球上最长的纬线，纬度为0度，将地球分为南北两个半球。',
    hints: ['它是0度纬线', '它在地球的中间', '它把地球分成南北两半']
  },
  {
    id: 'gr-002',
    mapType: 'grid',
    difficulty: 'easy',
    type: 'longitude',
    targetId: 'prime-meridian',
    prompt: '请点击本初子午线的位置',
    explanation: '本初子午线是0度经线，经过英国格林尼治天文台，是计算经度的起点。',
    hints: ['它是0度经线', '它经过英国伦敦', '它是计算经度的起点']
  },
  {
    id: 'gr-003',
    mapType: 'grid',
    difficulty: 'easy',
    type: 'latitude',
    targetId: 'n30',
    prompt: '请点击北纬30度线的位置',
    explanation: '北纬30度线穿过中国长江流域，是一条重要的纬线，有很多神秘的自然现象。',
    hints: ['它在赤道的北边', '它是北纬30度', '它经过中国的长江中下游地区']
  },
  {
    id: 'gr-004',
    mapType: 'grid',
    difficulty: 'medium',
    type: 'latitude',
    targetId: 'tropic-cancer',
    prompt: '请点击北回归线的位置',
    explanation: '北回归线是北纬23.5度线，是太阳直射点的最北界限，经过中国云南、广西、广东、台湾。',
    hints: ['它在北半球', '它大约是北纬23.5度', '它是热带和北温带的分界线']
  },
  {
    id: 'gr-005',
    mapType: 'grid',
    difficulty: 'medium',
    type: 'latitude',
    targetId: 'tropic-capricorn',
    prompt: '请点击南回归线的位置',
    explanation: '南回归线是南纬23.5度线，是太阳直射点的最南界限。',
    hints: ['它在南半球', '它大约是南纬23.5度', '它和北回归线对称']
  },
  {
    id: 'gr-006',
    mapType: 'grid',
    difficulty: 'medium',
    type: 'latitude',
    targetId: 'arctic-circle',
    prompt: '请点击北极圈的位置',
    explanation: '北极圈是北纬66.5度线，北极圈以北地区会出现极昼和极夜现象。',
    hints: ['它在北半球的北部', '它大约是北纬66.5度', '它里面有极昼极夜现象']
  },
  {
    id: 'gr-007',
    mapType: 'grid',
    difficulty: 'medium',
    type: 'latitude',
    targetId: 'antarctic-circle',
    prompt: '请点击南极圈的位置',
    explanation: '南极圈是南纬66.5度线，南极圈以南地区会出现极昼和极夜现象。',
    hints: ['它在南半球的南部', '它大约是南纬66.5度', '南极洲大部分在它里面']
  },
  {
    id: 'gr-008',
    mapType: 'grid',
    difficulty: 'hard',
    type: 'longitude',
    targetId: 'e120',
    prompt: '请点击东经120度线的位置',
    explanation: '东经120度线经过中国东部地区，是中国常用的标准时间（北京时间）的基准经线。',
    hints: ['它是东经120度', '它经过中国东部', '北京时间以这条经线附近的时间为准']
  },
  {
    id: 'gr-009',
    mapType: 'grid',
    difficulty: 'hard',
    type: 'direction',
    targetId: 'ne-quadrant',
    prompt: '请点击东北半球（北半球+东半球）的区域',
    explanation: '东北半球是指位于北半球和东半球的区域，中国就位于这个区域。',
    hints: ['它在赤道的北边', '它在本初子午线的东边', '中国就在这个区域']
  },
  {
    id: 'gr-010',
    mapType: 'grid',
    difficulty: 'hard',
    type: 'direction',
    targetId: 'sw-quadrant',
    prompt: '请点击西南半球（南半球+西半球）的区域',
    explanation: '西南半球是指南半球和西半球的重叠区域，南美洲的大部分位于这里。',
    hints: ['它在赤道的南边', '它在本初子午线的西边', '南美洲大部分在这里']
  },
]

export default gridQuestions
