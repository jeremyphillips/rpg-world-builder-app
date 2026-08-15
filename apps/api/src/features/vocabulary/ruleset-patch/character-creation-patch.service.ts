import {
  computeStartingWealthSparsePatch,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_IMPORTED_CHARACTERS_POLICY,
  DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
  DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES,
  DEFAULT_LEVEL_ZERO_NPCS_ENABLED,
  DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
  DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES,
  DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS,
  DEFAULT_MULTICLASSING_ENABLED,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  DEFAULT_STARTING_LEVEL,
  DEFAULT_STANDARD_ARRAY,
  DEFAULT_SUBCLASS_CHOICES_ENABLED,
  MAX_CHARACTER_LEVEL,
  isDefaultCharacterCreationStandardArray,
  isSparseDefaultLevelZeroNpcsPatch,
  isSparseDefaultMulticlassingPatch,
  isSparseDefaultSubclassingPatch,
  mergeStartingWealthRulesPatch,
  normalizeCharacterWealthGrant,
  resolveStartingWealthRules,
  safeParseMergedCharacterCreationPatch,
  sameStandardArray,
  sameStringSet,
  validateSubclassChoicesEnabledChange,
} from '@rpg/contracts'
import type {
  CampaignCharacterCreationPatch,
  CampaignLevelZeroNpcsPatch,
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

function applyLevelZeroNpcsMerge(
  merged: CampaignCharacterCreationPatch,
  existing: CampaignCharacterCreationPatch | undefined,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.levelZeroNpcs === undefined) return
  merged.levelZeroNpcs = mergeLevelZeroNpcsPatch(existing?.levelZeroNpcs, input.levelZeroNpcs)
}

function applyStandardArrayMerge(
  merged: CampaignCharacterCreationPatch,
  input: UpdateCampaignCharacterCreationInput,
): void {
  if (input.standardArray === undefined) return
  merged.standardArray = input.standardArray
}

