import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { seedMockDb } from './db'

seedMockDb()

export const worker = setupWorker(...handlers)
