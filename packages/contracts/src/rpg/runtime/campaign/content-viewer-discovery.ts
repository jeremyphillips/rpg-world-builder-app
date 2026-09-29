import type { ResolvedContentCampaignAccess } from '../../content/lib/campaign-access'
import type { ContentViewer } from '../../primitives/content-viewer'
import { isContentDiscoverableForViewer } from '../../content/lib/campaign-access/is-content-discoverable-for-viewer.lib'

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

export { isContentDiscoverableForViewer }
