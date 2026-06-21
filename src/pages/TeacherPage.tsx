import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Shuffle,
  Maximize,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { allQuestions } from '../data'
import type { MapType, Question } from '../types'

const mapTypes: { id: MapType; name: string; icon: string }[] = [
  { id: 'china', name: '中国地图', icon: '🇨🇳' },
  { id: 'world', name: '世界大洲', icon: '🌍' },
  { id: 'grid', name: '经纬度网格', icon: '🧭' },
  { id: 'campus', name: '校园平面', icon: '🏫' },
]

const TeacherPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentMap, setCurrentMap] = useState<MapType>('china')
  const [showAnswer, setShowAnswer] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)

  const questionsByMap = allQuestions.filter(q => q.mapType === currentMap)

  useEffect(() => {
    if (questionsByMap.length > 0 && !currentQuestion) {
      setCurrentQuestion(questionsByMap[0])
    }
  }, [currentMap, questionsByMap.length])

  const handleRandomQuestion = () => {
    if (questionsByMap.length === 0) return
    const randomIndex = Math.floor(Math.random() * questionsByMap.length)
    setCurrentQuestion(questionsByMap[randomIndex])
    setShowAnswer(false)
    setSelectedId(null)
    setShowHint(false)
    setHintLevel(0)
  }

  const handlePrevQuestion = () => {
    if (!currentQuestion) return
    const currentIndex = questionsByMap.findIndex(q => q.id === currentQuestion.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : questionsByMap.length - 1
    setCurrentQuestion(questionsByMap[prevIndex])
    setShowAnswer(false)
    setSelectedId(null)
    setShowHint(false)
    setHintLevel(0)
  }

  const handleNextQuestion = () => {
    if (!currentQuestion) return
    const currentIndex = questionsByMap.findIndex(q => q.id === currentQuestion.id)
    const nextIndex = currentIndex < questionsByMap.length - 1 ? currentIndex + 1 : 0
    setCurrentQuestion(questionsByMap[nextIndex])
    setShowAnswer(false)
    setSelectedId(null)
    setShowHint(false)
    setHintLevel(0)
  }

  const handleMapTypeChange = (type: MapType) => {
    setCurrentMap(type)
    setCurrentQuestion(null)
    setShowAnswer(false)
    setSelectedId(null)
    setShowHint(false)
    setHintLevel(0)
  }

  const handleRegionClick = (id: string) => {
    setSelectedId(id)
  }

  const handleZoomIn = () => {
    setZoom(z => Math.min(2, z + 0.2))
  }

  const handleZoomOut = () => {
    setZoom(z => Math.max(0.6, z - 0.2))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleShowHint = () => {
    if (!currentQuestion || hintLevel >= 3) return
    setShowHint(true)
    setHintLevel(h => Math.min(3, h + 1))
  }

  const questionIndex = currentQuestion
    ? questionsByMap.findIndex(q => q.id === currentQuestion.id) + 1
    : 0

  return (
    <div className={`min-h-screen ${isFullscreen ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
      <header className={`${isFullscreen ? 'bg-gray-800/90 text-white' : 'bg-white/90'} backdrop-blur-sm shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isFullscreen && (
                <button
                  onClick={() => navigate('/')}
                  className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <Monitor className={`w-6 h-6 ${isFullscreen ? 'text-blue-400' : 'text-primary'}`} />
                <h1 className={`text-xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>
                  教师投屏模式
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                title="缩小"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className={`text-sm font-medium w-16 text-center ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                title="放大"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <div className={`w-px h-6 mx-2 ${isFullscreen ? 'bg-gray-600' : 'bg-gray-200'}`} />
              
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  showAnswer
                    ? 'bg-green-500 text-white'
                    : isFullscreen
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {showAnswer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                <span className="hidden sm:inline">{showAnswer ? '显示答案' : '隐藏答案'}</span>
              </button>
              
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                title="全屏"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className={`grid lg:grid-cols-4 gap-6 ${isFullscreen ? 'lg:grid-cols-5' : ''}`}>
          <aside className="lg:col-span-1 space-y-4">
            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
              <h3 className={`text-sm font-bold mb-3 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                选择地图
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {mapTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleMapTypeChange(type.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                      currentMap === type.id
                        ? 'bg-primary text-white shadow-md'
                        : isFullscreen
                          ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-200'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
              <h3 className={`text-sm font-bold mb-3 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                题目导航
              </h3>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevQuestion}
                  className={`p-2 rounded-lg transition-colors ${
                    isFullscreen ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className={`text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                  {questionIndex} / {questionsByMap.length}
                </span>
                <button
                  onClick={handleNextQuestion}
                  className={`p-2 rounded-lg transition-colors ${
                    isFullscreen ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleRandomQuestion}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Shuffle className="w-5 h-5" />
                随机抽题
              </button>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-4">
            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 md:p-6`}>
              <div className="aspect-[4/3] md:aspect-video rounded-xl overflow-hidden bg-gray-50">
                <MapComponent
                  mapType={currentMap}
                  selectedId={selectedId}
                  highlightId={null}
                  showAnswer={showAnswer}
                  answerId={currentQuestion?.targetId}
                  onRegionClick={handleRegionClick}
                  zoom={zoom}
                />
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                        isFullscreen ? 'bg-blue-900/50 text-blue-300' : 'bg-primary/10 text-primary'
                      }`}>
                        {currentQuestion.type === 'province' && '省份题'}
                        {currentQuestion.type === 'city' && '城市题'}
                        {currentQuestion.type === 'river' && '河流题'}
                        {currentQuestion.type === 'continent' && '大洲题'}
                        {currentQuestion.type === 'direction' && '方位题'}
                        {currentQuestion.type === 'latitude' && '纬线题'}
                        {currentQuestion.type === 'longitude' && '经线题'}
                        {currentQuestion.type === 'building' && '建筑题'}
                      </div>
                      <h2 className={`text-2xl md:text-3xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>
                        {currentQuestion.prompt}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={handleShowHint}
                      disabled={hintLevel >= 3}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        hintLevel >= 3
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isFullscreen
                            ? 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      提示 ({3 - hintLevel})
                    </button>
                    
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        showAnswer
                          ? 'bg-green-500 text-white'
                          : isFullscreen
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {showAnswer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      {showAnswer ? '显示答案' : '隐藏答案'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showHint && hintLevel > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl mb-4 ${
                          isFullscreen ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-yellow-50 border-2 border-yellow-200'
                        }`}
                      >
                        <div className={`flex items-center gap-2 font-medium mb-2 ${
                          isFullscreen ? 'text-yellow-300' : 'text-yellow-700'
                        }`}>
                          <Lightbulb className="w-5 h-5" />
                          提示 {hintLevel}/3
                        </div>
                        <ul className={`space-y-1 ${isFullscreen ? 'text-yellow-200' : 'text-yellow-600'}`}>
                          {currentQuestion.hints.slice(0, hintLevel).map((hint, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>{i + 1}.</span>
                              <span>{hint}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {showAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl ${
                          isFullscreen ? 'bg-green-900/30 border border-green-700/50' : 'bg-green-50 border-2 border-green-200'
                        }`}
                      >
                        <p className={`font-bold mb-2 ${isFullscreen ? 'text-green-300' : 'text-green-700'}`}>
                          ✅ 正确答案
                        </p>
                        <p className={`text-lg font-medium mb-2 ${isFullscreen ? 'text-green-200' : 'text-green-600'}`}>
                          {currentQuestion.targetId}
                        </p>
                        <p className={`${isFullscreen ? 'text-green-300/80' : 'text-green-600/80'}`}>
                          {currentQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeacherPage
