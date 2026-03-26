import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { seedMockDb } from './db'

try {
	seedMockDb()
} catch (error) {
	console.error('Failed to seed mock DB:', error)
}

export const worker = setupWorker(...handlers)
