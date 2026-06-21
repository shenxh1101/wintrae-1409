import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Trash2, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from '../maps'
import { useUserStore } from '../store/userStore'
import type { MapType, WrongQuestion } from '../types'

const mapTypeLabels: Record<MapType, { name: string; icon: string; color: string }> = {
  china: { name: '中国地图', icon: '🇨🇳', color: 'from-red-400 to-orange-400' },
  world: { name: '世界大洲', icon: '🌍', color: 'from-blue-400 to-cyan-400' },
  grid: { name: '经纬度网格', icon: '🧭', color: 'from-green-400 to-teal-400' },
  campus: { name: '校园平面图', icon: '🏫', color: 'from-purple-400 to-pink-400' },
}

const ReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { wrongQuestions, markWrongReviewed, clearWrongQuestions } = useUserStore()
  const [activeTab, setActiveTab] = useState<MapType | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const filteredQuestions = activeTab === 'all'
    ? wrongQuestions
    : wrongQuestions.filter(q => q.question.mapType === activeTab)

  const sortedQuestions = [...filteredQuestions].sort((a, b) => b.timestamp - a.timestamp)

  const stats = {
    total: wrongQuestions.length,
    reviewed: wrongQuestions.filter(q => q.reviewed).length,
    china: wrongQuestions.filter(q => q.question.mapType === 'china').length,
    world: wrongQuestions.filter(q => q.question.mapType === 'world').length,
    grid: wrongQuestions.filter(q => q.question.mapType === 'grid').length,
    campus: wrongQuestions.filter(q => q.question.mapType === 'campus').length,
  }

  const tabs = [
    { id: 'all' as const, name: '全部', count: stats.total },
    { id: 'china' as const, name: '中国地图', count: stats.china },
    { id: 'world' as const, name: '世界大洲', count: stats.world },
    { id: 'grid' as const, name: '经纬度', count: stats.grid },
    { id: 'campus' as const, name: '校园', count: stats.campus },
  ]

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
    const q = wrongQuestions.find(w => w.id === id)
    if (q && !q.reviewed) {
      markWrongReviewed(id)
    }
  }

  const handleClear = () => {
    clearWrongQuestions()
    setShowClearConfirm(false)
  }

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
          
          {wrongQuestions.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-red-500"
              title="清空错题"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
          {wrongQuestions.length === 0 && <div className="w-10" />}
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-red-500">{stats.total}</p>
            <p className="text-sm text-gray-500">总错题数</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.reviewed}</p>
            <p className="text-sm text-gray-500">已复习</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-3xl font-bold text-green-500">
              {stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500">复习率</p>
          </div>
        </div>
        
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
            {sortedQuestions.map((wrongQ, index) => (
              <motion.div
                key={wrongQ.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(wrongQ.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {mapTypeLabels[wrongQ.question.mapType].icon}
                        </span>
                        <span className="text-sm text-gray-500">
                          {mapTypeLabels[wrongQ.question.mapType].name}
                        </span>
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
                    <div className="ml-4 flex-shrink-0">
                      {expandedId === wrongQ.id ? (
                        <ChevronUp className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
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
                          <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden mb-4">
                            <MapComponent
                              mapType={wrongQ.question.mapType}
                              selectedId={wrongQ.wrongAnswer}
                              highlightId={null}
                              showAnswer={true}
                              answerId={wrongQ.question.targetId}
                              onRegionClick={() => {}}
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-700">你的答案</p>
                                <p className="text-red-600">
                                  {wrongQ.wrongAnswer === 'timeout' ? '超时未作答' : wrongQ.wrongAnswer}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-700">正确答案</p>
                                <p className="text-green-600">{wrongQ.question.targetId}</p>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-xl">
                              <p className="text-sm font-medium text-blue-700 mb-2">💡 知识讲解</p>
                              <p className="text-blue-600 leading-relaxed">
                                {wrongQ.question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
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
