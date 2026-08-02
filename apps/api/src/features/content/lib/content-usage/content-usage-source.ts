import type { ContentUsageBlocker } from '@rpg/contracts'
import type { CharacterContentReferenceDescriptor } from '@rpg/contracts'

import type { ContentUsageResolverContext } from './content-usage-context'

/** Loads a blocker index for one opaque content usage source. */
export type ContentUsageSource = {
  loadBlockerIndex: (
    ctx: ContentUsageResolverContext,
  ) => Promise<Map<string, ContentUsageBlocker[]>>
  /** Character field reference owned by this source — used by viewer-relationship enrichment. */
  characterReference?: CharacterContentReferenceDescriptor | 'equipment'
}
