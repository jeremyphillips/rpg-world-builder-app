import { z } from 'zod'

import { contentVisibilityModeSchema } from '../../../vocab/content-visibility'
import { contentUsageBlockerSchema } from '../content-usage-blocker'

/** Write shape for campaign access — `participantIds` are PC character document ids. */
export const contentCampaignAccessSchema = z.object({
  available: z.boolean(),
  visibilityMode: contentVisibilityModeSchema,
  participantIds: z.array(z.string()),
})

export type ContentCampaignAccess = z.infer<typeof contentCampaignAccessSchema>

export const contentCampaignAccessPatchSchema = contentCampaignAccessSchema
  .superRefine((data, ctx) => {
    if (data.visibilityMode === 'specific_players' && data.participantIds.length < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one player.',
        path: ['participantIds'],
      })
    }
  })
  .transform((data) => ({
    ...data,
    participantIds: data.visibilityMode === 'specific_players' ? data.participantIds : [],
  }))

export type ContentCampaignAccessPatch = z.infer<typeof contentCampaignAccessPatchSchema>

/** Resolved read shape — includes derived effective audience and stale participant ids. */
export const resolvedContentCampaignAccessSchema = contentCampaignAccessSchema.extend({
  unavailableParticipantIds: z.array(z.string()),
  effectiveAudience: z.union([contentVisibilityModeSchema, z.literal('none')]),
})

export type ResolvedContentCampaignAccess = z.infer<typeof resolvedContentCampaignAccessSchema>

/** Campaign availability filter values shared by overview tables and future list APIs. */
export const CAMPAIGN_AVAILABILITY_FILTER_VALUES = ['available', 'unavailable', 'all'] as const

export type CampaignAvailabilityFilter = (typeof CAMPAIGN_AVAILABILITY_FILTER_VALUES)[number]

export const CAMPAIGN_AVAILABILITY_FILTER_DEFAULT: CampaignAvailabilityFilter = 'available'

/** Composable list-row typing — prefer over per-entity Resolved* aliases. */
export type WithCampaignAccess<T> = T & {
  campaignAccess: ResolvedContentCampaignAccess
}

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

export type ResolveContentCampaignAccessOptions = {
  /** Campaign-submitted PC ids still present in the roster — splits stale grants. */
  validParticipantIds?: readonly string[]
}

export function resolveContentCampaignAccess(
  stored: Partial<ContentCampaignAccess> | null | undefined,
  options?: ResolveContentCampaignAccessOptions,
): ResolvedContentCampaignAccess {
  const available = stored?.available ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.available
  const visibilityMode = stored?.visibilityMode ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode
  const storedParticipantIds =
    stored?.participantIds ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.participantIds

  let participantIds = storedParticipantIds
  let unavailableParticipantIds: string[] = []

  if (options?.validParticipantIds) {
    const validSet = new Set(options.validParticipantIds)
    participantIds = storedParticipantIds.filter((id) => validSet.has(id))
    unavailableParticipantIds = storedParticipantIds.filter((id) => !validSet.has(id))
  }

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

/** Alias for schema composition at API validation boundaries. */
export const withCampaignAccessSchema = withCampaignAccess
