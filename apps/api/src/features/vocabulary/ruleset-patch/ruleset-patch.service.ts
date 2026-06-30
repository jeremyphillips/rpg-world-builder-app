import { resolveCharacterCreationPatch } from '@rpg/contracts'
import type {
  CampaignCharacterCreationPatch,
  CampaignMechanicsPatch,
  RulesetPatchRead,
  UpdateCampaignCharacterCreationInput,
  UpdateCampaignMechanicsInput,
} from '@rpg/contracts'

import { findCampaignById } from '../../campaign'
import { loadPatchDocument } from '../lib/patch-document'
import {
  updateCharacterCreationPatch as persistCharacterCreationPatch,
  writeInitialCharacterCreation,
} from './character-creation-patch.service'
import {
  resolveStoredMechanicsPatch,
  updateMechanicsPatch as persistMechanicsPatch,
  writeInitialMechanics,
} from './mechanics-patch.service'

/** Returns resolved character-creation and mechanics rules for a campaign, or null when missing. */
export async function getRulesetPatchRead(campaignId: string): Promise<RulesetPatchRead | null> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) return null

  const patchDoc = await loadPatchDocument(campaignId, campaign.rulesetId)
  const characterCreation = patchDoc?.characterCreation as
    | CampaignCharacterCreationPatch
    | undefined
  const mechanics = patchDoc?.mechanics as CampaignMechanicsPatch | undefined

  return {
    characterCreation: resolveCharacterCreationPatch(characterCreation),
    mechanics: resolveStoredMechanicsPatch(mechanics),
  }
}

/** Merges a partial mechanics patch and persists sparse overrides. */
export async function updateMechanicsPatch(
  campaignId: string,
  input: UpdateCampaignMechanicsInput,
): Promise<RulesetPatchRead | null> {
  await persistMechanicsPatch(campaignId, input)
  return getRulesetPatchRead(campaignId)
}

/** Merges a partial character-creation patch and persists sparse overrides. */
export async function updateCharacterCreationPatch(
  campaignId: string,
  input: UpdateCampaignCharacterCreationInput,
): Promise<RulesetPatchRead | null> {
  await persistCharacterCreationPatch(campaignId, input)
  return getRulesetPatchRead(campaignId)
}

export { writeInitialCharacterCreation, writeInitialMechanics }

export {
  applySparsePatchUpdate,
  getOrCreatePatchDocument,
  loadPatchDocument,
  requireCampaignRuleset,
} from '../lib/patch-document'
