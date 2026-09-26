export type CampaignCharacterDetailAccessInput = {
  viewerId?: string
  characterUserId?: string
  canManage?: boolean
  campaignId?: string
}

export function resolveCampaignCharacterDetailAccess(input: CampaignCharacterDetailAccessInput) {
  const viewerOwnsCharacter = Boolean(
    input.viewerId && input.characterUserId && input.viewerId === input.characterUserId,
  )
  const canManage = Boolean(input.canManage)
  const canEditMedia = Boolean(
    input.viewerId && input.characterUserId && (viewerOwnsCharacter || canManage),
  )
  const managerWrite = Boolean(
    input.campaignId &&
    input.characterUserId &&
    canManage &&
    input.viewerId &&
    !viewerOwnsCharacter,
  )

  return { viewerOwnsCharacter, canManage, canEditMedia, managerWrite }
}
