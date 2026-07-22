import { z } from 'zod'

/** Domain usage reference — dashboard resolves navigation from structured identity. */
export const contentUsageReferenceSchema = z.object({
  kind: z.literal('character'),
  id: z.string(),
  label: z.string(),
  characterType: z.enum(['pc', 'npc']),
  /** Present for NPCs; omitted for standalone PCs. Dashboard uses for link resolution. */
  campaignId: z.string().optional(),
})

export type ContentUsageReference = z.infer<typeof contentUsageReferenceSchema>

export const contentDeletionBlockerSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('usage'),
    usage: contentUsageReferenceSchema,
  }),
  z.object({
    kind: z.literal('rule'),
    code: z.string(),
    message: z.string(),
  }),
])

export type ContentDeletionBlocker = z.infer<typeof contentDeletionBlockerSchema>

/** Advisory preflight — GET only; not a lock or permission grant. */
export const contentDeletionAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentDeletionBlockerSchema),
  }),
])

export type ContentDeletionAvailability = z.infer<typeof contentDeletionAvailabilitySchema>

/** Authoritative delete outcome — returned on success (200) or blocked race (409). */
export const contentDeletionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('deleted') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentDeletionBlockerSchema),
  }),
])

export type ContentDeletionResult = z.infer<typeof contentDeletionResultSchema>
