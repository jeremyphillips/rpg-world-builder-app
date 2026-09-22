import type { ArrayCanAppendResult } from '@rpg/ui/form'

import type {
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
} from './character-relationship-field-context.types'
import { characterResidenceRelationshipAdapter } from './character-residence-relationship.adapter'

export const RESIDENCE_NO_CAMPAIGN_REASON = 'Choose a campaign to link a residence location.'
export const RESIDENCE_LOCATIONS_LOADING_REASON = 'Loading residence locations…'
export const RESIDENCE_NO_MORE_ITEMS_REASON = 'No more items can be added.'

export function resolveResidenceSectionStatusCopy(
  context: CharacterRelationshipFieldContext,
): string | undefined {
  if (!context.campaignId) return RESIDENCE_NO_CAMPAIGN_REASON
  if (context.locationsQueryStatus.status === 'pending') return RESIDENCE_LOCATIONS_LOADING_REASON
  if (context.locationsQueryStatus.status === 'error') {
    return context.locationsQueryStatus.message
  }
  return undefined
}

export function resolveResidenceCanAppend(
  items: readonly CharacterResidenceEdge[],
  context: CharacterRelationshipFieldContext,
): ArrayCanAppendResult {
  if (!context.campaignId) {
    return { enabled: false, reason: RESIDENCE_NO_CAMPAIGN_REASON }
  }
  const { locationsQueryStatus } = context
  if (locationsQueryStatus.status === 'pending') {
    return { enabled: false, reason: RESIDENCE_LOCATIONS_LOADING_REASON }
  }
  if (locationsQueryStatus.status === 'error') {
    return { enabled: false, reason: locationsQueryStatus.message }
  }
  const canAdd = characterResidenceRelationshipAdapter.canAdd?.(items, context) ?? true
  return canAdd ? { enabled: true } : { enabled: false, reason: RESIDENCE_NO_MORE_ITEMS_REASON }
}
