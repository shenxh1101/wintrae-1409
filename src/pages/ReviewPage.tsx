import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  CheckSquare,
  Square,
  Play,
  SquareCheckBig,
  Clock,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { useUserStore } from '../store/userStore'
import { useGameStore } from '../store/gameStore'
import type { MapType, WrongQuestion, QuestionType } from '../types'

const mapTypeLabels: Record<MapType, { name: string; icon: string; color: string }> = {
  china: { name: '中国地图', icon: '🇨🇳', color: 'from-red-400 to-orange-400' },
  world: { name: '世界大洲', icon: '🌍', color: 'from-blue-400 to-cyan-400' },
  grid: { name: '经纬度网格', icon: '🧭', color: 'from-green-400 to-teal-400' },
  campus: { name: '校园平面图', icon: '🏫', color: 'from-purple-400 to-pink-400' },
}

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

const ReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    wrongQuestions,
    markWrongReviewed,
    clearWrongQuestions,
    markWrongMastered,
    removeWrongQuestion,
  } = useUserStore()
  const startCustomGame = useGameStore((s) => s.startCustomGame)

  const [activeTab, setActiveTab] = useState<MapType | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const availableWrongQuestions = useMemo(
    () => wrongQuestions.filter((q) => !q.mastered),
    [wrongQuestions]
  )

  const masteredCount = wrongQuestions.length - availableWrongQuestions.length

  const filteredQuestions = activeTab === 'all'
    ? availableWrongQuestions
    : availableWrongQuestions.filter(q => q.question.mapType === activeTab)

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const byCount = (b.wrongCount || 1) - (a.wrongCount || 1)
    return byCount !== 0 ? byCount : b.timestamp - a.timestamp
  })

  const stats = {
    total: availableWrongQuestions.length,
    reviewed: availableWrongQuestions.filter(q => q.reviewed).length,
    mastered: masteredCount,
    china: availableWrongQuestions.filter(q => q.question.mapType === 'china').length,
    world: availableWrongQuestions.filter(q => q.question.mapType === 'world').length,
    grid: availableWrongQuestions.filter(q => q.question.mapType === 'grid').length,
    campus: availableWrongQuestions.filter(q => q.question.mapType === 'campus').length,
  }

  const tabs = [
    { id: 'all' as const, name: '全部', count: stats.total },
    { id: 'china' as const, name: '中国地图', count: stats.china },
    { id: 'world' as const, name: '世界大洲', count: stats.world },
    { id: 'grid' as const, name: '经纬度', count: stats.grid },
    { id: 'campus' as const, name: '校园', count: stats.campus },
  ]

  const toggleExpand = (id: string, questionId: string) => {
    if (selectionMode) {
      toggleSelect(questionId)
      return
    }
    setExpandedId(expandedId === id ? null : id)
    const q = wrongQuestions.find(w => w.id === id)
    if (q && !q.reviewed) {
      markWrongReviewed(id)
    }
  }

  const toggleSelect = (questionId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === sortedQuestions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sortedQuestions.map(q => q.questionId)))
    }
  }

  const handleClear = () => {
    clearWrongQuestions()
    setShowClearConfirm(false)
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleChallenge = () => {
    const idsToChallenge = selectionMode
      ? selectedIds
      : new Set(sortedQuestions.map(q => q.questionId))
    if (idsToChallenge.size === 0) return

    const questions = wrongQuestions
      .filter(w => idsToChallenge.has(w.questionId) && !w.mastered)
      .map(w => w.question)

    if (questions.length === 0) return

    startCustomGame(questions, 'easy', 'wrong-review')
    navigate(`/game/${questions[0].mapType}?difficulty=easy&mode=wrong-review`)
  }

  const handleMarkAllMastered = () => {
    selectedIds.forEach(id => markWrongMastered(id, true))
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleRemoveMastered = () => {
    wrongQuestions.filter(w => w.mastered).forEach(w => removeWrongQuestion(w.questionId))
  }

  const selectedCount = selectionMode ? selectedIds.size : sortedQuestions.length

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
            <BookOpen className="w-7 h-7 text-red-500" />
            错题本
          </h1>
          
          {availableWrongQuestions.length > 0 && !selectionMode && (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectionMode(true)}
                className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-primary"
                title="选择错题"
              >
                <CheckSquare className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-red-500"
                title="清空错题"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          )}
          {selectionMode && (
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectionMode(false); setSelectedIds(new Set()) }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          )}
          {availableWrongQuestions.length === 0 && <div className="w-10" />}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-red-500">{stats.total}</p>
            <p className="text-sm text-gray-500">待复习</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.reviewed}</p>
            <p className="text-sm text-gray-500">已看过</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-green-500">{stats.mastered}</p>
            <p className="text-sm text-gray-500">已掌握</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-purple-500">
              {stats.total + stats.mastered > 0
                ? Math.round((stats.mastered / (stats.total + stats.mastered)) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">掌握率</p>
          </div>
        </div>

        {availableWrongQuestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                错题重练
              </p>
              <p className="font-bold text-gray-800">
                {selectionMode
                  ? `已选中 ${selectedCount} 道错题`
                  : `共 ${sortedQuestions.length} 道错题待复习`}
              </p>
            </div>
            {selectionMode && (
              <button
                onClick={selectAll}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 justify-center"
              >
                {selectedIds.size === sortedQuestions.length ? (
                  <><CheckSquare className="w-5 h-5" />取消全选</>
                ) : (
                  <><Square className="w-5 h-5" />全选</>
                )}
              </button>
            )}
            <button
              onClick={handleChallenge}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed justify-center"
            >
              <Play className="w-5 h-5" />
              {selectionMode ? '挑战选中错题' : '一键挑战所有错题'}
            </button>
            {selectionMode && selectedCount > 0 && (
              <button
                onClick={handleMarkAllMastered}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 justify-center border-2 border-green-200"
              >
                <CheckCircle2 className="w-5 h-5" />
                标记掌握
              </button>
            )}
            {stats.mastered > 0 && (
              <button
                onClick={handleRemoveMastered}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 justify-center text-sm"
              >
                清理已掌握
              </button>
            )}
          </div>
        )}
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.name}
              <span className={`ml-1 text-sm ${activeTab === tab.id ? 'text-white/80' : 'text-gray-400'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {sortedQuestions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">太棒了！</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' ? '你还没有错题，继续保持！' : '这个分类下没有错题'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              去练习
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedQuestions.map((wrongQ, index) => {
              const isSelected = selectedIds.has(wrongQ.questionId)
              return (
                <motion.div
                  key={wrongQ.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${
                    isSelected ? 'ring-4 ring-primary' : ''
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3"
                    onClick={() => toggleExpand(wrongQ.id, wrongQ.questionId)}
                  >
                    {selectionMode && (
                      <div className="flex-shrink-0 pt-1">
                        {isSelected ? (
                          <SquareCheckBig className="w-6 h-6 text-primary" />
                        ) : (
                          <Square className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">
                          {mapTypeLabels[wrongQ.question.mapType].icon}
                        </span>
                        <span className="text-sm text-gray-500">
                          {mapTypeLabels[wrongQ.question.mapType].name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {typeLabel[wrongQ.question.type] ?? wrongQ.question.type}
                        </span>
                        {(wrongQ.wrongCount || 1) > 1 && (
                          <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                            <TrendingDown className="w-3 h-3" />
                            错 {wrongQ.wrongCount} 次
                          </span>
                        )}
                        {wrongQ.lastWrongAnswer && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            最近: {wrongQ.lastWrongAnswer === 'timeout' ? '超时' : wrongQ.lastWrongAnswer}
                          </span>
                        )}
                        {wrongQ.reviewed && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            已复习
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 line-clamp-2">
                        {wrongQ.question.prompt}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center">
                      {expandedId === wrongQ.id ? (
                        <ChevronUp className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedId === wrongQ.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-100">
                          <div className="py-4">
                            <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden mb-4 ring-2 ring-gray-200">
                              <MapComponent
                                mapType={wrongQ.question.mapType}
                                selectedId={wrongQ.wrongAnswer === 'timeout' ? null : wrongQ.wrongAnswer}
                                highlightId={null}
                                showAnswer={true}
                                answerId={wrongQ.question.targetId}
                                onRegionClick={() => {}}
                              />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mb-4 px-1">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 rounded-sm border-4 border-red-500 bg-white" />
                                <span className="text-gray-600">你的答案</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 rounded-sm border-4 border-green-500 bg-white" />
                                <span className="text-gray-600">正确答案</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-bold text-red-700 mb-1">你的答案</p>
                                  <p className="text-red-700 font-semibold text-lg">
                                    {wrongQ.wrongAnswer === 'timeout' ? '⏱ 超时未作答' : wrongQ.wrongAnswer}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-bold text-green-700 mb-1">正确答案</p>
                                  <p className="text-green-700 font-semibold text-lg">{wrongQ.question.targetId}</p>
                                </div>
                              </div>
                              
                              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                                <p className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                                  <span className="text-xl">💡</span> 知识讲解
                                </p>
                                <p className="text-blue-700 leading-relaxed">
                                  {wrongQ.question.explanation}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markWrongMastered(wrongQ.questionId, true)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors border-2 border-green-200"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                我已掌握
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
      
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">确认清空？</h3>
              <p className="text-center text-gray-500 mb-6">
                清空后所有错题记录将被删除，且无法恢复。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  确认清空
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReviewPage
