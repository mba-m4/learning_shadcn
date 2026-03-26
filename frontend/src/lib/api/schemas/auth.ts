import { z } from 'zod'
import { userSchema } from './shared'

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
})

export const meResponseSchema = userSchema