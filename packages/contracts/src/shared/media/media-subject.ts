import { z } from 'zod'

/** Domains that may attach media reference rows during reconcile. */
export const mediaSubjectKindSchema = z.enum(['content', 'character', 'campaign'])

export type MediaSubjectKind = z.infer<typeof mediaSubjectKindSchema>

/** Stable subject identity for reference tracking and reconcile commands. */
export const mediaSubjectSchema = z
  .object({
    kind: mediaSubjectKindSchema,
    id: z.string().min(1),
    scopeKey: z.string().min(1),
  })
  .strict()

export type MediaSubject = z.infer<typeof mediaSubjectSchema>
