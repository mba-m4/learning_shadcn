import type { TokenResponse, User } from '@/types/api'
import { meResponseSchema, tokenResponseSchema } from './schemas/auth'
import { request, ApiError } from './client'

export async function loginRequest(
  username: string,
  password: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    username,
    password,
  })

  try {
    return await request<TokenResponse>(
      '/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
      false,
      tokenResponseSchema,
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Login failed', 0, String(error))
  }
}

export const fetchMe = () => request<User>('/auth/me', undefined, true, meResponseSchema)
