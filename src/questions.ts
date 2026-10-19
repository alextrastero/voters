import { reportError } from './errors'

export interface Question {
  id: string
  text: string
}

function isQuestion(value: unknown): value is Question {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Question).id === 'string' &&
    typeof (value as Question).text === 'string'
  )
}

function parseQuestions(raw: string | undefined): Question[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '')
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isQuestion)) return parsed
    throw new Error('Expected a non-empty array of { id, text }')
  } catch (err) {
    reportError(400, err)
    return []
  }
}

export const QUESTIONS = parseQuestions(import.meta.env.VITE_QUESTIONS)
