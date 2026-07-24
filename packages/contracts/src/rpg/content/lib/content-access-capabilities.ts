import {
  CONTENT_VISIBILITY_MODES,
  type ContentVisibilityMode,
} from '../../vocab/content-visibility'
import { CONTENT_TYPE_KEYS } from './content-type-keys'

export const CONTENT_ACCESS_TARGET_TYPES = [...CONTENT_TYPE_KEYS, 'subclasses'] as const

export type ContentAccessTargetType = (typeof CONTENT_ACCESS_TARGET_TYPES)[number]

export type ContentAccessCapability =
  | { mode: 'owned'; visibilityModes: readonly ContentVisibilityMode[] }
  | { mode: 'inherited'; parentType: ContentAccessTargetType }
  | { mode: 'unsupported' }

export const CONTENT_ACCESS_CAPABILITIES: Record<ContentAccessTargetType, ContentAccessCapability> =
  {
    classes: { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
    species: { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
    spells: { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
    equipment: { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
    feats: { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
    'skill-proficiencies': { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
    subclasses: { mode: 'owned', visibilityModes: CONTENT_VISIBILITY_MODES },
  }
