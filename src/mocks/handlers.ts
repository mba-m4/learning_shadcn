import { http, HttpResponse } from 'msw'
import { taskList } from '@/mocks/data/tasks'

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(taskList)
  }),
]
