import type {
  CharacterLifecyclePatch,
  CreateNpcRequestInput,
  CreateNpcServiceInput,
  NpcCharacter,
} from '@rpg/contracts'

import { findCampaignById } from '../find-campaign-by-id'
import {
  createNpcRecord,
  deleteNpcForCampaign,
  findNpcForCampaign,
  listNpcsForCampaign,
} from '../../character/character.repository'
import { updateCharacterLifecycle } from '../../character/character.service'
import { HttpError } from '../../../lib/http-error'
import { assertNpcCreateRequestRestrictions } from './assert-npc-create'

export async function createCampaignNpc(
  campaignId: string,
  input: CreateNpcRequestInput,
): Promise<NpcCharacter> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  if (input.rulesetId !== campaign.rulesetId) {
    throw HttpError.badRequest('rulesetId must match the campaign ruleset.')
  }

  assertNpcCreateRequestRestrictions(input)

  const serviceInput: CreateNpcServiceInput = {
    ...input,
    characterType: 'npc',
    campaignId,
  }

  return createNpcRecord(serviceInput)
}

export async function listCampaignNpcs(campaignId: string): Promise<NpcCharacter[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  return listNpcsForCampaign(campaignId)
}

export async function getCampaignNpc(
  campaignId: string,
  npcId: string,
): Promise<NpcCharacter | null> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  return findNpcForCampaign(npcId, campaignId)
}

export async function deleteCampaignNpc(campaignId: string, npcId: string): Promise<boolean> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  return deleteNpcForCampaign(npcId, campaignId)
}

export async function patchCampaignNpcLifecycle(
  campaignId: string,
  npcId: string,
  patch: CharacterLifecyclePatch,
): Promise<NpcCharacter | null> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const existing = await findNpcForCampaign(npcId, campaignId)
  if (!existing) return null

  const updated = await updateCharacterLifecycle(npcId, patch, {
    timestamp: new Date().toISOString(),
  })
  if (!updated) return null

  return findNpcForCampaign(npcId, campaignId)
}
