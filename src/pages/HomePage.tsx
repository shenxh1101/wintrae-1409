import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, BookOpen, Monitor, Map, Star, Zap, Target, Layers, ChevronRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MapType, Difficulty, QuestionType } from '../types'
import { useGameStore } from '../store/gameStore'

const mapTypes = [
  {
    id: 'china' as MapType,
    name: '中国地图',
    description: '认识省份、城市和河流',
    icon: '🇨🇳',
    color: 'from-red-400 to-orange-400',
    bgColor: 'bg-red-50',
  },
  {
    id: 'world' as MapType,
    name: '世界大洲',
    description: '探索七大洲四大洋',
    icon: '🌍',
    color: 'from-blue-400 to-cyan-400',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'grid' as MapType,
    name: '经纬度网格',
    description: '学习经纬线和方位',
    icon: '🧭',
    color: 'from-green-400 to-teal-400',
    bgColor: 'bg-green-50',
  },
  {
    id: 'campus' as MapType,
    name: '校园平面图',
    description: '熟悉校园环境布局',
    icon: '🏫',
    color: 'from-purple-400 to-pink-400',
    bgColor: 'bg-purple-50',
  },
]

const specialFocusGroups: {
  mapType: MapType
  groups: { id: QuestionType[]; name: string; icon: string; color: string }[]
}[] = [
  {
    mapType: 'china',
    groups: [
      { id: ['province'], name: '省份专项', icon: '🗺️', color: 'bg-red-100 text-red-700 border-red-300' },
      { id: ['city'], name: '城市专项', icon: '🏙️', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      { id: ['river'], name: '河流专项', icon: '🌊', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    ],
  },
  {
    mapType: 'grid',
    groups: [
      { id: ['latitude'], name: '纬线专项', icon: '↔️', color: 'bg-green-100 text-green-700 border-green-300' },
      { id: ['longitude'], name: '经线专项', icon: '↕️', color: 'bg-teal-100 text-teal-700 border-teal-300' },
      { id: ['latitude', 'longitude'], name: '经纬线综合', icon: '➕', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    ],
  },
  {
    mapType: 'campus',
    groups: [
      { id: ['building'], name: '校园建筑专项', icon: '🏫', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      { id: ['direction'], name: '方位专项', icon: '🧭', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    ],
  },
  {
    mapType: 'world',
    groups: [
      { id: ['continent'], name: '大洲大洋专项', icon: '🌍', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    ],
  },
]

const difficulties: { id: Difficulty; name: string; stars: number; color: string; seconds: number }[] = [
  { id: 'easy', name: '简单', stars: 1, color: 'bg-green-400', seconds: 60 },
  { id: 'medium', name: '中等', stars: 2, color: 'bg-yellow-400', seconds: 45 },
  { id: 'hard', name: '困难', stars: 3, color: 'bg-red-400', seconds: 30 },
]

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const startGame = useGameStore((s) => s.startGame)
  const [selectedMap, setSelectedMap] = useState<MapType>('china')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [practiceMode, setPracticeMode] = useState<'mixed' | 'focus'>('mixed')
  const [selectedFocus, setSelectedFocus] = useState<QuestionType[] | null>(null)

  const focusGroups = specialFocusGroups.find((g) => g.mapType === selectedMap)?.groups ?? []

  const handleStartGame = () => {
    if (practiceMode === 'focus' && selectedFocus) {
      startGame(selectedMap, difficulty, 10, selectedFocus)
    } else {
      startGame(selectedMap, difficulty, 10, [])
    }
    navigate(`/game/${selectedMap}?difficulty=${difficulty}`)
  }

  const handleTeacherMode = () => {
    navigate('/teacher')
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent-blue rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🗺️</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-shadow">
                地理小达人
              </h1>
              <p className="text-sm text-gray-500">快乐学习，探索世界</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/achievements')}
              className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              title="成就"
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
            </button>
            <button
              onClick={() => navigate('/review')}
              className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              title="错题本"
            >
              <BookOpen className="w-6 h-6 text-red-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Map className="w-6 h-6 text-primary" />
            选择地图
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mapTypes.map((map, index) => (
              <motion.div
                key={map.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => { setSelectedMap(map.id); setSelectedFocus(null) }}
                className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 ${
                  selectedMap === map.id
                    ? 'bg-white shadow-xl scale-105 ring-4 ring-primary'
                    : 'bg-white/70 shadow-md hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${map.color} flex items-center justify-center shadow-inner`}>
                  <span className="text-3xl">{map.icon}</span>
                </div>
                <h3 className="text-center font-bold text-gray-800 mb-1">{map.name}</h3>
                <p className="text-center text-xs text-gray-500">{map.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            练习模式
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <button
              onClick={() => setPracticeMode('mixed')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                practiceMode === 'mixed'
                  ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
              }`}
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-bold">综合练习</div>
              <div className={`text-xs mt-1 ${practiceMode === 'mixed' ? 'text-white/80' : 'text-gray-500'}`}>
                随机抽取各种题型
              </div>
            </button>
            <button
              onClick={() => setPracticeMode('focus')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                practiceMode === 'focus'
                  ? 'bg-accent-blue text-white border-accent-blue shadow-lg scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-accent-blue'
              }`}
            >
              <div className="text-2xl mb-1">🎓</div>
              <div className="font-bold">专项训练</div>
              <div className={`text-xs mt-1 ${practiceMode === 'focus' ? 'text-white/80' : 'text-gray-500'}`}>
                只练薄弱题型，逐个攻破
              </div>
            </button>
          </div>

          {practiceMode === 'focus' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/70 rounded-2xl p-4 border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-3">选择要强化练习的专项：</p>
              <div className="flex flex-wrap gap-2">
                {focusGroups.map((g) => (
                  <button
                    key={g.id.join(',')}
                    onClick={() => setSelectedFocus(selectedFocus?.join(',') === g.id.join(',') ? null : g.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm ${
                      selectedFocus?.join(',') === g.id.join(',')
                        ? `${g.color} border-current shadow-md scale-105 font-bold`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{g.icon}</span>
                    {g.name}
                    {selectedFocus?.join(',') === g.id.join(',') && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </button>
                ))}
                {focusGroups.length === 0 && (
                  <p className="text-gray-500 text-sm italic">该地图暂未提供专项分类</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            选择难度
          </h2>
          
          <div className="flex justify-center gap-4">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`flex flex-col items-center px-6 py-4 rounded-2xl transition-all duration-300 ${
                  difficulty === diff.id
                    ? 'bg-white shadow-xl scale-110 ring-4 ring-yellow-400'
                    : 'bg-white/70 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: diff.stars }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {Array.from({ length: 3 - diff.stars }).map((_, i) => (
                    <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
                  ))}
                </div>
                <span className="font-bold text-gray-700">{diff.name}</span>
                <span className={`text-xs mt-1 px-3 py-0.5 rounded-full ${diff.color} text-white`}>
                  {diff.seconds}秒
                </span>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10"
        >
          <button
            onClick={handleStartGame}
            disabled={practiceMode === 'focus' && !selectedFocus}
            className="px-12 py-5 bg-gradient-to-r from-primary to-accent-blue text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-3 animate-pulse disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Zap className="w-7 h-7 fill-yellow-300" />
            {practiceMode === 'focus' && selectedFocus ? '开始专项训练' : '开始挑战'}
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleTeacherMode}
            className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 border-2 border-gray-200"
          >
            <Monitor className="w-6 h-6" />
            教师投屏模式
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          <div className="bg-white/80 rounded-2xl p-4 text-center shadow-md">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="text-xs text-gray-500">次提示机会</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 text-center shadow-md">
            <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">连对</p>
            <p className="text-xs text-gray-500">加分奖励</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 text-center shadow-md">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">成就</p>
            <p className="text-xs text-gray-500">徽章收集</p>
          </div>
        </motion.div>
      </main>
      
      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>🌟 每天学一点，地理知识全掌握 🌟</p>
      </footer>
    </div>
  )
}

export default HomePage
