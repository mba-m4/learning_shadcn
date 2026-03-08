import { http, HttpResponse } from 'msw'
import { taskList } from '@/mocks/data/tasks'
import { navigationConfig } from '@/mocks/data/navigation'
import { pageContentByPath } from '@/mocks/data/page-content'
import { mockDatabaseTables, getTableByName } from '@/mocks/data/databases'

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(taskList)
  }),
  http.get('/api/navigation', () => {
    return HttpResponse.json(navigationConfig)
  }),
  http.get('/api/page-content', ({ request }) => {
    const url = new URL(request.url)
    const path = url.searchParams.get('path')

    if (path && pageContentByPath[path]) {
      return HttpResponse.json(pageContentByPath[path])
    }

    return HttpResponse.json(pageContentByPath)
  }),
  http.get('/api/databases', () => {
    return HttpResponse.json(mockDatabaseTables)
  }),
  http.get('/api/databases/:tableName', ({ params }) => {
    const { tableName } = params
    const table = getTableByName(tableName as string)
    
    if (table) {
      return HttpResponse.json(table)
    }
    
    return HttpResponse.json(null, { status: 404 })
  }),
]
