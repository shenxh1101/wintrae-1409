export type MapType = 'china' | 'world' | 'grid' | 'campus'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType = 'province' | 'city' | 'river' | 'direction' | 'continent' | 'latitude' | 'longitude' | 'building'

export type PracticeMode = 'mixed' | 'wrong-review'

export interface Question {
  id: string
  mapType: MapType
  difficulty: Difficulty
  type: QuestionType
  targetId: string
  prompt: string
  explanation: string
  hints: string[]
}

export interface PlayRecord {
  date: string
  mapType: MapType
  difficulty: Difficulty
  score: number
  correctCount: number
  totalCount: number
  avgTime: number
}

export interface UserData {
  totalQuestions: number
  correctAnswers: number
  totalTime: number
  streakDays: number
  lastPlayDate: string
  bestStreak: number
  achievements: string[]
  playHistory: PlayRecord[]
}

export interface WrongQuestion {
  id: string
  questionId: string
  question: Question
  wrongAnswer: string
  wrongPosition?: { x: number; y: number }
  timestamp: number
  reviewed: boolean
  mastered: boolean
  wrongCount: number
  lastWrongAnswer?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'speed' | 'accuracy' | 'streak' | 'collection'
  condition: {
    type: 'correct_count' | 'accuracy_rate' | 'avg_time' | 'streak_days' | 'map_complete'
    value: number
    mapType?: MapType
  }
  points: number
}

export interface GameState {
  currentQuestionIndex: number
  questions: Question[]
  score: number
  streak: number
  hintsUsed: number
  timeLeft: number
  isPlaying: boolean
  showResult: boolean
  isCorrect: boolean
}
