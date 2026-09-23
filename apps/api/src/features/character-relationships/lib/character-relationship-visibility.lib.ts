import type { CharacterRelationshipEdge, ResolvedContentCampaignAccess } from '@rpg/contracts'
import {
  buildContentViewerFromCampaignContext,
  isCampaignManager,
  isContentDiscoverableForViewer,
  isContentVisibleToViewer,
  resolveContentCampaignAccess,
  type ContentViewer,
} from '@rpg/contracts'

import { loadCampaignAccessByTargetIds } from '../../content/lib/content-campaign-access.service'

type RelationshipViewerContext = {
  viewerRole: 'owner' | 'co-owner' | 'pc' | 'observer'
  viewerCharacterIds: readonly string[]
}

export function toCharacterRelationshipCampaignAccess(
  relationship: CharacterRelationshipEdge,
): ResolvedContentCampaignAccess {
  return resolveContentCampaignAccess({
    available: true,
    visibilityMode: relationship.visibility,
    participantIds: relationship.participantIds,
  })
}

export function buildRelationshipViewer(viewer: RelationshipViewerContext): ContentViewer {
  return buildContentViewerFromCampaignContext({
    campaignRole: viewer.viewerRole,
    pcCharacterIds: viewer.viewerCharacterIds,
  })
}

export function canViewerSeeCharacterRelationship(
  relationship: CharacterRelationshipEdge,
  viewer: RelationshipViewerContext,
): boolean {
  if (isCampaignManager(viewer.viewerRole)) {
    return true
  }

  return isContentDiscoverableForViewer(
    toCharacterRelationshipCampaignAccess(relationship),
    buildRelationshipViewer(viewer),
  )
}

export async function isRelationshipTargetVisibleToViewer(
  relationship: CharacterRelationshipEdge,
  viewer: RelationshipViewerContext,
  campaignId: string,
): Promise<boolean> {
  if (isCampaignManager(viewer.viewerRole)) {
    return true
  }

  const contentViewer = buildRelationshipViewer(viewer)

  if (relationship.kind === 'organizationMembership') {
    const accessById = await loadCampaignAccessByTargetIds(campaignId, 'organizations', [
      relationship.organizationId,
    ])
    const access = accessById.get(relationship.organizationId)
    return access ? isContentVisibleToViewer({ campaignAccess: access }, contentViewer) : false
  }

  if ('locationId' in relationship) {
    const accessById = await loadCampaignAccessByTargetIds(campaignId, 'locations', [
      relationship.locationId,
    ])
    const access = accessById.get(relationship.locationId)
    return access ? isContentVisibleToViewer({ campaignAccess: access }, contentViewer) : false
  }

  return true
}
