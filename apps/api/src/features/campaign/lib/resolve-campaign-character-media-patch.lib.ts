import type { CharacterMediaPatchInput, MediaScope } from '@rpg/contracts'
import {
  isCampaignManager,
  resolveCampaignPcMediaScopeKeys,
  serializeMediaScopeKey,
} from '@rpg/contracts'

import type { authorizeCampaignCharacterAccess } from '../campaign-character-access.service'

type AccessContext = Extract<
  Awaited<ReturnType<typeof authorizeCampaignCharacterAccess>>,
  { ok: true }
>['context']

export function assertCampaignCharacterMediaPatchAllowed(input: {
  context: AccessContext
  viewerUserId: string
  viewerRole: Parameters<typeof authorizeCampaignCharacterAccess>[0]['viewerRole']
}): boolean {
  const { character, capabilities } = input.context
  const viewerOwnsCharacter = character.userId === input.viewerUserId
  const viewerIsManager = isCampaignManager(input.viewerRole)

  if (!viewerOwnsCharacter && !viewerIsManager) {
    return false
  }

  return viewerIsManager || capabilities.canEdit
}

export function resolveCampaignCharacterMediaWriteScope(input: {
  campaignId: string
  characterOwnerUserId: string
  viewerUserId: string
  viewerRole: Parameters<typeof authorizeCampaignCharacterAccess>[0]['viewerRole']
}): { scope: MediaScope; additionalAssetScopeKeys?: readonly string[] } {
  const viewerIsManager = isCampaignManager(input.viewerRole)
  const viewerOwnsCharacter = input.characterOwnerUserId === input.viewerUserId

  const scope =
    viewerIsManager && !viewerOwnsCharacter
      ? ({ kind: 'campaign-pc', campaignId: input.campaignId } as const)
      : ({ kind: 'user-pc', userId: input.characterOwnerUserId } as const)

  if (scope.kind !== 'campaign-pc') {
    return { scope }
  }

  const writeScopeKey = serializeMediaScopeKey(scope)
  return {
    scope,
    additionalAssetScopeKeys: resolveCampaignPcMediaScopeKeys({
      campaignId: input.campaignId,
      characterOwnerUserId: input.characterOwnerUserId,
    }).filter((scopeKey) => scopeKey !== writeScopeKey),
  }
}

export type CampaignCharacterMediaPatchInput = {
  campaignId: string
  characterId: string
  viewerUserId: string
  viewerRole: Parameters<typeof authorizeCampaignCharacterAccess>[0]['viewerRole']
  viewerControlledCharacterIds: readonly string[]
  patch: CharacterMediaPatchInput
}
