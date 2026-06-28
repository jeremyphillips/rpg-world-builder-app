import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_IMPORTED_CHARACTERS_POLICY,
  DEFAULT_STARTING_LEVEL,
  MAX_CHARACTER_LEVEL,
  resolveCharacterCreationPatch,
  resolveMechanicsPatch,
  sameStringSet,
} from '@rpg/contracts'
import type {
  CampaignCharacterCreationPatch,
  CampaignMechanicsPatch,
  CreatureTypePolicy,
  RulesetPatchRead,
  SystemRulesetId,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'

import { findCampaignById } from '../campaign'
import { assertCreatureTypesActiveInCampaign } from './assert-campaign-creature-types'
import { CampaignRulesetPatchModel } from './campaign-ruleset-patch.model'
import {
  getOrCreatePatchDocument,
  loadPatchDocument,
  requireCampaignRuleset,
} from './patch-document'

const CHARACTER_CREATION_PREFIX = 'characterCreation.'

function isDefaultCreatureTypePolicy(policy: CreatureTypePolicy | undefined): boolean {
  if (!policy) return true
  return (
    policy.mode === 'only' && sameStringSet(policy.ids, DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES)
  )
}

function mergeCharacterCreationPatch(
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): CampaignCharacterCreationPatch {
  const merged: CampaignCharacterCreationPatch = {
    ...(existing ?? {}),
  }

  if (input.startingLevel !== undefined) merged.startingLevel = input.startingLevel
  if (input.importedCharacters !== undefined) merged.importedCharacters = input.importedCharacters

  if (input.progression !== undefined) {
    const previous = existing?.progression ?? {}
    merged.progression = {
      ...previous,
      ...input.progression,
    }
    if (!('extendedProgression' in input.progression)) {
      const { extendedProgression: _removed, ...withoutExtended } = merged.progression
      merged.progression = withoutExtended
    }
  }

  if (input.species !== undefined) {
    merged.species = {
      ...(existing?.species ?? {}),
      ...input.species,
    }
  }

  return merged
}

function buildCharacterCreationUpdateSet(patch: CampaignCharacterCreationPatch): {
  $set: Record<string, unknown>
  $unset: Record<string, 1>
} {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  const prefix = CHARACTER_CREATION_PREFIX

  if (patch.startingLevel !== undefined) {
    if (patch.startingLevel !== DEFAULT_STARTING_LEVEL) {
      $set[`${prefix}startingLevel`] = patch.startingLevel
    } else {
      $unset[`${prefix}startingLevel`] = 1
    }
  }

  const policy = patch.importedCharacters?.policy
  if (policy !== undefined) {
    if (policy !== DEFAULT_IMPORTED_CHARACTERS_POLICY) {
      $set[`${prefix}importedCharacters.policy`] = policy
    } else {
      $unset[`${prefix}importedCharacters`] = 1
    }
  }

  if (patch.progression !== undefined) {
    const maxLevel = patch.progression.maxCharacterLevel
    if (maxLevel !== undefined) {
      if (maxLevel !== MAX_CHARACTER_LEVEL) {
        $set[`${prefix}progression.maxCharacterLevel`] = maxLevel
      } else {
        $unset[`${prefix}progression.maxCharacterLevel`] = 1
      }
    }

    const extended = patch.progression.extendedProgression
    if (extended) {
      $set[`${prefix}progression.extendedProgression.tierName`] = extended.tierName
      $set[`${prefix}progression.extendedProgression.maxLevel`] = extended.maxLevel
    } else {
      $unset[`${prefix}progression.extendedProgression`] = 1
    }
  }

  const creaturePolicy = patch.species?.creatureTypePolicy
  if (creaturePolicy !== undefined) {
    if (!isDefaultCreatureTypePolicy(creaturePolicy)) {
      $set[`${prefix}species.creatureTypePolicy.mode`] = creaturePolicy.mode
      $set[`${prefix}species.creatureTypePolicy.ids`] = creaturePolicy.ids
    } else {
      $unset[`${prefix}species.creatureTypePolicy`] = 1
      $unset[`${prefix}species`] = 1
    }
  }

  return { $set, $unset }
}

async function applyCharacterCreationUpdate(
  campaignId: string,
  rulesetId: SystemRulesetId,
  patch: CampaignCharacterCreationPatch,
): Promise<void> {
  await getOrCreatePatchDocument(campaignId, rulesetId)

  const { $set, $unset } = buildCharacterCreationUpdateSet(patch)
  if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
    return
  }

  const update: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {}
  if (Object.keys($set).length > 0) update.$set = $set
  if (Object.keys($unset).length > 0) update.$unset = $unset

  await CampaignRulesetPatchModel.findOneAndUpdate({ campaignId, rulesetId }, update, {
    upsert: true,
  })
}

async function assertCreatureTypePolicyIds(
  campaignId: string,
  input: UpdateCampaignCharacterCreationInput,
): Promise<void> {
  const ids = input.species?.creatureTypePolicy?.ids
  if (ids !== undefined) {
    await assertCreatureTypesActiveInCampaign(campaignId, ids)
  }
}

/** Writes initial character-creation patch values when a campaign is created. */
export async function writeInitialCharacterCreation(
  campaignId: string,
  rulesetId: SystemRulesetId,
  input: UpdateCampaignCharacterCreationInput,
): Promise<void> {
  await assertCreatureTypePolicyIds(campaignId, input)
  await applyCharacterCreationUpdate(campaignId, rulesetId, input)
}

/** Returns resolved character-creation rules for a campaign, or null when the campaign is missing. */
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
    mechanics: resolveMechanicsPatch(mechanics),
  }
}

/** Merges a partial character-creation patch and persists sparse overrides. */
export async function updateCharacterCreationPatch(
  campaignId: string,
  input: UpdateCampaignCharacterCreationInput,
): Promise<RulesetPatchRead | null> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  await assertCreatureTypePolicyIds(campaignId, input)

  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const existing = patchDoc?.characterCreation as CampaignCharacterCreationPatch | undefined
  const merged = mergeCharacterCreationPatch(existing, input)

  await applyCharacterCreationUpdate(campaignId, rulesetId, merged)
  return getRulesetPatchRead(campaignId)
}

export {
  getOrCreatePatchDocument,
  loadPatchDocument,
  requireCampaignRuleset,
} from './patch-document'
