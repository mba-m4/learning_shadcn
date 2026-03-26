import type { Role } from './common'

export interface User {
  id: number
  name: string
  role: Role
  is_active: boolean
  contact?: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}