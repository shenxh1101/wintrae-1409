import { create } from 'zustand'
import type { Question, Difficulty, MapType, QuestionType, PracticeMode, ClassroomTask, QuestionAnswerDetail } from '../types'
import { getRandomQuestions, getRandomQuestionsMultiMap } from '../data'

export interface AnswerRecord {
  questionId: string
  isCorrect: boolean
  selectedAnswer: string
  isTimeout: boolean
  timeUsed: number
}

interface GameStore {
  mapType: MapType
  difficulty: Difficulty
  questions: Question[]
  currentIndex: number
  score: number
  streak: number
  hintsUsed: number
  timeLeft: number
  isPlaying: boolean
  showResult: boolean
  isCorrect: boolean
  gameOver: boolean
  teacherMode: boolean
  showAnswer: boolean
  zoom: number
  selectedRegion: string | null
  answerHistory: AnswerRecord[]
  bestStreakInGame: number
  hasAnsweredCurrent: boolean
  practiceMode: PracticeMode
  focusTypes: QuestionType[]
  questionStartTime: number
  taskInfo?: ClassroomTask
  
  startGame: (mapType: MapType, difficulty: Difficulty, count?: number, focusTypes?: QuestionType[]) => void
  startCustomGame: (questions: Question[], difficulty?: Difficulty, mode?: PracticeMode) => void
  startTaskGame: (task: ClassroomTask) => void
  selectAnswer: (targetId: string) => boolean
  handleTimeout: () => void
  useHint: () => string | null
  nextQuestion: () => void
  setTimeLeft: (time: number) => void
  endGame: () => void
  resetGame: () => void
  
  setTeacherMode: (enabled: boolean) => void
  toggleShowAnswer: () => void
  setZoom: (zoom: number) => void
  setSelectedRegion: (id: string | null) => void
  randomQuestion: (mapType?: MapType) => void
  getAnswerDetails: () => QuestionAnswerDetail[]
}

const DIFFICULTY_TIME: Record<Difficulty, number> = {
  easy: 60,
  medium: 45,
  hard: 30,
}

