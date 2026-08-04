import { z } from 'zod'

import { usageBlockerSchema } from '../../primitives/usage/usage-blocker'

/** Advisory preflight — GET only; not a lock or permission grant. */
export const contentDeletionAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type ContentDeletionAvailability = z.infer<typeof contentDeletionAvailabilitySchema>

/** Authoritative delete outcome — returned on success (200) or blocked race (409). */
export const contentDeletionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('deleted') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type ContentDeletionResult = z.infer<typeof contentDeletionResultSchema>

/** Advisory preflight for demote UX — always re-validated on POST demote. */
export const contentDemotionAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type ContentDemotionAvailability = z.infer<typeof contentDemotionAvailabilitySchema>

/** Authoritative demote outcome — returned on success (200) or blocked race (409). */
export const contentDemotionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('demoted') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type ContentDemotionResult = z.infer<typeof contentDemotionResultSchema>

/** Advisory preflight for deleting a campaign vocabulary entry. */
export const vocabularyDeleteAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type VocabularyDeleteAvailability = z.infer<typeof vocabularyDeleteAvailabilitySchema>

export {
  contentUsageBlockerSchema,
  contentUsageReferenceSchema,
  type ContentUsageBlocker,
  type ContentUsageReference,
} from './content-usage-blocker'
