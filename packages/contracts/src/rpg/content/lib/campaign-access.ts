import { z } from 'zod'

import { contentVisibilityModeSchema } from '../../vocab/content-visibility'
import { contentUsageBlockerSchema } from './content-deletion'

/** Write shape for campaign access — participant ids, not character ids. */
export const contentCampaignAccessSchema = z.object({
  available: z.boolean(),
  visibilityMode: contentVisibilityModeSchema,
  participantIds: z.array(z.string()),
})

export type ContentCampaignAccess = z.infer<typeof contentCampaignAccessSchema>

export const contentCampaignAccessPatchSchema = contentCampaignAccessSchema

export type ContentCampaignAccessPatch = z.infer<typeof contentCampaignAccessPatchSchema>

/** Resolved read shape — includes derived effective audience and stale participant ids. */
export const resolvedContentCampaignAccessSchema = contentCampaignAccessSchema.extend({
  unavailableParticipantIds: z.array(z.string()),
  effectiveAudience: z.union([contentVisibilityModeSchema, z.literal('none')]),
})

export type ResolvedContentCampaignAccess = z.infer<typeof resolvedContentCampaignAccessSchema>

export const DEFAULT_CONTENT_CAMPAIGN_ACCESS: ResolvedContentCampaignAccess = {
  available: true,
  visibilityMode: 'all_players',
  participantIds: [],
  unavailableParticipantIds: [],
  effectiveAudience: 'all_players',
}

/** Advisory preflight for availability-off UX — always re-validated on PATCH. */
export const contentCampaignAccessAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type ContentCampaignAccessAvailability = z.infer<
  typeof contentCampaignAccessAvailabilitySchema
>

/** Authoritative PATCH outcome — returned on success (200) or blocked race (409). */
export const contentCampaignAccessUpdateResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('updated'),
    campaignAccess: resolvedContentCampaignAccessSchema,
  }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(contentUsageBlockerSchema),
  }),
])

export type ContentCampaignAccessUpdateResult = z.infer<
  typeof contentCampaignAccessUpdateResultSchema
>

export function resolveContentCampaignAccess(
  stored: Partial<ContentCampaignAccess> | null | undefined,
): ResolvedContentCampaignAccess {
  const available = stored?.available ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.available
  const visibilityMode = stored?.visibilityMode ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode
  const participantIds = stored?.participantIds ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.participantIds

  // Valid/stale split is trivial until the participant system can populate ids.
  const unavailableParticipantIds: string[] = []

  return {
    available,
    visibilityMode,
    participantIds,
    unavailableParticipantIds,
    effectiveAudience: available ? visibilityMode : 'none',
  }
}

/** Shared extension for resolved list-row schemas. */
export const resolvedCampaignAccessFields = {
  campaignAccess: resolvedContentCampaignAccessSchema,
} as const

export function withCampaignAccess<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.extend(resolvedCampaignAccessFields)
}
