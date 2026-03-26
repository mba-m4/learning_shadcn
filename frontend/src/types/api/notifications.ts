export interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'success'
  created_at: string
  is_read?: boolean
  link?: string
  display_until?: string | null
  pinned?: boolean
}