import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Eye, EyeOff, ZoomIn, ZoomOut, Shuffle, Maximize, Monitor, ChevronLeft, ChevronRight,
  Lightbulb, Play, Pause, RotateCcw, Hand, Clock, Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp,
  ClipboardCheck, Users, CheckCircle, MinusCircle, XCircle, GraduationCap, FileText, Download,
  MapPin,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { allQuestions } from '../data'
import { useUserStore } from '../store/userStore'
import type { MapType, Question, QuestionType, MasteryLevel, TeacherClassQuestionRecord, ClassSession } from '../types'

const mapTypes: { id: MapType; name: string; icon: string }[] = [
  { id: 'china', name: '中国地图', icon: '🇨🇳' },
  { id: 'world', name: '世界大洲', icon: '🌍' },
  { id: 'grid', name: '经纬度网格', icon: '🧭' },
  { id: 'campus', name: '校园平面', icon: '🏫' },
]

const typeLabel: Record<QuestionType, string> = {
  province: '省份题', city: '城市题', river: '河流题', direction: '方位题',
  continent: '大洲大洋题', latitude: '纬线题', longitude: '经线题', building: '校园建筑题',
}

const mapTypeLabel: Record<MapType, string> = {
  china: '中国地图', world: '世界大洲', grid: '经纬度网格', campus: '校园平面',
}

const COUNTDOWN_PRESETS = [10, 20, 30, 45, 60]

