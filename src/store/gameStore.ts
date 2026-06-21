import { create } from 'zustand'
import type { Question, Difficulty, MapType } from '../types'
import { getRandomQuestions } from '../data'

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
  
  startGame: (mapType: MapType, difficulty: Difficulty, count?: number) => void
  selectAnswer: (targetId: string) => boolean
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
  
  startGame: (mapType, difficulty, count = 10) => {
    const questions = getRandomQuestions(mapType, difficulty, count)
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
    })
  },
  
  selectAnswer: (targetId) => {
    const state = get()
    const currentQuestion = state.questions[state.currentIndex]
    if (!currentQuestion) return false
    
    const isCorrect = targetId === currentQuestion.targetId
    
    set({
      showResult: true,
      isCorrect,
      selectedRegion: targetId,
      score: isCorrect ? state.score + 10 + state.streak * 2 : state.score,
      streak: isCorrect ? state.streak + 1 : 0,
    })
    
    return isCorrect
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
    
    set({
      currentIndex: nextIndex,
      showResult: false,
      isCorrect: false,
      hintsUsed: 0,
      timeLeft: DIFFICULTY_TIME[state.difficulty],
      selectedRegion: null,
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
}))

export default useGameStore
