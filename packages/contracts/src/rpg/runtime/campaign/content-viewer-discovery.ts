import type { ResolvedContentCampaignAccess } from '../../content/lib/campaign-access'
import type { ContentViewer } from '../../campaign/lib/campaign-content-viewer'

/** Structured player-facing visibility facts for overview metadata. */
export type PlayerContentVisibility =
  | { kind: 'ordinary' }
  | { kind: 'specific'; otherParticipantCount: number }

/** Resolves player line-2 metadata from campaign access and viewer context. */
export function toPlayerContentVisibility(
  campaignAccess: ResolvedContentCampaignAccess,
  viewer: ContentViewer,
): PlayerContentVisibility {
  if (viewer.kind !== 'pc' || campaignAccess.visibilityMode !== 'specific_players') {
    return { kind: 'ordinary' }
  }

  const isGranted = viewer.characterIds.some((characterId) =>
    campaignAccess.participantIds.includes(characterId),
  )
  if (!isGranted) {
    return { kind: 'ordinary' }
  }

  const viewerCharacterIds = new Set(viewer.characterIds)
  const otherParticipantCount = campaignAccess.participantIds.filter(
    (participantId) => !viewerCharacterIds.has(participantId),
  ).length

  return { kind: 'specific', otherParticipantCount }
}

/**
 * Whether content may appear on discovery surfaces (catalog lists, overview tables,
 * builder pickers). Managers bypass all campaign-access visibility modes.
 */
export function isContentDiscoverableForViewer(
  campaignAccess: ResolvedContentCampaignAccess,
  viewer: ContentViewer,
): boolean {
  if (viewer.kind === 'manage') {
    return true
  }

  if (!campaignAccess.available || campaignAccess.effectiveAudience === 'none') {
    return false
  }

  switch (campaignAccess.visibilityMode) {
    case 'all_players':
      return true
    case 'dm_only':
      return false
    case 'specific_players':
      return (
        viewer.kind === 'pc' &&
        viewer.characterIds.some((characterId) =>
          campaignAccess.participantIds.includes(characterId),
        )
      )
    default: {
      const _exhaustive: never = campaignAccess.visibilityMode
      return _exhaustive
    }
  }
}
