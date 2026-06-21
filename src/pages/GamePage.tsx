import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Clock, Star, Trophy, Home, RotateCcw, ChevronRight, Target, TrendingDown, CheckCircle2, ClipboardList, XCircle, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import type { MapType, Difficulty, WrongQuestion, QuestionType, PracticeMode, TaskResult, QuestionAnswerDetail } from '../types'

const DIFFICULTY_TIME: Record<Difficulty, number> = { easy: 60, medium: 45, hard: 30 }

const TYPE_LABELS: Record<QuestionType, string> = {
  province: '省份题', city: '城市题', river: '河流题', direction: '方位题',
  continent: '大洲大洋题', latitude: '纬线题', longitude: '经线题', building: '校园建筑题',
}

const MAP_LABELS: Record<MapType, { name: string; icon: string }> = {
  china: { name: '中国地图', icon: '🇨🇳' }, world: { name: '世界大洲', icon: '🌍' },
  grid: { name: '经纬度', icon: '🧭' }, campus: { name: '校园', icon: '🏫' },
}

const GamePage: React.FC = () => {
  const { mapType: paramMapType = 'china' } = useParams<{ mapType: MapType }>()
  const [searchParams] = useSearchParams()
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'easy'
  const navigate = useNavigate()

  const {
    mapType: storeMapType, difficulty: storeDifficulty, questions, currentIndex, score, streak, hintsUsed,
    timeLeft, isPlaying, showResult, isCorrect, gameOver, selectedRegion, answerHistory, bestStreakInGame,
    focusTypes, practiceMode, taskInfo, startGame, startCustomGame, startTaskGame, selectAnswer, useHint,
    nextQuestion, setTimeLeft, resetGame, handleTimeout: storeHandleTimeout, getAnswerDetails,
  } = useGameStore()

  const {
    addWrongQuestion, updateStats, updateBestStreak, checkNewAchievements, markWrongMastered,
    updateWrongRecord, addPlayRecord, addTaskResult, wrongQuestions,
  } = useUserStore()

  const mapType = storeMapType || paramMapType

  const [hintText, setHintText] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const wrongIdSetRef = useRef<Set<string>>(new Set())
  const achievementSetRef = useRef<Set<string>>(new Set())
  const masteredThisRoundRef = useRef<Set<string>>(new Set())
  const hasSavedResultRef = useRef(false)

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const isLastQuestion = currentIndex >= totalQuestions - 1
  const isWrongReviewMode: boolean = practiceMode === 'wrong-review'
  const isTaskMode: boolean = practiceMode === 'task'

  const perQuestionTime = useMemo(() => {
    if (taskInfo?.timePerQuestion) return taskInfo.timePerQuestion
    return DIFFICULTY_TIME[storeDifficulty || difficulty]
  }, [taskInfo, storeDifficulty, difficulty])

  useEffect(() => {
    if (!isPlaying && !gameOver && questions.length === 0) {
      startGame(paramMapType, difficulty, 10, [])
    }
    wrongIdSetRef.current = new Set()
    achievementSetRef.current = new Set()
    masteredThisRoundRef.current = new Set()
    hasSavedResultRef.current = false
  }, [paramMapType, difficulty])

  useEffect(() => {
    if (gameOver && !hasSavedResultRef.current && answerHistory.length > 0) {
      hasSavedResultRef.current = true
      const answeredCount = answerHistory.length
      const correctCount = answerHistory.filter(r => r.isCorrect).length
      addPlayRecord({
        date: new Date().toISOString().split('T')[0],
        mapType: paramMapType,
        difficulty,
        score,
        correctCount,
        totalCount: answeredCount,
        avgTime: 0,
      })

      if (isTaskMode && taskInfo) {
        const details = getAnswerDetails()
        const avgT = details.length > 0 ? details.reduce((s, d) => s + d.timeUsed, 0) / details.length : 0
        const result: TaskResult = {
          taskId: taskInfo.id,
          taskName: taskInfo.name,
          completedAt: Date.now(),
          details,
          completionRate: correctCount / Math.max(1, answeredCount),
          avgTime: avgT,
          correctCount,
          totalCount: answeredCount,
        }
        addTaskResult(result)
      }
    }
  }, [gameOver])

  useEffect(() => {
    if (!isPlaying || showResult || gameOver) return
    const timer = setInterval(() => { setTimeLeft(Math.max(0, timeLeft - 1)) }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, showResult, gameOver, timeLeft, setTimeLeft])

  useEffect(() => {
    if (timeLeft === 0 && isPlaying && !showResult) { doHandleTimeout() }
  }, [timeLeft, isPlaying, showResult])

  const doHandleTimeout = () => {
    storeHandleTimeout()
    const timeUsed = perQuestionTime
    updateStats(false, timeUsed)

    if (currentQuestion) {
      const key = currentQuestion.id
      if (!wrongIdSetRef.current.has(key)) {
        wrongIdSetRef.current.add(key)
        if (isWrongReviewMode) {
          updateWrongRecord(currentQuestion.id, 'timeout')
        } else {
          const wrongQ: WrongQuestion = {
            id: `wrong-${Date.now()}-${Math.random()}`, questionId: currentQuestion.id, question: currentQuestion,
            wrongAnswer: 'timeout', timestamp: Date.now(), reviewed: false, mastered: false, wrongCount: 1, lastWrongAnswer: 'timeout',
          }
          addWrongQuestion(wrongQ)
        }
      }
    }

    updateBestStreak(0)
    const ach = checkNewAchievements(0).filter(a => !achievementSetRef.current.has(a))
    if (ach.length > 0) { ach.forEach(a => achievementSetRef.current.add(a)); setNewAchievements(prev => [...prev, ...ach]) }
    setShowConfetti(false)
  }

  const handleRegionClick = useCallback((regionId: string) => {
    if (showResult || gameOver || !isPlaying) return
    const correct = selectAnswer(regionId)
    const timeUsed = Math.max(1, perQuestionTime - timeLeft)
    updateStats(correct, timeUsed)

    if (correct) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1500)
      const newStreak = streak + 1
      updateBestStreak(newStreak)
      if (isWrongReviewMode && currentQuestion && !masteredThisRoundRef.current.has(currentQuestion.id)) {
        masteredThisRoundRef.current.add(currentQuestion.id)
        markWrongMastered(currentQuestion.id, true)
      }
      const ach = checkNewAchievements(newStreak).filter(a => !achievementSetRef.current.has(a))
      if (ach.length > 0) { ach.forEach(a => achievementSetRef.current.add(a)); setNewAchievements(prev => [...prev, ...ach]) }
    } else {
      if (currentQuestion) {
        const key = currentQuestion.id
        if (!wrongIdSetRef.current.has(key)) {
          wrongIdSetRef.current.add(key)
          if (isWrongReviewMode) {
            updateWrongRecord(currentQuestion.id, regionId)
          } else {
            const wrongQ: WrongQuestion = {
              id: `wrong-${Date.now()}-${Math.random()}`, questionId: currentQuestion.id, question: currentQuestion,
              wrongAnswer: regionId, timestamp: Date.now(), reviewed: false, mastered: false, wrongCount: 1, lastWrongAnswer: regionId,
            }
            addWrongQuestion(wrongQ)
          }
        }
      }
      updateBestStreak(0)
      const ach = checkNewAchievements(0).filter(a => !achievementSetRef.current.has(a))
      if (ach.length > 0) { ach.forEach(a => achievementSetRef.current.add(a)); setNewAchievements(prev => [...prev, ...ach]) }
    }
  }, [showResult, gameOver, isPlaying, selectAnswer, timeLeft, perQuestionTime, streak, currentQuestion, updateStats, addWrongQuestion, updateBestStreak, checkNewAchievements, isWrongReviewMode, markWrongMastered, updateWrongRecord])

  const handleUseHint = () => { const hint = useHint(); setHintText(hint) }
  const handleNextQuestion = () => { setHintText(null); nextQuestion() }

  const handleRestart = () => {
    wrongIdSetRef.current = new Set()
    achievementSetRef.current = new Set()
    masteredThisRoundRef.current = new Set()
    hasSavedResultRef.current = false
    setHintText(null)
    setNewAchievements([])

    if (isTaskMode && taskInfo) {
      startTaskGame(taskInfo)
    } else if (isWrongReviewMode) {
      const remaining = wrongQuestions.filter(w => !w.mastered).map(w => w.question)
      if (remaining.length > 0) {
        startCustomGame(remaining, storeDifficulty || difficulty, 'wrong-review')
      } else {
        startGame(paramMapType, difficulty, 10, focusTypes)
      }
    } else {
      startGame(paramMapType, difficulty, 10, focusTypes)
    }
  }

  const timePercent = useMemo(() => (timeLeft / Math.max(1, perQuestionTime)) * 100, [timeLeft, perQuestionTime])
  const timeColor = useMemo(() => timePercent > 50 ? 'bg-green-500' : timePercent > 25 ? 'bg-yellow-500' : 'bg-red-500', [timePercent])

  const perTypeStats = useMemo(() => {
    const map = new Map<QuestionType, { correct: number; total: number }>()
    answerHistory.forEach(rec => {
      const q = questions.find(q => q.id === rec.questionId)
      if (!q) return
      const prev = map.get(q.type) ?? { correct: 0, total: 0 }
      map.set(q.type, { correct: prev.correct + (rec.isCorrect ? 1 : 0), total: prev.total + 1 })
    })
    return Array.from(map.entries())
      .map(([type, v]) => ({ type, label: TYPE_LABELS[type] ?? type, correct: v.correct, total: v.total, accuracy: Math.round((v.correct / v.total) * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy)
  }, [answerHistory, questions])

  const weakPoints = useMemo(() => perTypeStats.filter(s => s.accuracy < 70 && s.total >= 1), [perTypeStats])

  const finalStats = useMemo(() => {
    const answeredCount = answerHistory.length
    const correctCount = answerHistory.filter(r => r.isCorrect).length
    const bestStreak = bestStreakInGame
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
    const avgTime = answerHistory.length > 0
      ? answerHistory.reduce((s, r) => s + (r.timeUsed || 0), 0) / answerHistory.length
      : 0
    return { answeredCount, correctCount, bestStreak, accuracy, avgTime }
  }, [answerHistory, bestStreakInGame])

  const taskAnswerDetails: QuestionAnswerDetail[] = useMemo(() => isTaskMode ? getAnswerDetails() : [], [isTaskMode, getAnswerDetails])

  const confettiPieces = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FCE38A', '#95E1D3', '#DDA0DD', '#FFD93D']
    return Array.from({ length: 30 }, (_, i) => ({
      id: i, color: colors[Math.floor(Math.random() * colors.length)], left: Math.random() * 100,
      delay: Math.random() * 0.5, duration: 2 + Math.random() * 2,
    }))
  }, [showConfetti])

  if (gameOver) {
    const { correctCount, bestStreak, accuracy, answeredCount, avgTime } = finalStats
    const masteredCount = masteredThisRoundRef.current.size

    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {isTaskMode ? '课堂任务完成！' : isWrongReviewMode ? '错题挑战完成！' : (focusTypes.length > 0 ? '专项训练完成！' : '挑战完成！')}
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            {isTaskMode && taskInfo
              ? `任务「${taskInfo.name}」已完成，下面是本次任务表现`
              : isWrongReviewMode
                ? `本次掌握 ${masteredCount} 道错题，继续加油！`
                : focusTypes.length > 0
                  ? `你完成了${focusTypes.map(t => TYPE_LABELS[t]).join('、')}专项训练！`
                  : '太棒了，你完成了本轮挑战！'}
          </p>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mb-6`}>
            <div className="bg-blue-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{score}</p><p className="text-xs text-gray-500">总得分</p></div>
            <div className="bg-green-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{accuracy}%</p><p className="text-xs text-gray-500">正确率</p></div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-orange-600">{correctCount}/{answeredCount || totalQuestions}</p><p className="text-xs text-gray-500">答对题数</p></div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-purple-600">{avgTime.toFixed(1)}s</p><p className="text-xs text-gray-500">平均用时</p></div>
          </div>

          {isTaskMode && taskAnswerDetails.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border border-orange-100">
              <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-orange-500" />每题答题详情
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {taskAnswerDetails.map((d, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${d.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: d.isCorrect ? '#22c55e' : '#ef4444' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                        <span>{MAP_LABELS[d.question.mapType].icon}</span>
                        <span>{MAP_LABELS[d.question.mapType].name}</span>
                        <span>·</span>
                        <span>{TYPE_LABELS[d.question.type]}</span>
                        <span>·</span>
                        <span>{d.timeUsed}s</span>
                      </div>
                      <p className="text-gray-800 font-medium truncate">{d.question.prompt}</p>
                    </div>
                    {d.isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : <div className="flex-shrink-0 flex items-center gap-1 text-red-600 text-xs font-medium">
                          <XCircle className="w-5 h-5" />
                          {d.isTimeout ? '超时' : '错'}
                        </div>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {perTypeStats.length > 1 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl text-left">
              <p className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-primary" />各题型表现</p>
              <div className="space-y-2">
                {perTypeStats.map(s => (
                  <div key={s.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{s.label}</span>
                      <span className={s.accuracy >= 70 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{s.correct}/{s.total} · {s.accuracy}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.accuracy >= 70 ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${s.accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weakPoints.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl text-left border border-red-100">
              <p className="font-bold text-red-700 mb-2 flex items-center gap-2"><TrendingDown className="w-5 h-5" />薄弱题型（需要加强）</p>
              <div className="flex flex-wrap gap-2">
                {weakPoints.map(w => (
                  <span key={w.type} className="px-3 py-1 bg-white rounded-full text-sm text-red-600 border border-red-200 font-medium">
                    {w.label} {w.accuracy}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {isWrongReviewMode && masteredCount > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-2xl text-left border border-green-100">
              <p className="font-bold text-green-700 mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />本轮已掌握错题（{masteredCount} 道）</p>
              <p className="text-sm text-green-600">已自动从错题本标记为掌握，下次挑战不会再出现</p>
            </div>
          )}

          {newAchievements.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-2xl text-center">
              <p className="font-bold text-yellow-800 mb-2">🎉 解锁新成就！</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {newAchievements.map(id => <span key={id} className="px-3 py-1 bg-yellow-200 rounded-full text-sm font-medium">{id}</span>)}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={handleRestart} className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              {isTaskMode ? '再做一次任务' : isWrongReviewMode ? '再练一轮错题' : focusTypes.length > 0 ? '再来一次专项' : '再来一局'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/review')} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                查看错题本
              </button>
              <button onClick={() => { resetGame(); navigate('/') }} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />返回首页
              </button>
            </div>
          </div>
        </motion.div>

        {showConfetti && confettiPieces.map(piece => (
          <div key={piece.id} className="confetti-piece" style={{ left: `${piece.left}%`, top: '-20px', backgroundColor: piece.color, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s` }} />
        ))}
      </div>
    )
  }

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">加载中...</p></div>
  }

  const displaySelectedId = selectedRegion === 'timeout' ? null : selectedRegion
  const modeBadge = isTaskMode
    ? { text: taskInfo?.name || '课堂任务', cls: 'bg-orange-100 text-orange-700' }
    : isWrongReviewMode
      ? { text: '错题重练', cls: 'bg-red-100 text-red-700' }
      : focusTypes.length > 0
        ? { text: focusTypes.map(t => TYPE_LABELS[t]).join('+'), cls: 'bg-indigo-100 text-indigo-700' }
        : null

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { resetGame(); navigate('/') }} className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            {modeBadge && <span className={`px-3 py-1 text-sm font-bold rounded-full ${modeBadge.cls}`}>{modeBadge.text}</span>}
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
              <span>{MAP_LABELS[mapType].icon}</span>{MAP_LABELS[mapType].name}
            </span>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-gray-800">{score}</span>
            </div>
            {streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-xl shadow-md">
                <span className="font-bold">{streak} 连对!</span><span className="text-xl">🔥</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timePercent <= 25 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
              <span className={`font-bold ${timePercent <= 25 ? 'text-red-500' : 'text-gray-700'}`}>{timeLeft}秒</span>
            </div>
            <span className="text-sm text-gray-500">第 {currentIndex + 1} / {totalQuestions} 题</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div className={`h-full ${timeColor} rounded-full`} key={`${currentIndex}-bar`} initial={{ width: '100%' }} animate={{ width: `${timePercent}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 mb-4">
          <div className="relative aspect-[4/3] md:aspect-video bg-gray-50 rounded-2xl overflow-hidden">
            <MapComponent
              mapType={mapType}
              selectedId={displaySelectedId}
              highlightId={showResult && !isCorrect ? currentQuestion.targetId : null}
              showAnswer={showResult}
              answerId={currentQuestion.targetId}
              onRegionClick={handleRegionClick}
            />

            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ${isCorrect ? 'bg-green-500' : (selectedRegion === 'timeout' ? 'bg-gray-500' : 'bg-red-500')}`}>
                    <span className="text-5xl">{isCorrect ? '✓' : (selectedRegion === 'timeout' ? '⏱' : '✗')}</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div className={`bg-white rounded-3xl shadow-xl p-6 ${showResult && !isCorrect ? 'shake' : ''}`} key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {TYPE_LABELS[currentQuestion.type] ?? currentQuestion.type}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full flex items-center gap-1">
                  <span>{MAP_LABELS[currentQuestion.mapType].icon}</span>{MAP_LABELS[currentQuestion.mapType].name}
                </span>
                {isWrongReviewMode && <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">错题重练</span>}
                {isTaskMode && <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full flex items-center gap-1"><ClipboardList className="w-4 h-4" />课堂任务</span>}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{currentQuestion.prompt}</h3>
            </div>
          </div>

          {hintText && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700"><Lightbulb className="w-5 h-5" /><span className="font-medium">提示 {hintsUsed}/3</span></div>
              <p className="mt-2 text-yellow-800">{hintText}</p>
            </motion.div>
          )}

          {showResult && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className={`mb-4 p-4 rounded-2xl ${isCorrect ? 'bg-green-50 border-2 border-green-200' : selectedRegion === 'timeout' ? 'bg-gray-50 border-2 border-gray-200' : 'bg-blue-50 border-2 border-blue-200'}`}>
              <p className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : selectedRegion === 'timeout' ? 'text-gray-700' : 'text-blue-700'}`}>
                {isCorrect
                  ? (isWrongReviewMode ? '🎉 已掌握！从错题本移除标记' : '🎉 回答正确！')
                  : selectedRegion === 'timeout' ? '⏱ 时间到！' : '💡 知识讲解'}
              </p>
              <p className={`${isCorrect ? 'text-green-600' : selectedRegion === 'timeout' ? 'text-gray-600' : 'text-blue-600'}`}>{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="flex gap-3">
            {!showResult && (
              <button onClick={handleUseHint} disabled={hintsUsed >= 3}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${hintsUsed >= 3 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                <Lightbulb className="w-5 h-5" />提示 ({3 - hintsUsed})
              </button>
            )}
            {showResult && (
              <button onClick={handleNextQuestion} className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                {isLastQuestion ? '查看成绩' : '下一题'}<ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {showConfetti && confettiPieces.map(piece => (
        <div key={piece.id} className="confetti-piece" style={{ left: `${piece.left}%`, top: '-20px', backgroundColor: piece.color, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s` }} />
      ))}
    </div>
  )
}

export default GamePage
