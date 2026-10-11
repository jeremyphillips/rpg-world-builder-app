import {
  CONTENT_VISIBILITY_MODES,
  type ContentVisibilityMode,
} from '../../vocab/content-visibility'
import { CONTENT_TYPE_KEYS } from '../../primitives/content/content-type-keys'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentCampaignAccess,
  type ResolvedContentCampaignAccess,
} from './campaign-access/campaign-access'

export const CONTENT_ACCESS_TARGET_TYPES = [...CONTENT_TYPE_KEYS, 'subclasses'] as const

export type ContentAccessTargetType = (typeof CONTENT_ACCESS_TARGET_TYPES)[number]

export type ContentAccessCapability =
  | {
      mode: 'owned'
      visibilityModes: readonly ContentVisibilityMode[]
      /** Default campaign visibility when no stored overlay exists. */
      defaultVisibilityMode: ContentVisibilityMode
      /** Overview-style bulk campaign availability edits for this target type. */
      bulkCampaignAccess: boolean
    }
  | { mode: 'inherited'; parentType: ContentAccessTargetType }
  | { mode: 'unsupported' }

const ownedContentAccessCapability = (options?: {
  bulkCampaignAccess?: boolean
  defaultVisibilityMode?: ContentVisibilityMode
}): Extract<ContentAccessCapability, { mode: 'owned' }> => ({
  mode: 'owned',
  visibilityModes: CONTENT_VISIBILITY_MODES,
  defaultVisibilityMode: options?.defaultVisibilityMode ?? 'all_players',
  bulkCampaignAccess: options?.bulkCampaignAccess ?? true,
})

export const CONTENT_ACCESS_CAPABILITIES: Record<ContentAccessTargetType, ContentAccessCapability> =
  {
    classes: ownedContentAccessCapability(),
    species: ownedContentAccessCapability(),
    spells: ownedContentAccessCapability(),
    equipment: ownedContentAccessCapability(),
    feats: ownedContentAccessCapability(),
    'skill-proficiencies': ownedContentAccessCapability(),
    organizations: ownedContentAccessCapability(),
    locations: ownedContentAccessCapability(),
    monsters: ownedContentAccessCapability({ defaultVisibilityMode: 'dm_only' }),
    /** Subclasses are edited in the class editor — not bulk-selected from content overviews. */
    subclasses: ownedContentAccessCapability({ bulkCampaignAccess: false }),
  }

/** Resolved default campaign access for a target type (no stored overlay). */
export function resolveDefaultContentCampaignAccess(
  targetType: ContentAccessTargetType,
): Pick<ContentCampaignAccess, 'available' | 'visibilityMode' | 'participantIds'> {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  if (capability.mode !== 'owned') {
    return DEFAULT_CONTENT_CAMPAIGN_ACCESS
  }
  return {
    available: true,
    visibilityMode: capability.defaultVisibilityMode,
    participantIds: [],
  }
}

/** Default resolved campaign access for create previews and forms (no stored overlay). */
export function resolveDefaultResolvedContentCampaignAccess(
  targetType: ContentAccessTargetType,
): ResolvedContentCampaignAccess {
  const base = resolveDefaultContentCampaignAccess(targetType)
  return {
    available: base.available,
    visibilityMode: base.visibilityMode,
    participantIds: base.participantIds,
    unavailableParticipantIds: [],
    effectiveAudience: base.visibilityMode,
  }
}

/** Whether a target type supports overview-style bulk campaign availability edits. */
export function supportsContentBulkCampaignAccess(targetType: ContentAccessTargetType): boolean {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  return capability.mode === 'owned' && capability.bulkCampaignAccess
}
