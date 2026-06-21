import chinaQuestions from './china'
import worldQuestions from './world'
import gridQuestions from './grid'
import campusQuestions from './campus'
import type { Question, MapType, Difficulty, QuestionType } from '../types'

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

export function getQuestionsByType(type: QuestionType): Question[] {
  return allQuestions.filter(q => q.type === type)
}

export function getQuestionsByTypes(types: QuestionType[]): Question[] {
  return allQuestions.filter(q => types.includes(q.type))
}

export function getQuestionsByMapsAndTypes(
  mapTypes: MapType[],
  difficulty: Difficulty,
  questionTypes?: QuestionType[]
): Question[] {
  let questions = allQuestions.filter(q => mapTypes.includes(q.mapType) && q.difficulty === difficulty)
  if (questionTypes && questionTypes.length > 0) {
    questions = questions.filter(q => questionTypes.includes(q.type))
  }
  if (questions.length === 0) {
    questions = allQuestions.filter(q => questionTypes?.includes(q.type) ?? true)
  }
  return questions
}

export function getRandomQuestions(
  mapType: MapType,
  difficulty: Difficulty,
  count: number,
  questionTypes?: QuestionType[]
): Question[] {
  let questions = getQuestionsByDifficulty(mapType, difficulty)
  if (questionTypes && questionTypes.length > 0) {
    questions = questions.filter(q => questionTypes.includes(q.type))
  }
  if (questions.length === 0) {
    questions = allQuestions.filter(q => questionTypes?.includes(q.type) ?? true)
  }
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function getRandomQuestionsMultiMap(
  mapTypes: MapType[],
  difficulty: Difficulty,
  count: number,
  questionTypes?: QuestionType[]
): Question[] {
  const questions = getQuestionsByMapsAndTypes(mapTypes, difficulty, questionTypes)
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find(q => q.id === id)
}

export default allQuestions
