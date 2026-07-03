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
  DEFAULT_SUBCLASS_CHOICES_ENABLED,
  MAX_CHARACTER_LEVEL,
  isSparseDefaultMulticlassingPatch,
  isSparseDefaultSubclassingPatch,
  mergeStartingWealthRulesPatch,
  resolveStartingWealthRules,
  safeParseMergedCharacterCreationPatch,
  sameStringSet,
  validateSubclassChoicesEnabledChange,
} from '@rpg/contracts'
import type {
  CampaignCharacterCreationPatch,
  CampaignMulticlassingPatch,
  CampaignSubclassingPatch,
  CreatureTypePolicy,
  ImportedCharactersPolicy,
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

function mergeProgressionPatch(
  existing: CampaignCharacterCreationPatch['progression'] | undefined,
  input: NonNullable<UpdateCampaignCharacterCreationInput['progression']>,
): NonNullable<CampaignCharacterCreationPatch['progression']> {
  const merged = {
    ...(existing ?? {}),
    ...input,
  }

  if ('extendedProgression' in input) return merged

  const { extendedProgression: _removed, ...withoutExtended } = merged
  return withoutExtended
}

function applyStartingLevelMerge(
  merged: CampaignCharacterCreationPatch,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.startingLevel === undefined) return
  merged.startingLevel = input.startingLevel
}

function applyImportedCharactersMerge(
  merged: CampaignCharacterCreationPatch,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.importedCharacters === undefined) return
  merged.importedCharacters = input.importedCharacters
}

function applyProgressionMerge(
  merged: CampaignCharacterCreationPatch,
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.progression === undefined) return
  merged.progression = mergeProgressionPatch(existing?.progression, input.progression)
}

function applySpeciesMerge(
  merged: CampaignCharacterCreationPatch,
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.species === undefined) return
  merged.species = {
    ...(existing?.species ?? {}),
    ...input.species,
  }
}

function applyMulticlassingMerge(
  merged: CampaignCharacterCreationPatch,
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.multiclassing === undefined) return
  merged.multiclassing = mergeMulticlassingPatch(existing?.multiclassing, input.multiclassing)
}

function applySubclassingMerge(
  merged: CampaignCharacterCreationPatch,
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.subclasses === undefined) return
  merged.subclasses = mergeSubclassingPatch(existing?.subclasses, input.subclasses)
}

function applyStartingWealthMerge(
  merged: CampaignCharacterCreationPatch,
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.startingWealth === undefined) return
  merged.startingWealth = mergeStartingWealthRulesPatch(
    existing?.startingWealth,
    input.startingWealth,
  )
}

function mergeCharacterCreationPatch(
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): CampaignCharacterCreationPatch {
  const merged: CampaignCharacterCreationPatch = {
    ...(existing ?? {}),
  }

  applyStartingLevelMerge(merged, input)
  applyImportedCharactersMerge(merged, input)
  applyProgressionMerge(merged, existing, input)
  applySpeciesMerge(merged, existing, input)
  applyMulticlassingMerge(merged, existing, input)
  applySubclassingMerge(merged, existing, input)
  applyStartingWealthMerge(merged, existing, input)

  return merged
}

