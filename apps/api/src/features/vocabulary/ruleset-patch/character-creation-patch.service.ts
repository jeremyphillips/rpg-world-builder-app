import {
  computeStartingWealthSparsePatch,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_IMPORTED_CHARACTERS_POLICY,
  DEFAULT_MULTICLASSING_ENABLED,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  DEFAULT_STARTING_LEVEL,
  MAX_CHARACTER_LEVEL,
  isSparseDefaultMulticlassingPatch,
  mergeStartingWealthRulesPatch,
  resolveStartingWealthRules,
  safeParseMergedCharacterCreationPatch,
  sameStringSet,
} from '@rpg/contracts'
import type {
  CampaignCharacterCreationPatch,
  CampaignMulticlassingPatch,
  CreatureTypePolicy,
  SystemRulesetId,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { assertCreatureTypesActiveInCampaign } from '../lib/assert-campaign-creature-types'
import { HttpError } from '../../../lib/http-error'
import {
  applySparsePatchUpdate,
  loadPatchDocument,
  requireCampaignRuleset,
  type SparsePatchUpdateOps,
} from '../lib/patch-document'
import { sparseSetIfDiffers, sparseSetOrUnset } from './sparse-patch-helpers'

const CHARACTER_CREATION_PREFIX = 'characterCreation.'

type MongoUpdateOps = SparsePatchUpdateOps

function isDefaultCreatureTypePolicy(policy: CreatureTypePolicy | undefined): boolean {
  if (!policy) return true
  return (
    policy.mode === 'only' && sameStringSet(policy.ids, DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES)
  )
}

function mergeMulticlassingPatch(
  existing: CampaignMulticlassingPatch | undefined,
  input: CampaignMulticlassingPatch,
): CampaignMulticlassingPatch {
  const merged: CampaignMulticlassingPatch = {
    ...(existing ?? {}),
    ...input,
  }

  if (input.requirements !== undefined) {
    const prevReq = existing?.requirements ?? {}
    const nextReq = input.requirements
    merged.requirements = {
      ...prevReq,
      ...nextReq,
    }

    if (nextReq.primaryAbilityMinimum !== undefined) {
      merged.requirements.primaryAbilityMinimum = {
        ...(prevReq.primaryAbilityMinimum ?? {}),
        ...nextReq.primaryAbilityMinimum,
      }
    }

    if (nextReq.speciesPolicy !== undefined) {
      merged.requirements.speciesPolicy = {
        ...(prevReq.speciesPolicy ?? {}),
        ...nextReq.speciesPolicy,
      }
    }

    if (nextReq.speciesLevelLimits !== undefined) {
      merged.requirements.speciesLevelLimits = {
        ...(prevReq.speciesLevelLimits ?? {}),
        ...nextReq.speciesLevelLimits,
      }
    }
  }

  return merged
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

  if (input.multiclassing !== undefined) {
    merged.multiclassing = mergeMulticlassingPatch(existing?.multiclassing, input.multiclassing)
  }

  if (input.startingWealth !== undefined) {
    merged.startingWealth = mergeStartingWealthRulesPatch(
      existing?.startingWealth,
      input.startingWealth,
    )
  }

  return merged
}

function buildPrimaryAbilityMinimumUpdateSet(
  ops: MongoUpdateOps,
  pam: NonNullable<
    NonNullable<CampaignMulticlassingPatch['requirements']>['primaryAbilityMinimum']
  >,
  reqPrefix: string,
): void {
  sparseSetIfDiffers(
    ops,
    `${reqPrefix}.primaryAbilityMinimum.enabled`,
    pam.enabled,
    DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  )
  sparseSetIfDiffers(
    ops,
    `${reqPrefix}.primaryAbilityMinimum.minimumScore`,
    pam.minimumScore,
    DEFAULT_PRIMARY_ABILITY_MINIMUM,
  )
}

function buildMulticlassingRequirementsUpdateSet(
  ops: MongoUpdateOps,
  requirements: NonNullable<CampaignMulticlassingPatch['requirements']>,
  reqPrefix: string,
): void {
  if (requirements.primaryAbilityMinimum !== undefined) {
    buildPrimaryAbilityMinimumUpdateSet(ops, requirements.primaryAbilityMinimum, reqPrefix)
  }

  if (requirements.speciesPolicy !== undefined) {
    sparseSetIfDiffers(
      ops,
      `${reqPrefix}.speciesPolicy.enabled`,
      requirements.speciesPolicy.enabled,
      DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
    )
  }

  if (requirements.speciesLevelLimits !== undefined) {
    sparseSetIfDiffers(
      ops,
      `${reqPrefix}.speciesLevelLimits.enabled`,
      requirements.speciesLevelLimits.enabled,
      DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
    )
  }
}

function buildMulticlassingUpdateSet(
  ops: MongoUpdateOps,
  multiclassing: CampaignMulticlassingPatch,
  prefix: string,
): void {
  const mcPrefix = `${prefix}multiclassing`

  if (isSparseDefaultMulticlassingPatch(multiclassing)) {
    ops.$unset[mcPrefix] = 1
    return
  }

  sparseSetIfDiffers(
    ops,
    `${mcPrefix}.enabled`,
    multiclassing.enabled,
    DEFAULT_MULTICLASSING_ENABLED,
  )

  if (multiclassing.requirements !== undefined) {
    buildMulticlassingRequirementsUpdateSet(
      ops,
      multiclassing.requirements,
      `${mcPrefix}.requirements`,
    )
  }
}

function buildCharacterCreationUpdateSet(
  patch: CampaignCharacterCreationPatch,
  rulesetId: SystemRulesetId,
): MongoUpdateOps {
  const ops: MongoUpdateOps = { $set: {}, $unset: {} }
  const prefix = CHARACTER_CREATION_PREFIX

  if (patch.startingLevel !== undefined) {
    if (patch.startingLevel !== DEFAULT_STARTING_LEVEL) {
      ops.$set[`${prefix}startingLevel`] = patch.startingLevel
    } else {
      ops.$unset[`${prefix}startingLevel`] = 1
    }
  }

  const policy = patch.importedCharacters?.policy
  if (policy !== undefined) {
    if (policy !== DEFAULT_IMPORTED_CHARACTERS_POLICY) {
      ops.$set[`${prefix}importedCharacters.policy`] = policy
    } else {
      ops.$unset[`${prefix}importedCharacters`] = 1
    }
  }

  if (patch.progression !== undefined) {
    const maxLevel = patch.progression.maxCharacterLevel
    if (maxLevel !== undefined) {
      if (maxLevel !== MAX_CHARACTER_LEVEL) {
        ops.$set[`${prefix}progression.maxCharacterLevel`] = maxLevel
      } else {
        ops.$unset[`${prefix}progression.maxCharacterLevel`] = 1
      }
    }

    const extended = patch.progression.extendedProgression
    if (extended) {
      ops.$set[`${prefix}progression.extendedProgression.tierName`] = extended.tierName
      ops.$set[`${prefix}progression.extendedProgression.maxLevel`] = extended.maxLevel
    } else {
      ops.$unset[`${prefix}progression.extendedProgression`] = 1
    }
  }

  const creaturePolicy = patch.species?.creatureTypePolicy
  if (creaturePolicy !== undefined) {
    if (!isDefaultCreatureTypePolicy(creaturePolicy)) {
      ops.$set[`${prefix}species.creatureTypePolicy.mode`] = creaturePolicy.mode
      ops.$set[`${prefix}species.creatureTypePolicy.ids`] = creaturePolicy.ids
    } else {
      ops.$unset[`${prefix}species.creatureTypePolicy`] = 1
      ops.$unset[`${prefix}species`] = 1
    }
  }

  if (patch.multiclassing !== undefined) {
    buildMulticlassingUpdateSet(ops, patch.multiclassing, prefix)
  }

  if (patch.startingWealth !== undefined) {
    const seed = getStandardStartingWealthRules(rulesetId)
    const resolved = resolveStartingWealthRules(seed, patch.startingWealth)
    const sparse = computeStartingWealthSparsePatch(resolved, seed)
    sparseSetOrUnset(ops, `${prefix}startingWealth`, sparse)
  }

  return ops
}

function assertMergedCharacterCreationPatch(
  merged: CampaignCharacterCreationPatch,
  rulesetId: SystemRulesetId,
): void {
  const seed = getStandardStartingWealthRules(rulesetId)
  const parsed = safeParseMergedCharacterCreationPatch(merged, seed)

  if (!parsed.success) {
    throw HttpError.badRequest('Invalid character creation patch.', parsed.error.flatten())
  }
}

async function applyCharacterCreationUpdate(
  campaignId: string,
  rulesetId: SystemRulesetId,
  patch: CampaignCharacterCreationPatch,
): Promise<void> {
  await applySparsePatchUpdate(
    campaignId,
    rulesetId,
    buildCharacterCreationUpdateSet(patch, rulesetId),
  )
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
  const merged = mergeCharacterCreationPatch(undefined, input)
  assertMergedCharacterCreationPatch(merged, rulesetId)
  await applyCharacterCreationUpdate(campaignId, rulesetId, merged)
}

/** Merges a partial character-creation patch and persists sparse overrides. */
export async function updateCharacterCreationPatch(
  campaignId: string,
  input: UpdateCampaignCharacterCreationInput,
): Promise<void> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  await assertCreatureTypePolicyIds(campaignId, input)

  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const existing = patchDoc?.characterCreation as CampaignCharacterCreationPatch | undefined
  const merged = mergeCharacterCreationPatch(existing, input)

  assertMergedCharacterCreationPatch(merged, rulesetId)

  await applyCharacterCreationUpdate(campaignId, rulesetId, merged)
}
