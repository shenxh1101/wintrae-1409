import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Flame, Target, Clock, Calendar, Zap, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserStore } from '../store/userStore'
import achievements from '../data/achievements'

const categoryLabels = {
  speed: { name: '速度类', icon: <Zap className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-50' },
  accuracy: { name: '准确率类', icon: <Target className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-50' },
  streak: { name: '坚持类', icon: <Flame className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-50' },
  collection: { name: '收集类', icon: <Award className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-50' },
}

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate()
  const userData = useUserStore()
  
  const unlockedCount = userData.achievements.length
  const totalCount = achievements.length
  const unlockPercent = Math.round((unlockedCount / totalCount) * 100)
  
  const accuracy = userData.totalQuestions > 0
    ? Math.round((userData.correctAnswers / userData.totalQuestions) * 100)
    : 0
  
  const avgTime = userData.correctAnswers > 0
    ? (userData.totalTime / userData.correctAnswers).toFixed(1)
    : '0'

  const calendarDays = useMemo(() => {
    const today = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const played = userData.playHistory.some(h => h.date === dateStr)
        || userData.lastPlayDate === dateStr
      days.push({ date: dateStr, day: date.getDate(), played })
    }
    return days
  }, [userData.playHistory, userData.lastPlayDate])

  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, typeof achievements> = {}
    for (const a of achievements) {
      if (!grouped[a.category]) {
        grouped[a.category] = []
      }
      grouped[a.category].push(a)
    }
    return grouped
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            成就中心
          </h1>
          
          <div className="w-10" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">已解锁成就</p>
              <p className="text-4xl font-bold">
                {unlockedCount} <span className="text-2xl text-white/70">/ {totalCount}</span>
              </p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${unlockPercent * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{unlockPercent}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm">
              <Target className="w-6 h-6 mx-auto mb-1" />
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-white/80">正确率</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm">
              <Clock className="w-6 h-6 mx-auto mb-1" />
              <p className="text-2xl font-bold">{avgTime}s</p>
              <p className="text-xs text-white/80">平均用时</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm">
              <Flame className="w-6 h-6 mx-auto mb-1" />
              <p className="text-2xl font-bold">{userData.streakDays}</p>
              <p className="text-xs text-white/80">连续天数</p>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            本月练习日历
          </h2>
          
          <div className="grid grid-cols-7 gap-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
                {day}
              </div>
            ))}
            {calendarDays.map((d, i) => (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.02 }}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  d.played
                    ? 'bg-gradient-to-br from-primary to-accent-blue text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {d.day}
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <span>未练习</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-accent-blue" />
              <span>已练习</span>
            </div>
          </div>
        </motion.section>

        <div className="space-y-6">
          {Object.entries(achievementsByCategory).map(([category, list], catIndex) => {
            const catInfo = categoryLabels[category as keyof typeof categoryLabels]
            const unlockedInCat = list.filter(a => userData.achievements.includes(a.id)).length
            
            return (
              <motion.section
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + catIndex * 0.1 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold flex items-center gap-2 ${catInfo.color}`}>
                    <span className={`p-2 rounded-xl ${catInfo.bg}`}>
                      {catInfo.icon}
                    </span>
                    {catInfo.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {unlockedInCat}/{list.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {list.map((achievement, idx) => {
                    const isUnlocked = userData.achievements.includes(achievement.id)
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + catIndex * 0.1 + idx * 0.05 }}
                        className={`p-4 rounded-2xl text-center transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-14 h-14 mx-auto mb-2 rounded-2xl flex items-center justify-center text-3xl ${
                          isUnlocked ? 'bg-yellow-100' : 'bg-gray-200 grayscale'
                        }`}>
                          {achievement.icon}
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${
                          isUnlocked ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-xs leading-tight ${
                          isUnlocked ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                        {isUnlocked && (
                          <div className="mt-2 inline-block px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                            +{achievement.points}分
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            )
          })}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/60 rounded-2xl p-6 text-center"
        >
          <p className="text-gray-500 mb-3">
            累计答题 <span className="font-bold text-gray-700">{userData.totalQuestions}</span> 道，
            答对 <span className="font-bold text-green-600">{userData.correctAnswers}</span> 道
          </p>
          <p className="text-sm text-gray-400">
            最佳连对记录：{userData.bestStreak} 题
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default AchievementsPage
