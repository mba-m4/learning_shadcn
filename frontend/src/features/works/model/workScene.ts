import type { WorkSceneAnnotation } from '@/types/api'

export const getWorkSceneAnnotationColor = (annotation: WorkSceneAnnotation) => {
  return annotation.kind === 'risk' ? '#ef4444' : '#22c55e'
}

export const getWorkSceneAnnotationLabel = (annotation: WorkSceneAnnotation) => {
  return annotation.kind === 'risk' ? 'リスク' : '作業'
}

export const sortWorkSceneAnnotations = (annotations: WorkSceneAnnotation[]) => {
  return [...annotations].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'risk' ? -1 : 1
    }

    if (left.severity && right.severity && left.severity !== right.severity) {
      const order = { high: 0, medium: 1, low: 2 }
      return order[left.severity] - order[right.severity]
    }

    return left.title.localeCompare(right.title, 'ja')
  })
}