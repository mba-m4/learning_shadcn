import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'

type ErrorDetail =
  | string
  | {
      detail?: string | { msg?: string }[]
    }

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

interface ApiRequestOptions {
  method?: AxiosRequestConfig['method']
  headers?: HeadersInit
  body?: BodyInit | Record<string, unknown> | unknown[] | null
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

const normalizeHeaders = (headers?: HeadersInit) => {
  const normalized: Record<string, string> = {}

  if (!headers) {
    return normalized
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key] = value
    })
    return normalized
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      normalized[key] = value
    })
    return normalized
  }

  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) {
      normalized[key] = String(value)
    }
  })

  return normalized
}

const shouldSetJsonContentType = (body: ApiRequestOptions['body']) => {
  if (!body) {
    return false
  }

  return !(
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === 'string'
  )
}

const extractErrorMessage = (data: unknown, fallbackMessage?: string) => {
  const error = data as ErrorDetail | undefined
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'detail' in error) {
    const detail = error.detail
    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail) && detail[0]?.msg) {
      return detail[0].msg
    }
  }

  return fallbackMessage || 'Request failed'
}

const parseResponse = <T>(data: unknown, schema?: z.ZodType<T>) => {
  if (!schema) {
    return data as T
  }

  return schema.parse(data)
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const requestConfig = config as InternalAxiosRequestConfig & {
    skipAuth?: boolean
  }
  if (requestConfig.skipAuth) {
    return config
  }

  const { accessToken: token, tokenType } = useAuthStore.getState()
  if (!token) {
    return config
  }

  const scheme = tokenType
    ? tokenType.toLowerCase() === 'bearer'
      ? 'Bearer'
      : tokenType
    : 'Bearer'

  config.headers.set('Authorization', `${scheme} ${token}`)
  return config
})

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.detail || error.message
  }

  if (error instanceof AxiosError) {
    return extractErrorMessage(error.response?.data, error.message)
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

export async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
  withAuth = true,
  schema?: z.ZodType<T>,
): Promise<T> {
  const headers = normalizeHeaders(options.headers)
  headers.Accept = headers.Accept ?? 'application/json'

  if (!headers['Content-Type'] && shouldSetJsonContentType(options.body)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await apiClient.request({
      url: path,
      method: options.method ?? 'GET',
      headers,
      data: options.body,
      params: options.params,
      signal: options.signal,
      skipAuth: !withAuth,
      validateStatus: (status) => status >= 200 && status < 300,
    } as ExtendedAxiosRequestConfig)

    if (response.status === 204) {
      return null as T
    }

    return parseResponse(response.data, schema) as T
  } catch (error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status ?? 0
    const detail = extractErrorMessage(
      axiosError.response?.data,
      axiosError.message,
    )

    if (status === 401 && withAuth) {
      useAuthStore.getState().logout()
    }

    throw new ApiError('Request failed', status, detail)
  }
}