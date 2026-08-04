import {
  CONTENT_VISIBILITY_MODES,
  type ContentVisibilityMode,
} from '../../vocab/content-visibility'
import { CONTENT_TYPE_KEYS } from './content-type-keys'

export const CONTENT_ACCESS_TARGET_TYPES = [...CONTENT_TYPE_KEYS, 'subclasses'] as const

export type ContentAccessTargetType = (typeof CONTENT_ACCESS_TARGET_TYPES)[number]

export type ContentAccessCapability =
  | {
      mode: 'owned'
      visibilityModes: readonly ContentVisibilityMode[]
      /** Overview-style bulk campaign availability edits for this target type. */
      bulkCampaignAccess: boolean
    }
  | { mode: 'inherited'; parentType: ContentAccessTargetType }
  | { mode: 'unsupported' }

const ownedContentAccessCapability = (
  bulkCampaignAccess = true,
): Extract<ContentAccessCapability, { mode: 'owned' }> => ({
  mode: 'owned',
  visibilityModes: CONTENT_VISIBILITY_MODES,
  bulkCampaignAccess,
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
    /** Subclasses are edited in the class editor — not bulk-selected from content overviews. */
    subclasses: ownedContentAccessCapability(false),
  }

/** Whether a target type supports overview-style bulk campaign availability edits. */
export function supportsContentBulkCampaignAccess(targetType: ContentAccessTargetType): boolean {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  return capability.mode === 'owned' && capability.bulkCampaignAccess
}
