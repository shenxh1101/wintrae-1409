import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Flame, Target, Clock, Calendar, Zap, Award, BarChart3, TrendingUp, TrendingDown,
  Sparkles, PieChart, ChevronDown, ChevronUp, Play, BookOpen, CheckCircle2, XCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/userStore'
import { useGameStore } from '../store/gameStore'
import achievements from '../data/achievements'
import type { MapType, QuestionType, PlayRecord, WrongQuestion } from '../types'

const categoryLabels = {
  speed: { name: '速度类', icon: <Zap className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-50' },
  accuracy: { name: '准确率类', icon: <Target className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-50' },
  streak: { name: '坚持类', icon: <Flame className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-50' },
  collection: { name: '收集类', icon: <Award className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-50' },
}

const mapTypeMeta: Record<MapType, { name: string; icon: string; color: string; bg: string; focusOptions: { id: QuestionType[]; name: string; icon: string }[] }> = {
  china: { name: '中国地图', icon: '🇨🇳', color: 'text-red-600', bg: 'bg-red-50 border-red-200', focusOptions: [
    { id: ['province'], name: '省份专项', icon: '🗺️' }, { id: ['city'], name: '城市专项', icon: '🏙️' }, { id: ['river'], name: '河流专项', icon: '🌊' },
  ]},
  world: { name: '世界大洲', icon: '🌍', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', focusOptions: [
    { id: ['continent'], name: '大洲大洋专项', icon: '🌍' },
  ]},
  grid: { name: '经纬度', icon: '🧭', color: 'text-green-600', bg: 'bg-green-50 border-green-200', focusOptions: [
    { id: ['latitude'], name: '纬线专项', icon: '↔️' }, { id: ['longitude'], name: '经线专项', icon: '↕️' },
  ]},
  campus: { name: '校园平面', icon: '🏫', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', focusOptions: [
    { id: ['building'], name: '校园建筑专项', icon: '🏫' }, { id: ['direction'], name: '方位专项', icon: '🧭' },
  ]},
}

const typeLabel: Record<QuestionType, string> = {
  province: '省份题', city: '城市题', river: '河流题', direction: '方位题',
  continent: '大洲大洋题', latitude: '纬线题', longitude: '经线题', building: '校园建筑题',
}

type TabKey = 'achievements' | 'report'

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate()
  const userData = useUserStore()
  const startGame = useGameStore((s) => s.startGame)
  const [activeTab, setActiveTab] = useState<TabKey>('achievements')
  const [expandedMap, setExpandedMap] = useState<MapType | null>(null)

  const unlockedCount = userData.achievements.length
  const totalCount = achievements.length
  const unlockPercent = Math.round((unlockedCount / totalCount) * 100)

  const accuracy = userData.totalQuestions > 0
    ? Math.round((userData.correctAnswers / userData.totalQuestions) * 100) : 0

  const avgTime = userData.correctAnswers > 0
    ? (userData.totalTime / userData.correctAnswers).toFixed(1) : '0'

  const calendarDays = useMemo(() => {
    const today = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const played = userData.playHistory.some(h => h.date === dateStr) || userData.lastPlayDate === dateStr
      days.push({ date: dateStr, day: date.getDate(), played })
    }
    return days
  }, [userData.playHistory, userData.lastPlayDate])

  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, typeof achievements> = {}
    for (const a of achievements) {
      if (!grouped[a.category]) grouped[a.category] = []
      grouped[a.category].push(a)
    }
    return grouped
  }, [])

  const byMapStats = useMemo(() => {
    const map: Record<MapType, { records: PlayRecord[]; wrongs: WrongQuestion[] }> = {
      china: { records: [], wrongs: [] }, world: { records: [], wrongs: [] },
      grid: { records: [], wrongs: [] }, campus: { records: [], wrongs: [] },
    }
    userData.playHistory.forEach(r => { if (map[r.mapType]) map[r.mapType].records.push(r) })
    userData.wrongQuestions.forEach(w => { if (map[w.question.mapType]) map[w.question.mapType].wrongs.push(w) })
    return map
  }, [userData.playHistory, userData.wrongQuestions])

  const mapStats = useMemo(() => {
    return (Object.keys(byMapStats) as MapType[]).map(key => {
      const { records, wrongs } = byMapStats[key]
      const totalCorrect = records.reduce((s, r) => s + r.correctCount, 0)
      const totalCount = records.reduce((s, r) => s + r.totalCount, 0)
      const recent = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      return {
        key,
        playCount: records.length,
        totalCorrect,
        totalCount,
        accuracy: totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0,
        wrongCount: wrongs.filter(w => !w.mastered).length,
        recentSessions: recent.map(r => ({
          date: r.date,
          correct: r.correctCount,
          total: r.totalCount,
          accuracy: r.totalCount > 0 ? Math.round((r.correctCount / r.totalCount) * 100) : 0,
        })),
      }
    }).sort((a, b) => b.playCount - a.playCount)
  }, [byMapStats])

  const mostPracticedMap = mapStats.find(s => s.playCount > 0)

  const accuracyTrend = useMemo(() => {
    const days: { date: string; correct: number; total: number }[] = []
    const dayMap = new Map<string, { correct: number; total: number }>()
    userData.playHistory.forEach(r => {
      const prev = dayMap.get(r.date) ?? { correct: 0, total: 0 }
      dayMap.set(r.date, { correct: prev.correct + r.correctCount, total: prev.total + r.totalCount })
    })
    for (const [date, v] of dayMap.entries()) days.push({ date, ...v })
    days.sort((a, b) => a.date.localeCompare(b.date))
    return days.slice(-7)
  }, [userData.playHistory])

  const recentAccuracy = useMemo(() => {
    if (accuracyTrend.length < 2) return { value: 0, trend: 0 as 0 | 1 | -1 }
    const curr = accuracyTrend[accuracyTrend.length - 1]
    const prev = accuracyTrend[accuracyTrend.length - 2]
    const currAcc = curr.total > 0 ? (curr.correct / curr.total) * 100 : 0
    const prevAcc = prev.total > 0 ? (prev.correct / prev.total) * 100 : 0
    const diff = currAcc - prevAcc
    return { value: Math.round(currAcc), trend: Math.abs(diff) < 1 ? 0 : (diff > 0 ? 1 : -1) as 0 | 1 | -1 }
  }, [accuracyTrend])

  const weakestTypes = useMemo(() => {
    const cnt = new Map<QuestionType, { wrong: number; total: number }>()
    userData.wrongQuestions.forEach(w => {
      if (w.mastered) return
      const t = w.question.type
      const prev = cnt.get(t) ?? { wrong: 0, total: 0 }
      cnt.set(t, { wrong: prev.wrong + (w.wrongCount || 1), total: prev.total + 1 })
    })
    return Array.from(cnt.entries())
      .map(([t, v]) => ({ type: t, label: typeLabel[t] ?? t, wrongCount: v.wrong, unique: v.total, mapType: (userData.wrongQuestions.find(w => w.question.type === t)?.question.mapType) ?? 'china' as MapType }))
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 5)
  }, [userData.wrongQuestions])

  const totalPlayCount = userData.playHistory.length

  const handleJumpToFocus = (mapType: MapType, focusTypes: QuestionType[]) => {
    startGame(mapType, 'easy', 10, focusTypes)
    navigate(`/game/${mapType}?difficulty=easy`)
  }

  const handleJumpToMap = (mapType: MapType) => {
    startGame(mapType, 'easy', 10, [])
    navigate(`/game/${mapType}?difficulty=easy`)
  }

  const handleJumpToWrongByMap = (mapType: MapType) => {
    navigate('/review')
  }

  const handleJumpToWeakType = (mapType: MapType, type: QuestionType) => {
    const matching = Object.values(mapTypeMeta).find(m => m.focusOptions.some(f => f.id.includes(type)))
    if (matching) {
      const opt = matching.focusOptions.find(f => f.id.includes(type))
      if (opt) {
        startGame(mapType, 'easy', 10, opt.id)
        navigate(`/game/${mapType}?difficulty=easy`)
        return
      }
    }
    startGame(mapType, 'easy', 10, [])
    navigate(`/game/${mapType}?difficulty=easy`)
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />成就中心
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex bg-white rounded-2xl p-1.5 shadow-md gap-1 mb-6">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'achievements' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trophy className="w-5 h-5" />成就徽章
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'report' ? 'bg-gradient-to-r from-primary to-accent-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />学习报告
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">已解锁成就</p>
              <p className="text-4xl font-bold">{unlockedCount} <span className="text-2xl text-white/70">/ {totalCount}</span></p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${unlockPercent * 2.51} 251`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold">{unlockPercent}%</span></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm"><Target className="w-5 h-5 mx-auto mb-1" /><p className="text-xl md:text-2xl font-bold">{accuracy}%</p><p className="text-xs text-white/80">总正确率</p></div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm"><Clock className="w-5 h-5 mx-auto mb-1" /><p className="text-xl md:text-2xl font-bold">{avgTime}s</p><p className="text-xs text-white/80">平均用时</p></div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm"><Flame className="w-5 h-5 mx-auto mb-1" /><p className="text-xl md:text-2xl font-bold">{userData.streakDays}</p><p className="text-xs text-white/80">连续天数</p></div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm"><Calendar className="w-5 h-5 mx-auto mb-1" /><p className="text-xl md:text-2xl font-bold">{totalPlayCount}</p><p className="text-xs text-white/80">练习次数</p></div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto">
        {activeTab === 'achievements' ? (
          <>
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />本月练习日历
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">{day}</div>
                ))}
                {calendarDays.map((d, i) => (
                  <motion.div key={d.date} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.02 }}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      d.played ? 'bg-gradient-to-br from-primary to-accent-blue text-white shadow-md' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {d.day}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-gray-100" /><span>未练习</span></div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-accent-blue" /><span>已练习</span></div>
              </div>
            </motion.section>

            <div className="space-y-6 pb-8">
              {Object.entries(achievementsByCategory).map(([category, list], catIndex) => {
                const catInfo = categoryLabels[category as keyof typeof categoryLabels]
                const unlockedInCat = list.filter(a => userData.achievements.includes(a.id)).length
                return (
                  <motion.section key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + catIndex * 0.1 }} className="bg-white rounded-3xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-lg font-bold flex items-center gap-2 ${catInfo.color}`}>
                        <span className={`p-2 rounded-xl ${catInfo.bg}`}>{catInfo.icon}</span>{catInfo.name}
                      </h2>
                      <span className="text-sm text-gray-500">{unlockedInCat}/{list.length}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {list.map((achievement, idx) => {
                        const isUnlocked = userData.achievements.includes(achievement.id)
                        return (
                          <motion.div key={achievement.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + catIndex * 0.1 + idx * 0.05 }}
                            className={`p-4 rounded-2xl text-center transition-all ${isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md' : 'bg-gray-50'}`}
                          >
                            <div className={`w-14 h-14 mx-auto mb-2 rounded-2xl flex items-center justify-center text-3xl ${isUnlocked ? 'bg-yellow-100' : 'bg-gray-200 grayscale'}`}>
                              {achievement.icon}
                            </div>
                            <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>{achievement.name}</h3>
                            <p className={`text-xs leading-tight ${isUnlocked ? 'text-gray-500' : 'text-gray-400'}`}>{achievement.description}</p>
                            {isUnlocked && <div className="mt-2 inline-block px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">+{achievement.points}分</div>}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.section>
                )
              })}
            </div>
          </>
        ) : (
          <div className="space-y-6 pb-8">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />最近学习动态
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">累计练习</p>
                  <p className="text-2xl font-bold text-blue-600">{userData.totalQuestions} 题</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-xs text-gray-500 mb-1">最近一次正确率</p>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-green-600">{recentAccuracy.value}%</p>
                    {recentAccuracy.trend === 1 && <TrendingUp className="w-5 h-5 text-green-600 mb-0.5" />}
                    {recentAccuracy.trend === -1 && <TrendingDown className="w-5 h-5 text-red-500 mb-0.5" />}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                  <p className="text-xs text-gray-500 mb-1">最佳连对</p>
                  <p className="text-2xl font-bold text-orange-600">{userData.bestStreak} 题</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">练习最多地图</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {mostPracticedMap ? `${mapTypeMeta[mostPracticedMap.key].icon} ${mapTypeMeta[mostPracticedMap.key].name}` : '—'}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />各地图练习表现（点击展开历史）
              </h2>
              <div className="space-y-3">
                {mapStats.map(s => {
                  const meta = mapTypeMeta[s.key]
                  const expanded = expandedMap === s.key
                  const prevAccuracy = s.recentSessions.length >= 2 ? s.recentSessions[1].accuracy : null
                  const lastAccuracy = s.recentSessions.length >= 1 ? s.recentSessions[0].accuracy : null
                  const trend = prevAccuracy !== null && lastAccuracy !== null
                    ? (lastAccuracy > prevAccuracy ? 1 : lastAccuracy < prevAccuracy ? -1 : 0) : 0

                  return (
                    <div key={s.key} className={`rounded-2xl p-4 border transition-all ${meta.bg}`}>
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedMap(expanded ? null : s.key)}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{meta.icon}</span>
                          <p className={`font-bold ${meta.color}`}>{meta.name}</p>
                          {trend === 1 && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {trend === -1 && <TrendingDown className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">练习 {s.playCount} 次</p>
                            <p className={`text-lg font-bold ${s.accuracy >= 70 ? 'text-green-600' : s.accuracy >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {s.totalCount > 0 ? `${s.accuracy}%` : '暂无数据'}
                            </p>
                          </div>
                          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </div>

                      <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden my-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.accuracy}%` }} transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${s.accuracy >= 70 ? 'bg-green-500' : s.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 mb-3">
                        <span>答对 {s.totalCorrect} / {s.totalCount}</span>
                        <div className="flex gap-3">
                          {s.wrongCount > 0 && <span className="text-red-500">待复习 {s.wrongCount} 道</span>}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/60 pt-3 mt-1 space-y-3">
                            {s.recentSessions.length === 0 ? (
                              <p className="text-center text-sm text-gray-400 py-2">暂无历史练习记录</p>
                            ) : (
                              <>
                                <p className="text-sm font-bold text-gray-700">最近 {s.recentSessions.length} 次练习：</p>
                                <div className="space-y-2">
                                  {s.recentSessions.map((r, idx) => {
                                    const next = s.recentSessions[idx + 1]
                                    const diff = next ? r.accuracy - next.accuracy : null
                                    return (
                                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white/80 rounded-xl text-sm">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-gray-400" />
                                          <span className="text-gray-600">{r.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-gray-500">{r.correct}/{r.total}</span>
                                          <span className={`font-bold ${r.accuracy >= 70 ? 'text-green-600' : r.accuracy >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                            {r.accuracy}%
                                          </span>
                                          {diff !== null && diff !== 0 && (
                                            <span className={`text-xs font-medium flex items-center gap-0.5 ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                              {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                              {diff > 0 ? '+' : ''}{diff}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </>
                            )}

                            <div className="pt-2 flex flex-wrap gap-2">
                              <button onClick={() => handleJumpToMap(s.key)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                                <Play className="w-4 h-4" />综合练习
                              </button>
                              {meta.focusOptions.map(f => (
                                <button key={f.id.join(',')} onClick={() => handleJumpToFocus(s.key, f.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-colors">
                                  <span>{f.icon}</span>{f.name}
                                </button>
                              ))}
                              {s.wrongCount > 0 && (
                                <button onClick={() => handleJumpToWrongByMap(s.key)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                                  <BookOpen className="w-4 h-4" />复习错题
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.section>

            {weakestTypes.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />薄弱题型（最常错 TOP）
                </h2>
                <div className="space-y-3">
                  {weakestTypes.map((w, idx) => (
                    <div key={w.type} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white font-bold flex items-center justify-center text-sm">{idx + 1}</div>
                      <div className="flex-1">
                        <p className="font-bold text-red-700">{w.label}</p>
                        <p className="text-xs text-red-500">
                          累计错误 {w.wrongCount} 次 · 涉及 {w.unique} 道题 · {mapTypeMeta[w.mapType].icon} {mapTypeMeta[w.mapType].name}
                        </p>
                      </div>
                      <button onClick={() => handleJumpToWeakType(w.mapType, w.type)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                        <Play className="w-4 h-4" />强化练习
                      </button>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white/60 rounded-2xl p-6 text-center">
              <p className="text-gray-500 mb-2">
                累计答题 <span className="font-bold text-gray-700">{userData.totalQuestions}</span> 道，
                答对 <span className="font-bold text-green-600">{userData.correctAnswers}</span> 道
              </p>
              <p className="text-sm text-gray-400">继续坚持，每天进步一点点！ 🌟</p>
            </motion.section>
          </div>
        )}
      </main>
    </div>
  )
}

export default AchievementsPage
