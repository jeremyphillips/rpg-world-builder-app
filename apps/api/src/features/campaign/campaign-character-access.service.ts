import type {
  CampaignCharacterErrorCode,
  CampaignCharacterGetCapabilities,
  CampaignCharacterParticipation,
  CampaignRole,
  CharacterRoutingContextResponse,
  NpcCharacter,
  PcCharacter,
} from '@rpg/contracts'
import { isCampaignManager, resolveCampaignCharacterAccess } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findNpcById, findPcById } from '../character'
import { CampaignMembershipModel } from './campaign-membership.model'
import { findCampaignById } from './find-campaign-by-id'
import {
  findOpenParticipation,
  findOpenParticipationForCharacter,
} from './participation/campaign-character-participation.repository'

export type CampaignCharacterAccessContext = {
  campaignId: string
  character: PcCharacter
  participation: CampaignCharacterParticipation
  viewerUserId: string
  viewerRole: CampaignRole
  capabilities: CampaignCharacterGetCapabilities
}

export type CampaignParticipantAccessContext = {
  campaignId: string
  character: PcCharacter | NpcCharacter
  participation: CampaignCharacterParticipation
  viewerUserId: string
  viewerRole: CampaignRole
  capabilities: CampaignCharacterGetCapabilities
}

type AccessFailureInput = {
  code: CampaignCharacterErrorCode
  status: number
  message: string
  logReason: string
  characterId: string
  campaignId: string
  viewerUserId: string
}

function logAccessFailure(input: AccessFailureInput): void {
  console.debug('[campaign-character-access]', {
    characterId: input.characterId,
    campaignId: input.campaignId,
    viewerUserId: input.viewerUserId,
    reason: input.logReason,
  })
}

function accessFailure(input: AccessFailureInput): { ok: false; error: HttpError } {
  logAccessFailure(input)
  return {
    ok: false,
    error: new HttpError(input.status, input.code, input.message),
  }
}

type AuthorizeCampaignParticipantInput = {
  campaignId: string
  characterId: string
  viewerUserId: string
  viewerRole: CampaignRole
  viewerControlledCharacterIds: readonly string[]
}

async function authorizeCampaignParticipantAccessInternal(
  input: AuthorizeCampaignParticipantInput,
): Promise<
  { ok: true; context: CampaignParticipantAccessContext } | { ok: false; error: HttpError }
> {
  const { campaignId, characterId, viewerUserId, viewerRole, viewerControlledCharacterIds } = input

  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    return accessFailure({
      code: 'campaign_not_found',
      status: 404,
      message: 'Campaign not found.',
      logReason: 'campaign_not_found',
      characterId,
      campaignId,
      viewerUserId,
    })
  }

  const pc = await findPcById(characterId)
  const npc = pc ? null : await findNpcById(characterId)
  const character = pc ?? npc
  if (!character) {
    return accessFailure({
      code: 'character_not_found',
      status: 404,
      message: 'This character could not be found in this campaign.',
      logReason: 'character_not_found',
      characterId,
      campaignId,
      viewerUserId,
    })
  }

  const participation = await findOpenParticipation({ campaignId, characterId })
  if (!participation) {
    return accessFailure({
      code: 'character_not_in_campaign',
      status: 404,
      message: 'This character could not be found in this campaign.',
      logReason: 'character_not_in_campaign',
      characterId,
      campaignId,
      viewerUserId,
    })
  }

  const resolved = resolveCampaignCharacterAccess({
    viewerOwnsCharacter: character.characterType === 'pc' && character.userId === viewerUserId,
    viewerControlsCharacter: viewerControlledCharacterIds.includes(characterId),
    viewerIsCampaignManager: isCampaignManager(viewerRole),
  })

  return {
    ok: true,
    context: {
      campaignId,
      character,
      participation,
      viewerUserId,
      viewerRole,
      capabilities: {
        canEdit: resolved.canEdit,
        canManage: resolved.canManage,
        canDelete: resolved.canDelete,
      },
    },
  }
}

export async function authorizeCampaignCharacterAccess(
  input: AuthorizeCampaignParticipantInput,
): Promise<
  { ok: true; context: CampaignCharacterAccessContext } | { ok: false; error: HttpError }
> {
  const access = await authorizeCampaignParticipantAccessInternal(input)
  if (!access.ok) return access

  if (access.context.character.characterType !== 'pc') {
    return accessFailure({
      code: 'character_not_found',
      status: 404,
      message: 'This character could not be found in this campaign.',
      logReason: 'character_not_found',
      characterId: input.characterId,
      campaignId: input.campaignId,
      viewerUserId: input.viewerUserId,
    })
  }

  return {
    ok: true,
    context: {
      ...access.context,
      character: access.context.character,
    },
  }
}

/** Authorizes campaign sheet reads for participating PCs and NPCs. */
export async function authorizeCampaignParticipantAccess(
  input: AuthorizeCampaignParticipantInput,
): Promise<
  { ok: true; context: CampaignParticipantAccessContext } | { ok: false; error: HttpError }
> {
  return authorizeCampaignParticipantAccessInternal(input)
}

export async function resolveCharacterRoutingContext(
  characterId: string,
  viewerUserId: string,
): Promise<CharacterRoutingContextResponse | null> {
  const character = await findPcById(characterId)
  if (!character) {
    return null
  }

  const participation = await findOpenParticipationForCharacter(characterId)
  const viewerOwnsCharacter = character.userId === viewerUserId

  if (!viewerOwnsCharacter) {
    if (!participation) {
      return null
    }

    const membership = await CampaignMembershipModel.findOne({
      campaignId: participation.campaignId,
      userId: viewerUserId,
    }).lean()

    if (!membership) {
      return null
    }
  }

  if (!participation) {
    return {}
  }

  return { openCampaign: { id: participation.campaignId } }
}

export async function assertViewerCampaignMembership(input: {
  campaignId: string
  viewerUserId: string
  characterId: string
}): Promise<{ ok: false; error: HttpError } | { ok: true }> {
  const membership = await CampaignMembershipModel.findOne({
    campaignId: input.campaignId,
    userId: input.viewerUserId,
  }).lean()

  if (!membership) {
    return accessFailure({
      code: 'viewer_not_member',
      status: 403,
      message: 'You do not have permission to view this character.',
      logReason: 'viewer_not_member',
      characterId: input.characterId,
      campaignId: input.campaignId,
      viewerUserId: input.viewerUserId,
    })
  }

  return { ok: true }
}