export const useGameStore = create<GameStore>((set, get) => ({
  mapType: 'china',
  difficulty: 'easy',
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  hintsUsed: 0,
  timeLeft: 60,
  isPlaying: false,
  showResult: false,
  isCorrect: false,
  gameOver: false,
  teacherMode: false,
  showAnswer: false,
  zoom: 1,
  selectedRegion: null,
  answerHistory: [],
  bestStreakInGame: 0,
  hasAnsweredCurrent: false,
  practiceMode: 'mixed',
  focusTypes: [],
  questionStartTime: Date.now(),
  
  startGame: (mapType, difficulty, count = 10, focusTypes = []) => {
    const questions = getRandomQuestions(mapType, difficulty, count, focusTypes.length > 0 ? focusTypes : undefined)
    set({
      mapType,
      difficulty,
      questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      hintsUsed: 0,
      timeLeft: DIFFICULTY_TIME[difficulty],
      isPlaying: true,
      showResult: false,
      isCorrect: false,
      gameOver: false,
      selectedRegion: null,
      answerHistory: [],
      bestStreakInGame: 0,
      hasAnsweredCurrent: false,
      practiceMode: 'mixed',
      focusTypes,
      questionStartTime: Date.now(),
      taskInfo: undefined,
    })
  },

  startCustomGame: (questions, difficulty = 'easy', mode = 'mixed') => {
    set({
      mapType: questions[0]?.mapType ?? 'china',
      difficulty,
      questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      hintsUsed: 0,
      timeLeft: DIFFICULTY_TIME[difficulty],
      isPlaying: true,
      showResult: false,
      isCorrect: false,
      gameOver: false,
      selectedRegion: null,
      answerHistory: [],
      bestStreakInGame: 0,
      hasAnsweredCurrent: false,
      practiceMode: mode,
      focusTypes: [],
      questionStartTime: Date.now(),
      taskInfo: undefined,
    })
  },

  startTaskGame: (task) => {
    const questions = getRandomQuestionsMultiMap(
      task.mapTypes,
      task.difficulty,
      task.questionCount,
      task.focusTypes.length > 0 ? task.focusTypes : undefined
    )
    const perQTime = task.timePerQuestion > 0 ? task.timePerQuestion : DIFFICULTY_TIME[task.difficulty]
    set({
      mapType: questions[0]?.mapType ?? task.mapTypes[0] ?? 'china',
      difficulty: task.difficulty,
      questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      hintsUsed: 0,
      timeLeft: perQTime,
      isPlaying: true,
      showResult: false,
      isCorrect: false,
      gameOver: false,
      selectedRegion: null,
      answerHistory: [],
      bestStreakInGame: 0,
      hasAnsweredCurrent: false,
      practiceMode: 'task',
      focusTypes: task.focusTypes,
      questionStartTime: Date.now(),
      taskInfo: task,
    })
  },
  
  selectAnswer: (targetId) => {
    const state = get()
    const currentQuestion = state.questions[state.currentIndex]
    if (!currentQuestion || state.hasAnsweredCurrent) return false
    
    const timeUsed = Math.max(1, Math.round((Date.now() - state.questionStartTime) / 1000))
    const isCorrect = targetId === currentQuestion.targetId
    const newStreak = isCorrect ? state.streak + 1 : 0
    
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswer: targetId,
      isTimeout: false,
      timeUsed,
    }
    
    set({
      showResult: true,
      isCorrect,
      selectedRegion: targetId,
      score: isCorrect ? state.score + 10 + state.streak * 2 : state.score,
      streak: newStreak,
      bestStreakInGame: Math.max(state.bestStreakInGame, newStreak),
      answerHistory: [...state.answerHistory, record],
      hasAnsweredCurrent: true,
    })
    
    return isCorrect
  },
  
  handleTimeout: () => {
    const state = get()
    const currentQuestion = state.questions[state.currentIndex]
    if (!currentQuestion || state.hasAnsweredCurrent) return
    
    const timeUsed = Math.max(1, Math.round((Date.now() - state.questionStartTime) / 1000))
    
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      isCorrect: false,
      selectedAnswer: 'timeout',
      isTimeout: true,
      timeUsed,
    }
    
    set({
      showResult: true,
      isCorrect: false,
      selectedRegion: 'timeout',
      streak: 0,
      answerHistory: [...state.answerHistory, record],
      hasAnsweredCurrent: true,
    })
  },
  
  useHint: () => {
    const state = get()
    const currentQuestion = state.questions[state.currentIndex]
    if (!currentQuestion || state.hintsUsed >= 3) return null
    
    const hint = currentQuestion.hints[state.hintsUsed]
    set({ hintsUsed: state.hintsUsed + 1 })
    return hint
  },
  
  nextQuestion: () => {
    const state = get()
    const nextIndex = state.currentIndex + 1
    
    if (nextIndex >= state.questions.length) {
      set({ gameOver: true, isPlaying: false, showResult: false })
      return
    }
    
    const nextQuestion = state.questions[nextIndex]
    const perQTime = state.taskInfo?.timePerQuestion
      ? state.taskInfo.timePerQuestion
      : DIFFICULTY_TIME[state.difficulty]
    
    set({
      currentIndex: nextIndex,
      mapType: nextQuestion.mapType,
      showResult: false,
      isCorrect: false,
      hintsUsed: 0,
      timeLeft: perQTime,
      selectedRegion: null,
      hasAnsweredCurrent: false,
      questionStartTime: Date.now(),
    })
  },
  
  setTimeLeft: (time) => set({ timeLeft: time }),
  
  endGame: () => set({ gameOver: true, isPlaying: false, showResult: false }),
  
  resetGame: () => set({
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    hintsUsed: 0,
    timeLeft: 60,
    isPlaying: false,
    showResult: false,
    isCorrect: false,
    gameOver: false,
    selectedRegion: null,
    answerHistory: [],
    bestStreakInGame: 0,
    hasAnsweredCurrent: false,
    practiceMode: 'mixed',
    focusTypes: [],
    questionStartTime: Date.now(),
    taskInfo: undefined,
  }),
  
  setTeacherMode: (enabled) => set({ teacherMode: enabled, showAnswer: false, zoom: 1 }),
  
  toggleShowAnswer: () => set((state) => ({ showAnswer: !state.showAnswer })),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  
  setSelectedRegion: (id) => set({ selectedRegion: id }),
  
  randomQuestion: (mapType) => {
    const type = mapType || get().mapType
    const questions = getRandomQuestions(type, 'easy', 1)
    if (questions.length > 0) {
      set({
        mapType: type,
        questions,
        currentIndex: 0,
        showResult: false,
        isCorrect: false,
        selectedRegion: null,
      })
    }
  },

  getAnswerDetails: () => {
    const state = get()
    return state.answerHistory.map(rec => {
      const q = state.questions.find(qq => qq.id === rec.questionId)
      return {
        questionId: rec.questionId,
        question: q!,
        isCorrect: rec.isCorrect,
        selectedAnswer: rec.selectedAnswer,
        isTimeout: rec.isTimeout,
        timeUsed: rec.timeUsed,
      } as QuestionAnswerDetail
    }).filter(d => d.question)
  },
}))

export default useGameStore
