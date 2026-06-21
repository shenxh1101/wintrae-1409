import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Clock, Star, Trophy, Home, RotateCcw, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import type { MapType, Difficulty, WrongQuestion } from '../types'

const DIFFICULTY_TIME: Record<Difficulty, number> = {
  easy: 60,
  medium: 45,
  hard: 30,
}

const GamePage: React.FC = () => {
  const { mapType = 'china' } = useParams<{ mapType: MapType }>()
  const [searchParams] = useSearchParams()
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'easy'
  const navigate = useNavigate()
  
  const {
    questions,
    currentIndex,
    score,
    streak,
    hintsUsed,
    timeLeft,
    isPlaying,
    showResult,
    isCorrect,
    gameOver,
    selectedRegion,
    startGame,
    selectAnswer,
    useHint,
    nextQuestion,
    setTimeLeft,
    resetGame,
  } = useGameStore()
  
  const { addWrongQuestion, updateStats, updateBestStreak, checkNewAchievements } = useUserStore()
  
  const [hintText, setHintText] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [newAchievements, setNewAchievements] = useState<string[]>([])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const isLastQuestion = currentIndex >= totalQuestions - 1

  useEffect(() => {
    startGame(mapType, difficulty, 10)
    return () => {
      resetGame()
    }
  }, [mapType, difficulty])

  useEffect(() => {
    if (!isPlaying || showResult || gameOver) return
    
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isPlaying, showResult, gameOver, timeLeft, setTimeLeft])

  useEffect(() => {
    if (timeLeft === 0 && isPlaying && !showResult) {
      handleTimeout()
    }
  }, [timeLeft, isPlaying, showResult])

  const handleTimeout = () => {
    const timeUsed = DIFFICULTY_TIME[difficulty]
    updateStats(false, timeUsed)
    
    if (currentQuestion) {
      const wrongQ: WrongQuestion = {
        id: `wrong-${Date.now()}`,
        questionId: currentQuestion.id,
        question: currentQuestion,
        wrongAnswer: 'timeout',
        timestamp: Date.now(),
        reviewed: false,
      }
      addWrongQuestion(wrongQ)
    }
    
    updateBestStreak(0)
    const achievements = checkNewAchievements(0)
    if (achievements.length > 0) {
      setNewAchievements(achievements)
    }
    
    setShowConfetti(false)
  }

  const handleRegionClick = useCallback((regionId: string) => {
    if (showResult || gameOver || !isPlaying) return
    
    const correct = selectAnswer(regionId)
    const timeUsed = DIFFICULTY_TIME[difficulty] - timeLeft
    
    updateStats(correct, timeUsed)
    
    if (correct) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1500)
      
      const newStreak = streak + 1
      updateBestStreak(newStreak)
      
      const achievements = checkNewAchievements(newStreak)
      if (achievements.length > 0) {
        setNewAchievements(achievements)
      }
    } else {
      if (currentQuestion) {
        const wrongQ: WrongQuestion = {
          id: `wrong-${Date.now()}`,
          questionId: currentQuestion.id,
          question: currentQuestion,
          wrongAnswer: regionId,
          timestamp: Date.now(),
          reviewed: false,
        }
        addWrongQuestion(wrongQ)
      }
      updateBestStreak(0)
      const achievements = checkNewAchievements(0)
      if (achievements.length > 0) {
        setNewAchievements(achievements)
      }
    }
    
    setStartTime(Date.now())
  }, [showResult, gameOver, isPlaying, selectAnswer, timeLeft, difficulty, streak, currentQuestion, updateStats, addWrongQuestion, updateBestStreak, checkNewAchievements])

  const handleUseHint = () => {
    const hint = useHint()
    setHintText(hint)
  }

  const handleNextQuestion = () => {
    setHintText(null)
    nextQuestion()
    setStartTime(Date.now())
  }

  const handleRestart = () => {
    startGame(mapType, difficulty, 10)
    setHintText(null)
    setNewAchievements([])
    setStartTime(Date.now())
  }

  const timePercent = useMemo(() => {
    const total = DIFFICULTY_TIME[difficulty]
    return (timeLeft / total) * 100
  }, [timeLeft, difficulty])

  const timeColor = useMemo(() => {
    if (timePercent > 50) return 'bg-green-500'
    if (timePercent > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }, [timePercent])

  const confettiPieces = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FCE38A', '#95E1D3', '#DDA0DD', '#FFD93D']
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }))
  }, [showConfetti])

  if (gameOver) {
    const correctCount = questions.filter((_, i) => {
      return i < currentIndex || (i === currentIndex && showResult && isCorrect)
    }).length
    
    const actualCorrect = score > 0 ? Math.floor(score / 10) - Math.floor((streak > 0 ? streak - 1 : 0) * streak / 2) : 0
    
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">挑战完成！</h2>
          <p className="text-gray-500 mb-6">太棒了，你完成了本轮挑战！</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-blue-600">{score}</p>
              <p className="text-sm text-gray-500">总得分</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-green-600">
                {Math.round((correctCount / totalQuestions) * 100)}%
              </p>
              <p className="text-sm text-gray-500">正确率</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-orange-600">{correctCount}/{totalQuestions}</p>
              <p className="text-sm text-gray-500">答对题数</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-purple-600">{useUserStore.getState().bestStreak}</p>
              <p className="text-sm text-gray-500">最佳连对</p>
            </div>
          </div>
          
          {newAchievements.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-2xl">
              <p className="font-bold text-yellow-800 mb-2">🎉 解锁新成就！</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {newAchievements.map(id => (
                  <span key={id} className="px-3 py-1 bg-yellow-200 rounded-full text-sm font-medium">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              再来一局
            </button>
            <button
              onClick={() => navigate('/review')}
              className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              查看错题
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              返回首页
            </button>
          </div>
        </motion.div>
        
        {showConfetti && confettiPieces.map(piece => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              top: '-20px',
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-gray-800">{score}</span>
            </div>
            
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-xl shadow-md"
              >
                <span className="font-bold">{streak} 连对!</span>
                <span className="text-xl">🔥</span>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timePercent <= 25 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
              <span className={`font-bold ${timePercent <= 25 ? 'text-red-500' : 'text-gray-700'}`}>
                {timeLeft}秒
              </span>
            </div>
            <span className="text-sm text-gray-500">
              第 {currentIndex + 1} / {totalQuestions} 题
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timeColor} rounded-full`}
              initial={{ width: '100%' }}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 mb-4">
          <div className="relative aspect-[4/3] md:aspect-video bg-gray-50 rounded-2xl overflow-hidden">
            <MapComponent
              mapType={mapType}
              selectedId={selectedRegion}
              highlightId={showResult && !isCorrect ? currentQuestion.targetId : null}
              showAnswer={showResult}
              answerId={currentQuestion.targetId}
              onRegionClick={handleRegionClick}
            />
            
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    <span className="text-5xl">{isCorrect ? '✓' : '✗'}</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className={`bg-white rounded-3xl shadow-xl p-6 ${showResult && !isCorrect ? 'shake' : ''}`}
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                {currentQuestion.type === 'province' && '省份题'}
                {currentQuestion.type === 'city' && '城市题'}
                {currentQuestion.type === 'river' && '河流题'}
                {currentQuestion.type === 'continent' && '大洲题'}
                {currentQuestion.type === 'direction' && '方位题'}
                {currentQuestion.type === 'latitude' && '纬线题'}
                {currentQuestion.type === 'longitude' && '经线题'}
                {currentQuestion.type === 'building' && '建筑题'}
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {currentQuestion.prompt}
              </h3>
            </div>
          </div>
          
          {hintText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200"
            >
              <div className="flex items-center gap-2 text-yellow-700">
                <Lightbulb className="w-5 h-5" />
                <span className="font-medium">提示 {hintsUsed}/3</span>
              </div>
              <p className="mt-2 text-yellow-800">{hintText}</p>
            </motion.div>
          )}
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mb-4 p-4 rounded-2xl ${
                isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'
              }`}
            >
              <p className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                {isCorrect ? '🎉 回答正确！' : '💡 知识讲解'}
              </p>
              <p className={`${isCorrect ? 'text-green-600' : 'text-blue-600'}`}>
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
          
          <div className="flex gap-3">
            {!showResult && (
              <button
                onClick={handleUseHint}
                disabled={hintsUsed >= 3}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                  hintsUsed >= 3
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                提示 ({3 - hintsUsed})
              </button>
            )}
            
            {showResult && (
              <button
                onClick={handleNextQuestion}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                {isLastQuestion ? '查看成绩' : '下一题'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </main>
      
      {showConfetti && confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export default GamePage