function mergeLevelZeroNpcsPatch(
  existing: CampaignLevelZeroNpcsPatch | undefined,
  input: CampaignLevelZeroNpcsPatch,
): CampaignLevelZeroNpcsPatch {
  return {
    ...(existing ?? {}),
    ...input,
  }
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
  applyLevelZeroNpcsMerge(merged, existing, input)
  applyStandardArrayMerge(merged, input)

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

function isDefaultEmptyGrantSet(grant: { categories?: string[]; items?: string[] }): boolean {
  return (grant.categories?.length ?? 0) === 0 && (grant.items?.length ?? 0) === 0
}

function isDefaultLevelZeroLanguageGrantSet(grant: {
  categories?: string[]
  items?: string[]
}): boolean {
  return (
    (grant.categories?.length ?? 0) === 0 &&
    sameStringSet(grant.items ?? [], DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES.items)
  )
}

function buildStandardArrayUpdateSet(
  ops: MongoUpdateOps,
  standardArray: number[] | undefined,
  prefix: string,
): void {
  if (standardArray === undefined) return

  if (!isDefaultCharacterCreationStandardArray(standardArray)) {
    ops.$set[`${prefix}standardArray`] = standardArray
  } else {
    ops.$unset[`${prefix}standardArray`] = 1
  }
}

function buildLevelZeroGrantSetUpdateSet(
  ops: MongoUpdateOps,
  prefix: string,
  grant: { categories: string[]; items: string[] } | undefined,
): void {
  if (grant === undefined || isDefaultEmptyGrantSet(grant)) {
    ops.$unset[`${prefix}.categories`] = 1
    ops.$unset[`${prefix}.items`] = 1
    ops.$unset[prefix] = 1
    return
  }

  if (grant.categories.length > 0) {
    ops.$set[`${prefix}.categories`] = grant.categories
  } else {
    ops.$unset[`${prefix}.categories`] = 1
  }

  if (grant.items.length > 0) {
    ops.$set[`${prefix}.items`] = grant.items
  } else {
    ops.$unset[`${prefix}.items`] = 1
  }
}

function buildLevelZeroLanguageProficienciesUpdateSet(
  ops: MongoUpdateOps,
  prefix: string,
  grant: { categories: string[]; items: string[] } | undefined,
): void {
  if (grant === undefined || isDefaultLevelZeroLanguageGrantSet(grant)) {
    ops.$unset[`${prefix}.categories`] = 1
    ops.$unset[`${prefix}.items`] = 1
    ops.$unset[prefix] = 1
    return
  }

  ops.$set[`${prefix}.items`] = grant.items
  ops.$unset[`${prefix}.categories`] = 1
}

function buildLevelZeroStartingWealthUpdateSet(
  ops: MongoUpdateOps,
  prefix: string,
  startingWealth: CampaignLevelZeroNpcsPatch['startingWealth'],
): void {
  const normalized = normalizeCharacterWealthGrant(startingWealth)
  if (normalized === undefined) {
    ops.$unset[prefix] = 1
    return
  }

  for (const denomination of ['cp', 'sp', 'gp', 'pp'] as const) {
    const value = normalized[denomination]
    const path = `${prefix}.${denomination}`
    if (value !== undefined) {
      ops.$set[path] = value
    } else {
      ops.$unset[path] = 1
    }
  }
}

function buildLevelZeroNpcsUpdateSet(
  ops: MongoUpdateOps,
  levelZeroNpcs: CampaignLevelZeroNpcsPatch,
  prefix: string,
): void {
  const l0Prefix = `${prefix}levelZeroNpcs`

  if (isSparseDefaultLevelZeroNpcsPatch(levelZeroNpcs)) {
    ops.$unset[l0Prefix] = 1
    return
  }

  sparseSetIfDiffers(
    ops,
    `${l0Prefix}.enabled`,
    levelZeroNpcs.enabled,
    DEFAULT_LEVEL_ZERO_NPCS_ENABLED,
  )
  sparseSetIfDiffers(
    ops,
    `${l0Prefix}.baseHitDie`,
    levelZeroNpcs.baseHitDie,
    DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
  )
  sparseSetIfDiffers(
    ops,
    `${l0Prefix}.proficiencyBonus`,
    levelZeroNpcs.proficiencyBonus,
    DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
  )
  sparseSetIfDiffers(
    ops,
    `${l0Prefix}.retainSpeciesTraits`,
    levelZeroNpcs.retainSpeciesTraits,
    DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS,
  )
  sparseSetIfDiffers(
    ops,
    `${l0Prefix}.retainSpeciesLanguages`,
    levelZeroNpcs.retainSpeciesLanguages,
    DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES,
  )

  if (levelZeroNpcs.armorProficiencies !== undefined) {
    buildLevelZeroGrantSetUpdateSet(
      ops,
      `${l0Prefix}.armorProficiencies`,
      levelZeroNpcs.armorProficiencies,
    )
  }

  if (levelZeroNpcs.weaponProficiencies !== undefined) {
    buildLevelZeroGrantSetUpdateSet(
      ops,
      `${l0Prefix}.weaponProficiencies`,
      levelZeroNpcs.weaponProficiencies,
    )
  }

  if (levelZeroNpcs.languageProficiencies !== undefined) {
    buildLevelZeroLanguageProficienciesUpdateSet(
      ops,
      `${l0Prefix}.languageProficiencies`,
      levelZeroNpcs.languageProficiencies,
    )
  }

  if ('startingWealth' in levelZeroNpcs) {
    buildLevelZeroStartingWealthUpdateSet(
      ops,
      `${l0Prefix}.startingWealth`,
      levelZeroNpcs.startingWealth,
    )
  }

  if (levelZeroNpcs.standardArray !== undefined) {
    if (!sameStandardArray(levelZeroNpcs.standardArray, DEFAULT_STANDARD_ARRAY)) {
      ops.$set[`${l0Prefix}.standardArray`] = levelZeroNpcs.standardArray
    } else {
      ops.$unset[`${l0Prefix}.standardArray`] = 1
    }
  }
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

  if (patch.levelZeroNpcs !== undefined) {
    buildLevelZeroNpcsUpdateSet(ops, patch.levelZeroNpcs, prefix)
  }

  buildStandardArrayUpdateSet(ops, patch.standardArray, prefix)

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