function mergeSubclassingPatch(
  existing: CampaignSubclassingPatch | undefined,
  input: CampaignSubclassingPatch,
): CampaignSubclassingPatch {
  return {
    ...(existing ?? {}),
    ...input,
  }
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

function buildStartingLevelUpdateSet(
  ops: MongoUpdateOps,
  startingLevel: number | undefined,
  prefix: string,
): void {
  if (startingLevel === undefined) return

  if (startingLevel !== DEFAULT_STARTING_LEVEL) {
    ops.$set[`${prefix}startingLevel`] = startingLevel
  } else {
    ops.$unset[`${prefix}startingLevel`] = 1
  }
}

function buildImportedCharactersUpdateSet(
  ops: MongoUpdateOps,
  policy: ImportedCharactersPolicy | undefined,
  prefix: string,
): void {
  if (policy === undefined) return

  if (policy !== DEFAULT_IMPORTED_CHARACTERS_POLICY) {
    ops.$set[`${prefix}importedCharacters.policy`] = policy
  } else {
    ops.$unset[`${prefix}importedCharacters`] = 1
  }
}

function buildProgressionUpdateSet(
  ops: MongoUpdateOps,
  progression: NonNullable<CampaignCharacterCreationPatch['progression']>,
  prefix: string,
): void {
  const maxLevel = progression.maxCharacterLevel
  if (maxLevel !== undefined) {
    if (maxLevel !== MAX_CHARACTER_LEVEL) {
      ops.$set[`${prefix}progression.maxCharacterLevel`] = maxLevel
    } else {
      ops.$unset[`${prefix}progression.maxCharacterLevel`] = 1
    }
  }

  const extended = progression.extendedProgression
  if (extended) {
    ops.$set[`${prefix}progression.extendedProgression.tierName`] = extended.tierName
    ops.$set[`${prefix}progression.extendedProgression.maxLevel`] = extended.maxLevel
  } else {
    ops.$unset[`${prefix}progression.extendedProgression`] = 1
  }
}

function buildSpeciesCreatureTypePolicyUpdateSet(
  ops: MongoUpdateOps,
  creaturePolicy: CreatureTypePolicy,
  prefix: string,
): void {
  if (!isDefaultCreatureTypePolicy(creaturePolicy)) {
    ops.$set[`${prefix}species.creatureTypePolicy.mode`] = creaturePolicy.mode
    ops.$set[`${prefix}species.creatureTypePolicy.ids`] = creaturePolicy.ids
    return
  }

  ops.$unset[`${prefix}species.creatureTypePolicy`] = 1
  ops.$unset[`${prefix}species`] = 1
}

function buildStartingWealthUpdateSet(
  ops: MongoUpdateOps,
  startingWealth: NonNullable<CampaignCharacterCreationPatch['startingWealth']>,
  rulesetId: SystemRulesetId,
  prefix: string,
): void {
  const seed = getStandardStartingWealthRules(rulesetId)
  const resolved = resolveStartingWealthRules(seed, startingWealth)
  const sparse = computeStartingWealthSparsePatch(resolved, seed)
  sparseSetOrUnset(ops, `${prefix}startingWealth`, sparse)
}

function buildCharacterCreationUpdateSet(
  patch: CampaignCharacterCreationPatch,
  rulesetId: SystemRulesetId,
): MongoUpdateOps {
  const ops: MongoUpdateOps = { $set: {}, $unset: {} }
  const prefix = CHARACTER_CREATION_PREFIX

  buildStartingLevelUpdateSet(ops, patch.startingLevel, prefix)
  buildImportedCharactersUpdateSet(ops, patch.importedCharacters?.policy, prefix)

  if (patch.progression !== undefined) {
    buildProgressionUpdateSet(ops, patch.progression, prefix)
  }

  const creaturePolicy = patch.species?.creatureTypePolicy
  if (creaturePolicy !== undefined) {
    buildSpeciesCreatureTypePolicyUpdateSet(ops, creaturePolicy, prefix)
  }

  if (patch.multiclassing !== undefined) {
    buildMulticlassingUpdateSet(ops, patch.multiclassing, prefix)
  }

  if (patch.subclasses !== undefined) {
    buildSubclassingUpdateSet(ops, patch.subclasses, prefix)
  }

  if (patch.startingWealth !== undefined) {
    buildStartingWealthUpdateSet(ops, patch.startingWealth, rulesetId, prefix)
  }

  return ops
}

function buildSubclassingUpdateSet(
  ops: MongoUpdateOps,
  subclassing: CampaignSubclassingPatch,
  prefix: string,
): void {
  const subclassingPrefix = `${prefix}subclasses`

  if (isSparseDefaultSubclassingPatch(subclassing)) {
    ops.$unset[subclassingPrefix] = 1
    return
  }

  sparseSetIfDiffers(
    ops,
    `${subclassingPrefix}.enabled`,
    subclassing.enabled,
    DEFAULT_SUBCLASS_CHOICES_ENABLED,
  )
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

function assertSubclassChoicesChangeAllowed(input: UpdateCampaignCharacterCreationInput): void {
  if (input.subclasses?.enabled === undefined) return

  const result = validateSubclassChoicesEnabledChange()
  if (!result.valid) {
    throw HttpError.badRequest(
      result.message ?? 'Subclass choice changes are not allowed for this campaign.',
    )
  }
}

/** Writes initial character-creation patch values when a campaign is created. */
export async function writeInitialCharacterCreation(
  campaignId: string,
  rulesetId: SystemRulesetId,
  input: UpdateCampaignCharacterCreationInput,
): Promise<void> {
  await assertCreatureTypePolicyIds(campaignId, input)
  assertSubclassChoicesChangeAllowed(input)
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
  assertSubclassChoicesChangeAllowed(input)

  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const existing = patchDoc?.characterCreation as CampaignCharacterCreationPatch | undefined
  const merged = mergeCharacterCreationPatch(existing, input)

  assertMergedCharacterCreationPatch(merged, rulesetId)

  await applyCharacterCreationUpdate(campaignId, rulesetId, merged)
}
