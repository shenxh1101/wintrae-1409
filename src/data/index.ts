import chinaQuestions from './china'
import worldQuestions from './world'
import gridQuestions from './grid'
import campusQuestions from './campus'
import type { Question, MapType, Difficulty } from '../types'

export const allQuestions: Question[] = [
  ...chinaQuestions,
  ...worldQuestions,
  ...gridQuestions,
  ...campusQuestions,
]

export function getQuestionsByMap(mapType: MapType): Question[] {
  return allQuestions.filter(q => q.mapType === mapType)
}

export function getQuestionsByDifficulty(mapType: MapType, difficulty: Difficulty): Question[] {
  return allQuestions.filter(q => q.mapType === mapType && q.difficulty === difficulty)
}

export function getRandomQuestions(mapType: MapType, difficulty: Difficulty, count: number): Question[] {
  const questions = getQuestionsByDifficulty(mapType, difficulty)
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find(q => q.id === id)
}

export default allQuestions
