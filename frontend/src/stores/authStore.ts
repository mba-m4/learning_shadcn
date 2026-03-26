import { create } from 'zustand'
import type { User } from '@/types/api'
import { fetchMe, loginRequest } from '@/features/auth/api/service'
import { getErrorMessage } from '@/shared/api/client'
import { queryClient } from '@/shared/api/queryClient'
import { queryKeys } from '@/shared/api/queryKeys'

const STORAGE_KEY = 'rky_check_access_token'
const STORAGE_TYPE_KEY = 'rky_check_token_type'
const STORAGE_LOGIN_ID_KEY = 'rky_check_login_id'

type AuthStatus = 'idle' | 'loading' | 'error'

interface AuthState {
  accessToken: string | null
  tokenType: string | null
  currentUser: User | null
  loginId: string | null
  status: AuthStatus
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  restoreSession: () => Promise<void>
}

const loadToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const loadTokenType = () => {
  try {
    return localStorage.getItem(STORAGE_TYPE_KEY)
  } catch {
    return null
  }
}

const saveToken = (token: string | null) => {
  try {
    if (!token) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // ignore storage errors
  }
}

const saveTokenType = (tokenType: string | null) => {
  try {
    if (!tokenType) {
      localStorage.removeItem(STORAGE_TYPE_KEY)
      return
    }
    localStorage.setItem(STORAGE_TYPE_KEY, tokenType)
  } catch {
    // ignore storage errors
  }
}

const loadLoginId = () => {
  try {
    return localStorage.getItem(STORAGE_LOGIN_ID_KEY)
  } catch {
    return null
  }
}

const saveLoginId = (loginId: string | null) => {
  try {
    if (!loginId) {
      localStorage.removeItem(STORAGE_LOGIN_ID_KEY)
      return
    }
    localStorage.setItem(STORAGE_LOGIN_ID_KEY, loginId)
  } catch {
    // ignore storage errors
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: loadToken(),
  tokenType: loadTokenType(),
  currentUser: null,
  loginId: loadLoginId(),
  status: 'idle',
  error: null,
  login: async (username, password) => {
    set({ status: 'loading', error: null })
    try {
      const tokenResponse = await loginRequest(username, password)
      saveToken(tokenResponse.access_token)
      saveTokenType(tokenResponse.token_type)
      saveLoginId(username)
      set({
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type,
        loginId: username,
      })
      const user = await fetchMe()
      queryClient.setQueryData(queryKeys.auth.me(), user)
      set({ currentUser: user, status: 'idle' })
      return true
    } catch (error) {
      set({
        error: getErrorMessage(error),
        status: 'error',
        currentUser: null,
      })
      return false
    }
  },
  logout: () => {
    saveToken(null)
    saveTokenType(null)
    saveLoginId(null)
    queryClient.clear()
    set({
      accessToken: null,
      tokenType: null,
      currentUser: null,
      loginId: null,
      status: 'idle',
      error: null,
    })
  },
  restoreSession: async () => {
    const token = get().accessToken ?? loadToken()
    if (!token) {
      return
    }

    const tokenType = get().tokenType ?? loadTokenType()
    const loginId = get().loginId ?? loadLoginId()
    set({ status: 'loading', error: null, accessToken: token, tokenType, loginId })
    try {
      const user = await fetchMe()
      queryClient.setQueryData(queryKeys.auth.me(), user)
      set({ currentUser: user, status: 'idle' })
    } catch (error) {
      saveToken(null)
      saveTokenType(null)
      saveLoginId(null)
      queryClient.clear()
      set({
        accessToken: null,
        tokenType: null,
        currentUser: null,
        loginId: null,
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },
}))
