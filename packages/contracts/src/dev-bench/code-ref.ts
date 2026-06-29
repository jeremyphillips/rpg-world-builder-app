import { z } from 'zod'

export const codeRefSchema = z
  .object({
    packageName: z.string().min(1).optional(),
    path: z.string().min(1),
    symbol: z.string().min(1).optional(),
    lineStart: z.number().int().positive().optional(),
    lineEnd: z.number().int().positive().optional(),
    note: z.string().min(1).optional(),
  })
  .superRefine((ref, ctx) => {
    if (ref.lineStart !== undefined && ref.lineEnd !== undefined && ref.lineEnd < ref.lineStart) {
      ctx.addIssue({
        code: 'custom',
        message: 'lineEnd must be greater than or equal to lineStart',
        path: ['lineEnd'],
      })
    }
  })

export type CodeRef = z.infer<typeof codeRefSchema>
