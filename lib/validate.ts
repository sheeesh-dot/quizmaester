import { z } from 'zod'

export const loginSchema = z.object({
  team_id: z.string().uuid(),
  secret_code: z.string().min(6),
})

export const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid(),
        selected_option: z.enum(['A', 'B', 'C', 'D']),
      }),
    )
    .min(1),
})

export const promoteSchema = z.object({
  top_n: z.number().int().positive(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SubmitInput = z.infer<typeof submitSchema>
export type PromoteInput = z.infer<typeof promoteSchema>

