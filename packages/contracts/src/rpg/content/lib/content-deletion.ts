import { z } from 'zod'

import { CONTENT_TYPE_KEYS } from './content-type-keys'

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

export const contentUsageBlockerSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('usage'),
    usage: contentUsageReferenceSchema,
  }),
  z.object({
    kind: z.literal('content'),
    contentTypeKey: z.enum(CONTENT_TYPE_KEYS),
    id: z.string(),
    label: z.string(),
    slug: z.string(),
  }),
  z.object({
    kind: z.literal('rule'),
    code: z.string(),
    message: z.string(),
  }),
])

export type ContentUsageBlocker = z.infer<typeof contentUsageBlockerSchema>

/** Advisory preflight — GET only; not a lock or permission grant. */
export const contentDeletionAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type ContentDeletionAvailability = z.infer<typeof contentDeletionAvailabilitySchema>

/** Authoritative delete outcome — returned on success (200) or blocked race (409). */
export const contentDeletionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('deleted') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type ContentDeletionResult = z.infer<typeof contentDeletionResultSchema>

/** Advisory preflight for demote UX — always re-validated on POST demote. */
export const contentDemotionAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type ContentDemotionAvailability = z.infer<typeof contentDemotionAvailabilitySchema>

/** Authoritative demote outcome — returned on success (200) or blocked race (409). */
export const contentDemotionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('demoted') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type ContentDemotionResult = z.infer<typeof contentDemotionResultSchema>

/** Advisory preflight for disabling a vocabulary option (status → disabled). */
export const vocabularyDisableAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type VocabularyDisableAvailability = z.infer<typeof vocabularyDisableAvailabilitySchema>

/** Authoritative disable outcome — PATCH may return 409 with blockers on race. */
export const vocabularyDisableResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type VocabularyDisableResult = z.infer<typeof vocabularyDisableResultSchema>
