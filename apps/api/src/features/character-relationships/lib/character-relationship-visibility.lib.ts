import type { CharacterRelationshipEdge } from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

type RelationshipViewerContext = {
  viewerUserId: string
  viewerRole: 'owner' | 'co-owner' | 'pc' | 'observer'
}

export function canViewerSeeCharacterRelationship(
  relationship: CharacterRelationshipEdge,
  viewer: RelationshipViewerContext,
): boolean {
  if (isCampaignManager(viewer.viewerRole)) {
    return true
  }

  if (relationship.visibility === 'dm_only') {
    return false
  }

  if (relationship.visibility === 'all_players') {
    return true
  }

  return relationship.createdByUserId === viewer.viewerUserId
}
