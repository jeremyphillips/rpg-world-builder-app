import type { ResolvedContentCampaignAccess } from '../campaign-access'
import type { ContentViewer } from '../../../primitives/content-viewer'

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
