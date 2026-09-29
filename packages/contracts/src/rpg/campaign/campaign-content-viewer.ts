import { CAMPAIGN_MANAGE_ROLES, type CampaignManageRole } from '../../shared/roles'

import type { ContentViewer } from '../primitives/content-viewer'
export type { ContentViewer, SavedContentReferenceContext } from '../primitives/content-viewer'
export { canResolveSavedContentReference } from '../primitives/content-viewer'

export type CampaignContextViewerInput = {
  campaignRole: string
  pcCharacterIds: readonly string[]
}

/** Maps campaign role + pre-resolved PC ids to the contracts `ContentViewer` model. */
export function buildContentViewerFromCampaignContext(
  context: CampaignContextViewerInput | undefined,
): ContentViewer {
  if (!context) {
    return { kind: 'none' }
  }

  if (CAMPAIGN_MANAGE_ROLES.includes(context.campaignRole as CampaignManageRole)) {
    return { kind: 'manage' }
  }

  if (context.campaignRole === 'pc' && context.pcCharacterIds.length > 0) {
    return { kind: 'pc', characterIds: context.pcCharacterIds }
  }

  return { kind: 'none' }
}