const masteryOptions: { id: MasteryLevel; label: string; icon: React.ReactNode; color: string; bg: string; desc: string }[] = [
  { id: 'mastered', label: '全班掌握', icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-500 hover:bg-green-600', desc: '绝大多数学生能快速答出' },
  { id: 'partial', label: '部分掌握', icon: <MinusCircle className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-500 hover:bg-yellow-600', desc: '约半数学生能答对' },
  { id: 'weak', label: '普遍薄弱', icon: <XCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-500 hover:bg-red-600', desc: '大多数学生答错或超时' },
]

const TeacherPage: React.FC = () => {
  const navigate = useNavigate()
  const userData = useUserStore()
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

  const [classSession, setClassSession] = useState<string | null>(userData.currentClassSessionId ?? null)
  const [showSummary, setShowSummary] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [showStartSession, setShowStartSession] = useState(false)

  const currentSession = useMemo(
    () => userData.classSessions.find(s => s.id === classSession) ?? null,
    [userData.classSessions, classSession]
  )

  const currentQuestionRecord = useMemo(() => {
    if (!currentSession || !currentQuestion) return null
    return currentSession.records.find(r => r.questionId === currentQuestion.id) ?? null
  }, [currentSession, currentQuestion])

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

  const markMastery = (level: MasteryLevel) => {
    if (!currentSession || !currentQuestion) return
    const timeUsed = countdownSeconds - timeLeft
    const rec: TeacherClassQuestionRecord = {
      questionId: currentQuestion.id,
      mapType: currentQuestion.mapType,
      questionType: currentQuestion.type,
      prompt: currentQuestion.prompt,
      mastery: level,
      timeUsed,
      timestamp: Date.now(),
    }
    if (currentQuestionRecord) {
      userData.updateClassQuestionRecord(currentSession.id, currentQuestion.id, { mastery: level, timeUsed, timestamp: Date.now() })
    } else {
      userData.addClassQuestionRecord(currentSession.id, rec)
    }
  }

  const startNewSession = () => {
    const name = sessionName.trim() || `课堂记录 ${new Date().toLocaleDateString('zh-CN')}`
    const id = userData.startClassSession(name)
    setClassSession(id)
    setShowStartSession(false)
    setSessionName('')
  }

  const endCurrentSession = () => {
    if (!classSession) return
    userData.endCurrentClassSession()
    setClassSession(null)
    setShowSummary(true)
  }

  const summaryStats = useMemo(() => {
    if (!currentSession) return null
    const recs = currentSession.records
    const counts = { mastered: 0, partial: 0, weak: 0 }
    const byType = new Map<QuestionType, { mastered: number; partial: number; weak: number; total: number }>()
    const byMap = new Map<MapType, { mastered: number; partial: number; weak: number; total: number }>()
    let totalTime = 0

    recs.forEach(r => {
      counts[r.mastery]++
      totalTime += r.timeUsed
      if (!byType.has(r.questionType)) byType.set(r.questionType, { mastered: 0, partial: 0, weak: 0, total: 0 })
      const t = byType.get(r.questionType)!
      t[r.mastery]++; t.total++
      if (!byMap.has(r.mapType)) byMap.set(r.mapType, { mastered: 0, partial: 0, weak: 0, total: 0 })
      const m = byMap.get(r.mapType)!
      m[r.mastery]++; m.total++
    })

    const masteryRate = recs.length > 0 ? Math.round((counts.mastered / recs.length) * 100) : 0
    const weakPoints = recs.filter(r => r.mastery === 'weak')
    const partialPoints = recs.filter(r => r.mastery === 'partial')
    const avgTime = recs.length > 0 ? Math.round(totalTime / recs.length) : 0

    return { counts, byType, byMap, masteryRate, weakPoints, partialPoints, avgTime, total: recs.length }
  }, [currentSession])

  const exportSummary = (targetSession?: ClassSession | null, targetStats?: any) => {
    const session = targetSession ?? currentSession
    const stats = targetStats ?? summaryStats
    if (!session || !stats) return
    const dateStr = new Date(session.startedAt).toLocaleString('zh-CN')
    let text = `==========================================\n`
    text += `  地理课堂小结 - ${session.name}\n`
    text += `  时间：${dateStr}\n`
    text += `==========================================\n\n`
    text += `📊 整体情况\n`
    text += `  题目总数：${stats.total} 道\n`
    text += `  全班掌握：${stats.counts.mastered} 道\n`
    text += `  部分掌握：${stats.counts.partial} 道\n`
    text += `  普遍薄弱：${stats.counts.weak} 道\n`
    text += `  整体掌握率：${stats.masteryRate}%\n`
    text += `  平均答题用时：${stats.avgTime}s\n\n`
    if (stats.byMap.size > 0) {
      text += `🗺️ 各地图表现\n`
      stats.byMap.forEach((v: any, k: MapType) => {
        const rate = v.total > 0 ? Math.round((v.mastered / v.total) * 100) : 0
        text += `  · ${mapTypeLabel[k]}：${v.total}题，掌握率 ${rate}%（掌握${v.mastered} / 部分${v.partial} / 薄弱${v.weak}）\n`
      })
      text += `\n`
    }
    if (stats.byType.size > 0) {
      text += `📝 各题型表现\n`
      stats.byType.forEach((v: any, k: QuestionType) => {
        const rate = v.total > 0 ? Math.round((v.mastered / v.total) * 100) : 0
        text += `  · ${typeLabel[k] ?? k}：${v.total}题，掌握率 ${rate}%\n`
      })
      text += `\n`
    }
    if (stats.weakPoints.length > 0) {
      text += `🔴 需要重点复习（普遍薄弱）\n`
      stats.weakPoints.forEach((r: TeacherClassQuestionRecord, i: number) => {
        text += `  ${i + 1}. [${mapTypeLabel[r.mapType]}·${typeLabel[r.questionType]}] ${r.prompt}\n`
      })
      text += `\n`
    }
    if (stats.partialPoints.length > 0) {
      text += `🟡 需要巩固（部分掌握）\n`
      stats.partialPoints.forEach((r: TeacherClassQuestionRecord, i: number) => {
        text += `  ${i + 1}. [${mapTypeLabel[r.mapType]}·${typeLabel[r.questionType]}] ${r.prompt}\n`
      })
      text += `\n`
    }
    text += `==========================================\n`

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `课堂小结_${session.name.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
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
                <button onClick={() => navigate('/')}
                  className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <Monitor className={`w-6 h-6 ${isFullscreen ? 'text-blue-400' : 'text-primary'}`} />
                <h1 className={`text-xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>教师投屏模式</h1>
              </div>
              {currentSession && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <GraduationCap className="w-4 h-4" />
                  <span>{currentSession.name}</span>
                  <span className="opacity-70">· {currentSession.records.length}题</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!classSession ? (
                <button onClick={() => setShowStartSession(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-colors ${
                    isFullscreen ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white shadow'
                  }`}>
                  <ClipboardCheck className="w-5 h-5" />
                  <span className="hidden sm:inline">开始课堂记录</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSummary(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-colors ${
                      isFullscreen ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}>
                    <FileText className="w-5 h-5" />
                    <span className="hidden sm:inline">课堂小结</span>
                  </button>
                  <button onClick={endCurrentSession}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium bg-orange-500 hover:bg-orange-600 text-white shadow">
                    <CheckCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">结束记录</span>
                  </button>
                </div>
              )}

              <button onClick={handleZoomOut}
                className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`} title="缩小">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className={`text-sm font-medium w-16 text-center ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn}
                className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`} title="放大">
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <div className={`w-px h-6 mx-2 ${isFullscreen ? 'bg-gray-600' : 'bg-gray-200'}`} />
              
              <button onClick={() => setShowAnswer(!showAnswer)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  showAnswer
                    ? 'bg-green-500 text-white'
                    : isFullscreen
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                {showAnswer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                <span className="hidden sm:inline">{showAnswer ? '显示答案' : '隐藏答案'}</span>
              </button>
              
              <button onClick={toggleFullscreen}
                className={`p-2 rounded-xl transition-colors ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`} title="全屏">
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
              <h3 className={`text-sm font-bold mb-3 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>选择地图</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {mapTypes.map(type => (
                  <button key={type.id} onClick={() => handleMapTypeChange(type.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                      currentMap === type.id
                        ? 'bg-primary text-white shadow-md'
                        : isFullscreen
                          ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-200'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}>
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
              <button onClick={() => setExpandRushPanel(!expandRushPanel)}
                className={`w-full flex items-center justify-between mb-2 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Hand className="w-5 h-5 text-orange-500" />课堂抢答
                </h3>
                {expandRushPanel ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {expandRushPanel && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                    <div>
                      <p className={`text-xs font-medium mb-2 ${isFullscreen ? 'text-gray-400' : 'text-gray-500'}`}>倒计时时长</p>
                      <div className="flex flex-wrap gap-2">
                        {COUNTDOWN_PRESETS.map(sec => (
                          <button key={sec} onClick={() => { setCountdownSeconds(sec); setTimeLeft(sec) }}
                            disabled={countdownActive}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              countdownSeconds === sec
                                ? 'bg-orange-500 text-white shadow'
                                : isFullscreen
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50`}>
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
                      <button onClick={() => setSoundOn(!soundOn)}
                        className={`p-2 rounded-lg transition-colors ${
                          isFullscreen ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`} title={soundOn ? '关闭提示音' : '开启提示音'}>
                        {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div key={`rush-${currentQuestion?.id}-${countdownSeconds}`}
                        className={`h-full ${rushTimeColor} rounded-full`} initial={{ width: '100%' }}
                        animate={{ width: `${rushTimePercent}%` }} transition={{ duration: countdownActive ? 1 : 0 }} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {!countdownActive ? (
                        <button onClick={startRushCountdown}
                          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                          <Play className="w-5 h-5" />开始
                        </button>
                      ) : (
                        <button onClick={pauseRushCountdown}
                          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                          <Pause className="w-5 h-5" />暂停
                        </button>
                      )}
                      <button onClick={resetRushCountdown}
                        className={`flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all ${
                          isFullscreen ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                        <RotateCcw className="w-5 h-5" />重置
                      </button>
                    </div>

                    <button onClick={revealAnswer}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                      <Sparkles className="w-5 h-5" />一键公布答案
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {classSession && currentSession && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
                  <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Users className="w-5 h-5 text-purple-500" />全班掌握情况
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="p-2 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-lg font-bold text-green-600">{summaryStats?.counts.mastered ?? 0}</p>
                      <p className="text-xs text-green-600">掌握</p>
                    </div>
                    <div className="p-2 rounded-xl bg-yellow-50 border border-yellow-200">
                      <p className="text-lg font-bold text-yellow-600">{summaryStats?.counts.partial ?? 0}</p>
                      <p className="text-xs text-yellow-600">部分</p>
                    </div>
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-lg font-bold text-red-500">{summaryStats?.counts.weak ?? 0}</p>
                      <p className="text-xs text-red-500">薄弱</p>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-green-500" style={{ width: `${summaryStats?.masteryRate ?? 0}%` }} />
                  </div>
                  <p className={`text-center text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                    本次掌握率：{summaryStats?.masteryRate ?? 0}%
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
            
            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-4`}>
              <h3 className={`text-sm font-bold mb-3 ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>题目导航</h3>
              <div className="flex items-center justify-between mb-3">
                <button onClick={handlePrevQuestion}
                  className={`p-2 rounded-lg transition-colors ${
                    isFullscreen ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className={`text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                  {questionIndex} / {questionsByMap.length}
                </span>
                <button onClick={handleNextQuestion}
                  className={`p-2 rounded-lg transition-colors ${
                    isFullscreen ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleRandomQuestion}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                <Shuffle className="w-5 h-5" />随机抽题
              </button>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-4">
            <div className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 md:p-6 relative overflow-hidden`}>
              {rushMode && countdownActive && timeLeft <= 5 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`absolute inset-0 pointer-events-none ${timeLeft % 2 === 0 ? 'bg-red-500' : 'bg-transparent'}`} />
              )}
              <div className="aspect-[4/3] md:aspect-video rounded-xl overflow-hidden bg-gray-50 relative">
                <MapComponent mapType={currentMap} selectedId={selectedId} highlightId={null}
                  showAnswer={showAnswer || answerRevealed} answerId={currentQuestion?.targetId}
                  onRegionClick={handleRegionClick} zoom={zoom} />
                {(showAnswer || answerRevealed) && currentQuestion && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />正确答案已公布
                  </motion.div>
                )}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`${isFullscreen ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                        isFullscreen ? 'bg-blue-900/50 text-blue-300' : 'bg-primary/10 text-primary'
                      }`}>
                        <span>{mapTypes.find(m => m.id === currentQuestion.mapType)?.icon}</span>
                        <span>{mapTypeLabel[currentQuestion.mapType]}</span>
                        <span>·</span>
                        <span>{typeLabel[currentQuestion.type] ?? currentQuestion.type}</span>
                      </div>
                      <h2 className={`text-2xl md:text-3xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>
                        {currentQuestion.prompt}
                      </h2>
                    </div>
                    {currentQuestionRecord && (
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium ${
                        currentQuestionRecord.mastery === 'mastered' ? 'bg-green-100 text-green-700'
                          : currentQuestionRecord.mastery === 'partial' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {currentQuestionRecord.mastery === 'mastered' && <CheckCircle className="w-4 h-4" />}
                        {currentQuestionRecord.mastery === 'partial' && <MinusCircle className="w-4 h-4" />}
                        {currentQuestionRecord.mastery === 'weak' && <XCircle className="w-4 h-4" />}
                        已记录
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button onClick={handleShowHint} disabled={hintLevel >= 3}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        hintLevel >= 3
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isFullscreen
                            ? 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}>
                      <Lightbulb className="w-5 h-5" />提示 ({3 - hintLevel})
                    </button>
                    
                    <button onClick={() => { setShowAnswer(!showAnswer); setAnswerRevealed(false) }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        showAnswer
                          ? 'bg-green-500 text-white'
                          : isFullscreen
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {showAnswer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      {showAnswer ? '隐藏答案' : '显示答案'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showHint && hintLevel > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl mb-4 ${
                          isFullscreen ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-yellow-50 border-2 border-yellow-200'
                        }`}>
                        <div className={`flex items-center gap-2 font-medium mb-2 ${isFullscreen ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          <Lightbulb className="w-5 h-5" />提示 {hintLevel}/3
                        </div>
                        <ul className={`space-y-1 ${isFullscreen ? 'text-yellow-200' : 'text-yellow-600'}`}>
                          {currentQuestion.hints.slice(0, hintLevel).map((hint, i) => (
                            <li key={i} className="flex items-start gap-2"><span>{i + 1}.</span><span>{hint}</span></li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {(showAnswer || answerRevealed) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl mb-4 ${
                          isFullscreen ? 'bg-green-900/30 border border-green-700/50' : 'bg-green-50 border-2 border-green-200'
                        }`}>
                        <p className={`font-bold mb-2 ${isFullscreen ? 'text-green-300' : 'text-green-700'}`}>✅ 正确答案</p>
                        <p className={`text-lg font-medium mb-2 ${isFullscreen ? 'text-green-200' : 'text-green-600'}`}>
                          {currentQuestion.targetId}
                        </p>
                        <p className={`${isFullscreen ? 'text-green-300/80' : 'text-green-600/80'}`}>
                          {currentQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {classSession && (showAnswer || answerRevealed) && (
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl ${
                          isFullscreen ? 'bg-purple-900/30 border border-purple-700/50' : 'bg-purple-50 border-2 border-purple-200'
                        }`}>
                        <p className={`font-bold mb-3 flex items-center gap-2 ${isFullscreen ? 'text-purple-300' : 'text-purple-700'}`}>
                          <ClipboardCheck className="w-5 h-5" />标记全班掌握情况
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {masteryOptions.map(opt => {
                            const active = currentQuestionRecord?.mastery === opt.id
                            return (
                              <button key={opt.id} onClick={() => markMastery(opt.id)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl font-medium text-white transition-all shadow ${
                                  active ? opt.bg + ' ring-4 ring-offset-2 ring-offset-purple-50 ring-purple-300' : opt.bg
                                }`}>
                                {opt.icon}
                                <span>{opt.label}</span>
                                <span className="text-xs opacity-80">{opt.desc}</span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showStartSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />开始课堂记录
              </h3>
              <p className="text-sm text-gray-500 mb-3">给本次课堂起个名字，方便之后回顾。</p>
              <input value={sessionName} onChange={e => setSessionName(e.target.value)}
                placeholder={`课堂记录 ${new Date().toLocaleDateString('zh-CN')}`}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none mb-5" />
              <div className="flex gap-2">
                <button onClick={() => { setShowStartSession(false); setSessionName('') }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  取消
                </button>
                <button onClick={startNewSession}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                  开始记录
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (currentSession || userData.classSessions.length > 0) && (() => {
          const session = currentSession ?? userData.classSessions[userData.classSessions.length - 1]
          if (!session) return null
          const stats = (() => {
            const recs = session.records
            const counts = { mastered: 0, partial: 0, weak: 0 }
            const byMap = new Map<MapType, { mastered: number; partial: number; weak: number; total: number }>()
            const byType = new Map<QuestionType, { mastered: number; partial: number; weak: number; total: number }>()
            let totalTime = 0
            recs.forEach(r => {
              counts[r.mastery]++; totalTime += r.timeUsed
              if (!byMap.has(r.mapType)) byMap.set(r.mapType, { mastered: 0, partial: 0, weak: 0, total: 0 })
              const m = byMap.get(r.mapType)!; m[r.mastery]++; m.total++
              if (!byType.has(r.questionType)) byType.set(r.questionType, { mastered: 0, partial: 0, weak: 0, total: 0 })
              const t = byType.get(r.questionType)!; t[r.mastery]++; t.total++
            })
            return {
              counts, byMap, byType,
              masteryRate: recs.length > 0 ? Math.round((counts.mastered / recs.length) * 100) : 0,
              avgTime: recs.length > 0 ? Math.round(totalTime / recs.length) : 0,
              total: recs.length,
              weakPoints: recs.filter(r => r.mastery === 'weak'),
              partialPoints: recs.filter(r => r.mastery === 'partial'),
            }
          })()

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl my-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-7 h-7 text-primary" />课堂小结
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => exportSummary(session, stats)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors shadow">
                      <Download className="w-5 h-5" />导出
                    </button>
                    <button onClick={() => setShowSummary(false)}
                      className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                      <XCircle className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-accent-blue rounded-2xl p-5 text-white mb-5">
                  <p className="text-white/80 text-sm mb-1">{session.name}</p>
                  <p className="text-white/60 text-xs mb-4">
                    {new Date(session.startedAt).toLocaleString('zh-CN')}
                    {session.endedAt ? ` — ${new Date(session.endedAt).toLocaleTimeString('zh-CN')}` : ''}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm text-center">
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-white/80">题目总数</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm text-center">
                      <p className="text-2xl font-bold">{stats.masteryRate}%</p>
                      <p className="text-xs text-white/80">整体掌握率</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm text-center">
                      <p className="text-2xl font-bold">{stats.avgTime}s</p>
                      <p className="text-xs text-white/80">平均用时</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm text-center">
                      <p className="text-2xl font-bold">{stats.counts.weak}</p>
                      <p className="text-xs text-white/80">薄弱题数</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 text-center">
                    <CheckCircle className="w-7 h-7 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">{stats.counts.mastered}</p>
                    <p className="text-xs text-green-600">全班掌握</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-center">
                    <MinusCircle className="w-7 h-7 mx-auto mb-1 text-yellow-500" />
                    <p className="text-2xl font-bold text-yellow-600">{stats.counts.partial}</p>
                    <p className="text-xs text-yellow-600">部分掌握</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-center">
                    <XCircle className="w-7 h-7 mx-auto mb-1 text-red-500" />
                    <p className="text-2xl font-bold text-red-500">{stats.counts.weak}</p>
                    <p className="text-xs text-red-500">普遍薄弱</p>
                  </div>
                </div>

                {stats.byMap.size > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" />各地图表现
                    </h4>
                    <div className="space-y-2">
                      {Array.from(stats.byMap.entries()).map(([k, v]) => {
                        const rate = v.total > 0 ? Math.round((v.mastered / v.total) * 100) : 0
                        return (
                          <div key={k} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-medium text-gray-700">
                                {mapTypes.find(m => m.id === k)?.icon} {mapTypeLabel[k]}
                              </span>
                              <span className={`text-sm font-bold ${rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {rate}% · {v.total}题
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                style={{ width: `${rate}%` }} />
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                              <span>掌握 {v.mastered}</span>
                              <span>部分 {v.partial}</span>
                              <span>薄弱 {v.weak}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {stats.weakPoints.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />🔴 需要重点复习（普遍薄弱）
                    </h4>
                    <div className="space-y-2">
                      {stats.weakPoints.map((r, i) => (
                        <div key={r.questionId} className="p-3 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-red-500">{i + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{r.prompt}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {mapTypeLabel[r.mapType]} · {typeLabel[r.questionType]} · 用时 {r.timeUsed}s
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.partialPoints.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-yellow-600 mb-2 flex items-center gap-1">
                      <MinusCircle className="w-4 h-4" />🟡 需要巩固（部分掌握）
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stats.partialPoints.map((r, i) => (
                        <div key={r.questionId} className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-yellow-600">{i + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{r.prompt}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {mapTypeLabel[r.mapType]} · {typeLabel[r.questionType]} · 用时 {r.timeUsed}s
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => setShowSummary(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    关闭
                  </button>
                  <button onClick={() => exportSummary(session, stats)}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Download className="w-5 h-5" />导出小结
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

export default TeacherPage
