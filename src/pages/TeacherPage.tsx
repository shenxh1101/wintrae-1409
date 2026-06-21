import React, { useState, useEffect, useRef } from 'react'
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
  Play,
  Pause,
  RotateCcw,
  Hand,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { allQuestions } from '../data'
import type { MapType, Question, QuestionType } from '../types'

const mapTypes: { id: MapType; name: string; icon: string }[] = [
  { id: 'china', name: '中国地图', icon: '🇨🇳' },
  { id: 'world', name: '世界大洲', icon: '🌍' },
  { id: 'grid', name: '经纬度网格', icon: '🧭' },
  { id: 'campus', name: '校园平面', icon: '🏫' },
]

const typeLabel: Record<QuestionType, string> = {
  province: '省份题',
  city: '城市题',
  river: '河流题',
  direction: '方位题',
  continent: '大洲大洋题',
  latitude: '纬线题',
  longitude: '经线题',
  building: '校园建筑题',
}

const COUNTDOWN_PRESETS = [10, 20, 30, 45, 60]

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

  const [rushMode, setRushMode] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(30)
  const [countdownActive, setCountdownActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [expandRushPanel, setExpandRushPanel] = useState(true)
  const beepRef = useRef<number | null>(null)

  const questionsByMap = allQuestions.filter(q => q.mapType === currentMap)

  useEffect(() => {
    if (questionsByMap.length > 0 && !currentQuestion) {
      setCurrentQuestion(questionsByMap[0])
    }
  }, [currentMap, questionsByMap.length])

  useEffect(() => {
    if (!countdownActive || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          setCountdownActive(false)
          if (soundOn) playBeep(true)
          return 0
        }
        if (t <= 5 && soundOn) playBeep(false)
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdownActive, timeLeft, soundOn])

  const playBeep = (loud: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = loud ? 880 : 660
      osc.type = 'sine'
      gain.gain.value = loud ? 0.3 : 0.1
      osc.start()
      osc.stop(ctx.currentTime + (loud ? 0.6 : 0.12))
    } catch {
    }
  }

  const handleRandomQuestion = () => {
    if (questionsByMap.length === 0) return
    const randomIndex = Math.floor(Math.random() * questionsByMap.length)
    setCurrentQuestion(questionsByMap[randomIndex])
    setShowAnswer(false)
    setSelectedId(null)
    setShowHint(false)
    setHintLevel(0)
    setAnswerRevealed(false)
    setCountdownActive(false)
    setTimeLeft(countdownSeconds)
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
    setAnswerRevealed(false)
    setCountdownActive(false)
    setTimeLeft(countdownSeconds)
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
    setAnswerRevealed(false)
    setCountdownActive(false)
    setTimeLeft(countdownSeconds)
  }

  const handleMapTypeChange = (type: MapType) => {
    setCurrentMap(type)
    setCurrentQuestion(null)
    setShowAnswer(false)
    setSelectedId(null)
    setShowHint(false)
    setHintLevel(0)
    setAnswerRevealed(false)
    setCountdownActive(false)
    setTimeLeft(countdownSeconds)
  }

  const handleRegionClick = (id: string) => {
    setSelectedId(id)
  }

  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.2))
  const handleZoomOut = () => setZoom(z => Math.max(0.6, z - 0.2))

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

  const startRushCountdown = () => {
    setTimeLeft(countdownSeconds)
    setCountdownActive(true)
    setAnswerRevealed(false)
    setShowAnswer(false)
    setSelectedId(null)
  }

  const pauseRushCountdown = () => setCountdownActive(false)

  const resetRushCountdown = () => {
    setCountdownActive(false)
    setTimeLeft(countdownSeconds)
  }

  const revealAnswer = () => {
    setCountdownActive(false)
    setAnswerRevealed(true)
    setShowAnswer(true)
    if (soundOn) playBeep(true)
  }

  const questionIndex = currentQuestion
    ? questionsByMap.findIndex(q => q.id === currentQuestion.id) + 1
    : 0

  const rushTimePercent = (timeLeft / countdownSeconds) * 100
  const rushTimeColor = rushTimePercent > 50 ? 'bg-green-500' : rushTimePercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

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
              <button
                onClick={() => setExpandRushPanel(!expandRushPanel)}
                className={`w-full flex items-center justify-between mb-2 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}
              >
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Hand className="w-5 h-5 text-orange-500" />
                  课堂抢答
                </h3>
                {expandRushPanel ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {expandRushPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    <div>
                      <p className={`text-xs font-medium mb-2 ${isFullscreen ? 'text-gray-400' : 'text-gray-500'}`}>
                        倒计时时长
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {COUNTDOWN_PRESETS.map(sec => (
                          <button
                            key={sec}
                            onClick={() => {
                              setCountdownSeconds(sec)
                              setTimeLeft(sec)
                            }}
                            disabled={countdownActive}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              countdownSeconds === sec
                                ? 'bg-orange-500 text-white shadow'
                                : isFullscreen
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className={`w-4 h-4 ${isFullscreen ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-2xl font-bold tabular-nums ${
                          timeLeft <= 5 && countdownActive
                            ? 'text-red-500 animate-pulse'
                            : isFullscreen ? 'text-white' : 'text-gray-800'
                        }`}>
                          {timeLeft}s
                        </span>
                      </div>
                      <button
                        onClick={() => setSoundOn(!soundOn)}
                        className={`p-2 rounded-lg transition-colors ${
                          isFullscreen ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title={soundOn ? '关闭提示音' : '开启提示音'}
                      >
                        {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        key={`rush-${currentQuestion?.id}-${countdownSeconds}`}
                        className={`h-full ${rushTimeColor} rounded-full`}
                        initial={{ width: '100%' }}
                        animate={{ width: `${rushTimePercent}%` }}
                        transition={{ duration: countdownActive ? 1 : 0 }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {!countdownActive ? (
                        <button
                          onClick={startRushCountdown}
                          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          <Play className="w-5 h-5" />
                          开始
                        </button>
                      ) : (
                        <button
                          onClick={pauseRushCountdown}
                          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          <Pause className="w-5 h-5" />
                          暂停
                        </button>
                      )}
                      <button
                        onClick={resetRushCountdown}
                        className={`flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all ${
                          isFullscreen
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <RotateCcw className="w-5 h-5" />
                        重置
                      </button>
                    </div>

                    <button
                      onClick={revealAnswer}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      一键公布答案
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 md:p-6 relative overflow-hidden`}>
              {rushMode && countdownActive && timeLeft <= 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`absolute inset-0 pointer-events-none ${timeLeft % 2 === 0 ? 'bg-red-500' : 'bg-transparent'}`}
                />
              )}
              <div className="aspect-[4/3] md:aspect-video rounded-xl overflow-hidden bg-gray-50 relative">
                <MapComponent
                  mapType={currentMap}
                  selectedId={selectedId}
                  highlightId={null}
                  showAnswer={showAnswer || answerRevealed}
                  answerId={currentQuestion?.targetId}
                  onRegionClick={handleRegionClick}
                  zoom={zoom}
                />
                {(showAnswer || answerRevealed) && currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    正确答案已公布
                  </motion.div>
                )}
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
                        {typeLabel[currentQuestion.type] ?? currentQuestion.type}
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
                      onClick={() => { setShowAnswer(!showAnswer); setAnswerRevealed(false) }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        showAnswer
                          ? 'bg-green-500 text-white'
                          : isFullscreen
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {showAnswer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      {showAnswer ? '隐藏答案' : '显示答案'}
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
                    {(showAnswer || answerRevealed) && (
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
