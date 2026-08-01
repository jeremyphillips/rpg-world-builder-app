export const CAMPAIGN_CHARACTER_ERROR_CODES = [
  'campaign_not_found',
  'character_not_found',
  'character_not_in_campaign',
  'viewer_not_member',
  'forbidden',
] as const

export type CampaignCharacterErrorCode = (typeof CAMPAIGN_CHARACTER_ERROR_CODES)[number]

export type CampaignCharacterCapabilities = {
  canEdit: boolean
  canManage: boolean
  canDelete: boolean
}

export function resolveCampaignCharacterAccess(input: {
  viewerOwnsCharacter: boolean
  viewerControlsCharacter: boolean
  viewerIsCampaignManager: boolean
}): CampaignCharacterCapabilities {
  const viewerIsCampaignManager = input.viewerIsCampaignManager

  return {
    canEdit: input.viewerOwnsCharacter || input.viewerControlsCharacter || viewerIsCampaignManager,
    canManage: viewerIsCampaignManager,
    canDelete: input.viewerOwnsCharacter,
  }
}
