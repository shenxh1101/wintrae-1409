import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, BookOpen, Monitor, Map, Star, Zap, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MapType, Difficulty } from '../types'

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

const difficulties: { id: Difficulty; name: string; stars: number; color: string }[] = [
  { id: 'easy', name: '简单', stars: 1, color: 'bg-green-400' },
  { id: 'medium', name: '中等', stars: 2, color: 'bg-yellow-400' },
  { id: 'hard', name: '困难', stars: 3, color: 'bg-red-400' },
]

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedMap, setSelectedMap] = useState<MapType>('china')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const handleStartGame = () => {
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
                onClick={() => setSelectedMap(map.id)}
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
                  {diff.id === 'easy' ? '60秒' : diff.id === 'medium' ? '45秒' : '30秒'}
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
            className="px-12 py-5 bg-gradient-to-r from-primary to-accent-blue text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-3 animate-pulse"
          >
            <Zap className="w-7 h-7 fill-yellow-300" />
            开始挑战
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
