import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserData, WrongQuestion, PlayRecord, MapType, Difficulty } from '../types'
import { checkAchievements, achievements } from '../data/achievements'

interface UserStore extends UserData {
  wrongQuestions: WrongQuestion[]
  addWrongQuestion: (q: WrongQuestion) => void
  markWrongReviewed: (id: string) => void
  clearWrongQuestions: () => void
  addPlayRecord: (record: PlayRecord) => void
  updateStats: (correct: boolean, time: number) => void
  updateBestStreak: (streak: number) => void
  checkNewAchievements: (currentStreak: number) => string[]
  resetData: () => void
}

const initialData: UserData = {
  totalQuestions: 0,
  correctAnswers: 0,
  totalTime: 0,
  streakDays: 0,
  lastPlayDate: '',
  bestStreak: 0,
  achievements: [],
  playHistory: [],
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialData,
      wrongQuestions: [],
      
      addWrongQuestion: (q) =>
        set((state) => {
          const exists = state.wrongQuestions.find(w => w.questionId === q.questionId)
          if (exists) {
            return {
              wrongQuestions: state.wrongQuestions.map(w =>
                w.questionId === q.questionId ? { ...q, reviewed: false } : w
              )
            }
          }
          return { wrongQuestions: [...state.wrongQuestions, q] }
        }),
      
      markWrongReviewed: (id) =>
        set((state) => ({
          wrongQuestions: state.wrongQuestions.map(w =>
            w.id === id ? { ...w, reviewed: true } : w
          )
        })),
      
      clearWrongQuestions: () => set({ wrongQuestions: [] }),
      
      addPlayRecord: (record) =>
        set((state) => ({
          playHistory: [...state.playHistory, record].slice(-30)
        })),
      
      updateStats: (correct, time) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0]
          let newStreakDays = state.streakDays
          
          if (state.lastPlayDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]
            
            if (state.lastPlayDate === yesterdayStr) {
              newStreakDays += 1
            } else if (state.lastPlayDate !== today) {
              newStreakDays = 1
            }
          }
          
          return {
            totalQuestions: state.totalQuestions + 1,
            correctAnswers: state.correctAnswers + (correct ? 1 : 0),
            totalTime: state.totalTime + time,
            lastPlayDate: today,
            streakDays: newStreakDays,
          }
        }),
      
      updateBestStreak: (streak) =>
        set((state) => ({
          bestStreak: Math.max(state.bestStreak, streak)
        })),
      
      checkNewAchievements: (currentStreak) => {
        const state = get()
        const avgTime = state.correctAnswers > 0 ? state.totalTime / state.correctAnswers : 0
        
        const newAchievements = checkAchievements(
          state.correctAnswers,
          state.totalQuestions,
          avgTime,
          state.streakDays,
          currentStreak,
          state.achievements
        )
        
        if (newAchievements.length > 0) {
          set({
            achievements: [...state.achievements, ...newAchievements.map(a => a.id)]
          })
        }
        
        return newAchievements.map(a => a.id)
      },
      
      resetData: () => set({ ...initialData, wrongQuestions: [] }),
    }),
    {
      name: 'geography-game-storage',
    }
  )
)

export default useUserStore
