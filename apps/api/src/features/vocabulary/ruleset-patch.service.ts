import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_EDITION_PRESET_ID,
  DEFAULT_IMPORTED_CHARACTERS_POLICY,
  DEFAULT_STARTING_LEVEL,
  MAX_CHARACTER_LEVEL,
  getEditionPresetMechanics,
  mechanicsDriftFromPreset,
  resolveCharacterCreationPatch,
  resolveMechanicsPatch,
  sameStringSet,
} from '@rpg/contracts'
import type {
  CampaignCharacterCreationPatch,
  CampaignMechanicsPatch,
  CreatureTypePolicy,
  EditionPresetId,
  ResolvedMechanicsKnobs,
  RulesetPatchRead,
  SystemRulesetId,
  UpdateCampaignCharacterCreationInput,
  UpdateCampaignMechanicsInput,
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
const MECHANICS_PREFIX = 'mechanics.'

function normalizeMechanicsPatchFromDoc(
  mechanics: CampaignMechanicsPatch | undefined,
): CampaignMechanicsPatch | undefined {
  if (!mechanics?.editionPreset?.appliedAt) return mechanics

  const appliedAt = mechanics.editionPreset.appliedAt as string | Date | undefined
  if (appliedAt instanceof Date) {
    return {
      ...mechanics,
      editionPreset: {
        ...mechanics.editionPreset,
        appliedAt: appliedAt.toISOString(),
      },
    }
  }

  return mechanics
}

function resolveStoredMechanicsKnobs(
  patch: CampaignMechanicsPatch,
  presetId: EditionPresetId,
): ResolvedMechanicsKnobs {
  const bundle = getEditionPresetMechanics(presetId)

  return {
    armorClass: {
      mode: patch.armorClass?.mode ?? bundle.armorClass.mode,
      base: patch.armorClass?.base ?? bundle.armorClass.base,
    },
    attackResolution: {
      mode: patch.attackResolution?.mode ?? bundle.attackResolution.mode,
    },
  }
}

function computeMechanicsPatchMetadata(
  patch: CampaignMechanicsPatch,
  options?: { appliedAt?: string; presetIdChanged?: boolean },
): CampaignMechanicsPatch {
  const presetId = (patch.editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID) as EditionPresetId
  const knobs = resolveStoredMechanicsKnobs(patch, presetId)
  const bundle = getEditionPresetMechanics(presetId)
  const modified = mechanicsDriftFromPreset(presetId, knobs)
  const appliedAt =
    options?.presetIdChanged === true
      ? options.appliedAt
      : (patch.editionPreset?.appliedAt ?? options?.appliedAt)

  const result: CampaignMechanicsPatch = {
    editionPreset: {
      id: presetId,
      modified,
      ...(appliedAt !== undefined && { appliedAt }),
    },
  }

  if (
    knobs.armorClass.mode !== bundle.armorClass.mode ||
    knobs.armorClass.base !== bundle.armorClass.base
  ) {
    result.armorClass = knobs.armorClass
  }

  if (knobs.attackResolution.mode !== bundle.attackResolution.mode) {
    result.attackResolution = knobs.attackResolution
  }

  return result
}

function mergeMechanicsPatch(
  existing: CampaignMechanicsPatch | undefined,
  input: UpdateCampaignMechanicsInput,
): CampaignMechanicsPatch {
  const existingPresetId = (existing?.editionPreset?.id ??
    DEFAULT_EDITION_PRESET_ID) as EditionPresetId
  const inputPresetId = input.editionPreset?.id
  const presetIdChanging = inputPresetId !== undefined && inputPresetId !== existingPresetId

  if (presetIdChanging && inputPresetId !== undefined) {
    const bundle = getEditionPresetMechanics(inputPresetId)
    return computeMechanicsPatchMetadata(
      {
        editionPreset: { id: inputPresetId },
        armorClass: { ...bundle.armorClass },
        attackResolution: { ...bundle.attackResolution },
      },
      {
        appliedAt:
          inputPresetId === DEFAULT_EDITION_PRESET_ID ? undefined : new Date().toISOString(),
        presetIdChanged: true,
      },
    )
  }

  const merged: CampaignMechanicsPatch = { ...(existing ?? {}) }

  if (inputPresetId !== undefined) {
    merged.editionPreset = {
      ...(merged.editionPreset ?? {}),
      id: inputPresetId,
    }
  }

  if (input.armorClass !== undefined) {
    merged.armorClass = {
      ...(merged.armorClass ?? {}),
      ...input.armorClass,
    }
  }

  if (input.attackResolution !== undefined) {
    merged.attackResolution = {
      ...(merged.attackResolution ?? {}),
      ...input.attackResolution,
    }
  }

  return computeMechanicsPatchMetadata(merged)
}

function isSparseDefaultMechanicsPatch(patch: CampaignMechanicsPatch): boolean {
  const presetId = patch.editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID
  if (presetId !== DEFAULT_EDITION_PRESET_ID) return false
  if (patch.editionPreset?.modified === true) return false
  if (patch.editionPreset?.appliedAt !== undefined) return false
  if (patch.armorClass !== undefined) return false
  if (patch.attackResolution !== undefined) return false
  return true
}

function buildMechanicsUpdateSet(patch: CampaignMechanicsPatch): {
  $set: Record<string, unknown>
  $unset: Record<string, 1>
} {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  const prefix = MECHANICS_PREFIX

  if (isSparseDefaultMechanicsPatch(patch)) {
    return { $set, $unset: { mechanics: 1 } }
  }

  const presetId = patch.editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID
  const modified = patch.editionPreset?.modified === true
  const appliedAt = patch.editionPreset?.appliedAt

  if (presetId === DEFAULT_EDITION_PRESET_ID) {
    $unset[`${prefix}editionPreset.id`] = 1
  } else {
    $set[`${prefix}editionPreset.id`] = presetId
  }

  if (modified) {
    $set[`${prefix}editionPreset.modified`] = true
  } else {
    $unset[`${prefix}editionPreset.modified`] = 1
  }

  if (appliedAt !== undefined) {
    $set[`${prefix}editionPreset.appliedAt`] = new Date(appliedAt)
  } else {
    $unset[`${prefix}editionPreset.appliedAt`] = 1
  }

  if (patch.armorClass !== undefined) {
    $set[`${prefix}armorClass.mode`] = patch.armorClass.mode
    $set[`${prefix}armorClass.base`] = patch.armorClass.base
  } else {
    $unset[`${prefix}armorClass`] = 1
  }

  if (patch.attackResolution !== undefined) {
    $set[`${prefix}attackResolution.mode`] = patch.attackResolution.mode
  } else {
    $unset[`${prefix}attackResolution`] = 1
  }

  if (
    presetId === DEFAULT_EDITION_PRESET_ID &&
    !modified &&
    appliedAt === undefined &&
    patch.armorClass === undefined &&
    patch.attackResolution === undefined
  ) {
    return { $set: {}, $unset: { mechanics: 1 } }
  }

  return { $set, $unset }
}

async function applyMechanicsUpdate(
  campaignId: string,
  rulesetId: SystemRulesetId,
  patch: CampaignMechanicsPatch,
): Promise<void> {
  await getOrCreatePatchDocument(campaignId, rulesetId)

  const { $set, $unset } = buildMechanicsUpdateSet(patch)
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
  const mechanics = normalizeMechanicsPatchFromDoc(
    patchDoc?.mechanics as CampaignMechanicsPatch | undefined,
  )

  return {
    characterCreation: resolveCharacterCreationPatch(characterCreation),
    mechanics: resolveMechanicsPatch(mechanics),
  }
}

/** Merges a partial mechanics patch and persists sparse overrides. */
export async function updateMechanicsPatch(
  campaignId: string,
  input: UpdateCampaignMechanicsInput,
): Promise<RulesetPatchRead | null> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)

  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const existing = normalizeMechanicsPatchFromDoc(
    patchDoc?.mechanics as CampaignMechanicsPatch | undefined,
  )
  const merged = mergeMechanicsPatch(existing, input)

  await applyMechanicsUpdate(campaignId, rulesetId, merged)
  return getRulesetPatchRead(campaignId)
}

/** Default mechanics require no persisted overrides — resolved on read as 5e. */
export async function writeInitialMechanics(
  _campaignId: string,
  _rulesetId: SystemRulesetId,
): Promise<void> {
  // Intentionally sparse: resolveMechanicsPatch(undefined) applies 5e defaults.
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
