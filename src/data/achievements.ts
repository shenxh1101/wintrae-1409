import type { Achievement } from '../types'

export const achievements: Achievement[] = [
  {
    id: 'first-correct',
    name: '初出茅庐',
    description: '答对第一道题',
    icon: '🌟',
    category: 'accuracy',
    condition: { type: 'correct_count', value: 1 },
    points: 10,
  },
  {
    id: 'correct-10',
    name: '小试牛刀',
    description: '累计答对10道题',
    icon: '⭐',
    category: 'accuracy',
    condition: { type: 'correct_count', value: 10 },
    points: 20,
  },
  {
    id: 'correct-50',
    name: '地理达人',
    description: '累计答对50道题',
    icon: '🏆',
    category: 'accuracy',
    condition: { type: 'correct_count', value: 50 },
    points: 50,
  },
  {
    id: 'correct-100',
    name: '地理大师',
    description: '累计答对100道题',
    icon: '👑',
    category: 'accuracy',
    condition: { type: 'correct_count', value: 100 },
    points: 100,
  },
  {
    id: 'accuracy-70',
    name: '稳扎稳打',
    description: '准确率达到70%',
    icon: '🎯',
    category: 'accuracy',
    condition: { type: 'accuracy_rate', value: 70 },
    points: 30,
  },
  {
    id: 'accuracy-90',
    name: '神射手',
    description: '准确率达到90%',
    icon: '🎯',
    category: 'accuracy',
    condition: { type: 'accuracy_rate', value: 90 },
    points: 80,
  },
  {
    id: 'streak-3',
    name: '三连击',
    description: '连续答对3道题',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'correct_count', value: 3 },
    points: 15,
  },
  {
    id: 'streak-10',
    name: '十连击',
    description: '连续答对10道题',
    icon: '💥',
    category: 'streak',
    condition: { type: 'correct_count', value: 10 },
    points: 50,
  },
  {
    id: 'streak-days-3',
    name: '坚持三天',
    description: '连续练习3天',
    icon: '📅',
    category: 'streak',
    condition: { type: 'streak_days', value: 3 },
    points: 25,
  },
  {
    id: 'streak-days-7',
    name: '一周达人',
    description: '连续练习7天',
    icon: '📆',
    category: 'streak',
    condition: { type: 'streak_days', value: 7 },
    points: 60,
  },
  {
    id: 'streak-days-30',
    name: '月度坚持家',
    description: '连续练习30天',
    icon: '🗓️',
    category: 'streak',
    condition: { type: 'streak_days', value: 30 },
    points: 200,
  },
  {
    id: 'speed-fast',
    name: '速度之星',
    description: '平均答题时间少于10秒',
    icon: '⚡',
    category: 'speed',
    condition: { type: 'avg_time', value: 10 },
    points: 40,
  },
  {
    id: 'china-master',
    name: '中国通',
    description: '完成中国地图所有题目',
    icon: '🇨🇳',
    category: 'collection',
    condition: { type: 'map_complete', value: 1, mapType: 'china' },
    points: 80,
  },
  {
    id: 'world-master',
    name: '世界通',
    description: '完成世界大洲所有题目',
    icon: '🌍',
    category: 'collection',
    condition: { type: 'map_complete', value: 1, mapType: 'world' },
    points: 80,
  },
  {
    id: 'grid-master',
    name: '经纬达人',
    description: '完成经纬度网格所有题目',
    icon: '🧭',
    category: 'collection',
    condition: { type: 'map_complete', value: 1, mapType: 'grid' },
    points: 80,
  },
  {
    id: 'campus-master',
    name: '校园向导',
    description: '完成校园平面图所有题目',
    icon: '🏫',
    category: 'collection',
    condition: { type: 'map_complete', value: 1, mapType: 'campus' },
    points: 60,
  },
]

export function checkAchievements(
  totalCorrect: number,
  totalQuestions: number,
  avgTime: number,
  streakDays: number,
  currentStreak: number,
  unlockedIds: string[]
): Achievement[] {
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  
  const newlyUnlocked: Achievement[] = []
  
  for (const achievement of achievements) {
    if (unlockedIds.includes(achievement.id)) continue
    
    let unlocked = false
    const { type, value } = achievement.condition
    
    switch (type) {
      case 'correct_count':
        if (achievement.category === 'streak') {
          unlocked = currentStreak >= value
        } else {
          unlocked = totalCorrect >= value
        }
        break
      case 'accuracy_rate':
        unlocked = totalQuestions >= 10 && accuracy >= value
        break
      case 'avg_time':
        unlocked = totalCorrect >= 10 && avgTime > 0 && avgTime <= value
        break
      case 'streak_days':
        unlocked = streakDays >= value
        break
      default:
        break
    }
    
    if (unlocked) {
      newlyUnlocked.push(achievement)
    }
  }
  
  return newlyUnlocked
}

export default achievements
