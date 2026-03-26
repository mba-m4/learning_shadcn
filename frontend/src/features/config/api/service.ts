import { request } from '@/shared/api/client'
import { configCatalogSchema } from '@/shared/api/schemas/support'

export type ConfigCatalog = {
  incidentStatuses: string[]
  incidentTypes: string[]
  incidentLabels: string[]
  riskSeverities: string[]
  riskStatuses: string[]
  workStatuses: string[]
  notificationTypes: Array<'info' | 'warning' | 'urgent' | 'success'>
}

export const fetchConfigCatalog = () =>
  request<ConfigCatalog>('/config/catalog', undefined, true, configCatalogSchema)