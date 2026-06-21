import type { Question } from '../types'

export const campusQuestions: Question[] = [
  {
    id: 'cp-001',
    mapType: 'campus',
    difficulty: 'easy',
    type: 'building',
    targetId: 'classroom',
    prompt: '请点击教学楼的位置',
    explanation: '教学楼是学生上课学习的主要场所，有很多教室。',
    hints: ['学生每天都要去那里上课', '它有很多教室', '它是学校最高的建筑之一']
  },
  {
    id: 'cp-002',
    mapType: 'campus',
    difficulty: 'easy',
    type: 'building',
    targetId: 'playground',
    prompt: '请点击操场的位置',
    explanation: '操场是学生上体育课和课外活动的地方，有跑道和篮球场。',
    hints: ['体育课在这里上', '有跑道和足球场', '运动会在这里举行']
  },
  {
    id: 'cp-003',
    mapType: 'campus',
    difficulty: 'easy',
    type: 'building',
    targetId: 'library',
    prompt: '请点击图书馆的位置',
    explanation: '图书馆是学生借阅图书和阅读学习的地方，有很多藏书。',
    hints: ['里面有很多书', '需要保持安静', '可以在那里看书、借书']
  },
  {
    id: 'cp-004',
    mapType: 'campus',
    difficulty: 'easy',
    type: 'building',
    targetId: 'canteen',
    prompt: '请点击食堂的位置',
    explanation: '食堂是学生和老师用餐的地方，提供各种美味的饭菜。',
    hints: ['中午和晚上同学们都去那里吃饭', '有很多好吃的饭菜', '它在学校的生活区']
  },
  {
    id: 'cp-005',
    mapType: 'campus',
    difficulty: 'medium',
    type: 'building',
    targetId: 'office',
    prompt: '请点击教师办公室的位置',
    explanation: '教师办公室是老师们备课、批改作业和办公的地方。',
    hints: ['老师们在那里办公', '同学们有问题可以去那里找老师', '它通常在教学楼里或旁边']
  },
  {
    id: 'cp-006',
    mapType: 'campus',
    difficulty: 'medium',
    type: 'building',
    targetId: 'lab',
    prompt: '请点击实验楼的位置',
    explanation: '实验楼是学生上科学课、做实验的地方，有各种实验器材。',
    hints: ['科学课的实验在这里做', '有很多实验器材', '需要注意安全']
  },
  {
    id: 'cp-007',
    mapType: 'campus',
    difficulty: 'medium',
    type: 'building',
    targetId: 'gym',
    prompt: '请点击体育馆的位置',
    explanation: '体育馆是室内体育运动场所，下雨天也可以上体育课。',
    hints: ['下雨天也能上体育课', '可以在里面打篮球、羽毛球', '它是一个很大的室内场馆']
  },
  {
    id: 'cp-008',
    mapType: 'campus',
    difficulty: 'hard',
    type: 'direction',
    targetId: 'north-gate',
    prompt: '请点击学校北门的位置',
    explanation: '北门是学校的主要出入口之一，位于学校的北边。',
    hints: ['它在学校的北边', '是学校的大门之一', '从这里出去往北走']
  },
  {
    id: 'cp-009',
    mapType: 'campus',
    difficulty: 'hard',
    type: 'direction',
    targetId: 'south-gate',
    prompt: '请点击学校南门的位置',
    explanation: '南门是学校的另一个主要出入口，位于学校的南边。',
    hints: ['它在学校的南边', '和北门相对', '从这里出去往南走']
  },
  {
    id: 'cp-010',
    mapType: 'campus',
    difficulty: 'hard',
    type: 'building',
    targetId: 'garden',
    prompt: '请点击学校花园的位置',
    explanation: '花园是学校里种植花草树木的地方，是学生们课间休息的好去处。',
    hints: ['那里有很多花和树', '环境很优美', '同学们课间喜欢在那里休息']
  },
]

export default campusQuestions
