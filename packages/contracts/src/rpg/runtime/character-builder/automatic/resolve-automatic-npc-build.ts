import { isClassProgressionApplicable } from '../progression/character-level-policy'
import { deriveDeterministicAbilityAssignment } from '../ability/ability-score-recommendations'
import { resolveAbilityGenerationMethod } from '../ability/ability-generation'
import { resolveBuilderStandardArray } from '../ability/resolve-builder-standard-array'
import { resolveClassAbilityScoreOrder } from '../ability/resolve-class-ability-score-order'
import { resolveStandardArrayAssignment } from '../../../primitives/standard-array'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import type { ChoiceSet } from '../choice-set'
import type { CharacterClass } from '../../../content/classes/class'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import {
  seedDraftClassPackage,
  type ClassPackageChoice,
} from '../resolvers/equipment/class-package-choice'
import { cloneEquipmentDraftChannel } from '../resolvers/equipment/equipment-draft-base'
import {
  formatMagicItemGrantIncompleteLabel,
  magicItemGrantIncompleteIssueCode,
} from '../resolvers/equipment/resolve-equipment-magic-item-grant-step-issues'
import { resolveMagicItemAcquisitionState } from '../resolvers/equipment/resolve-magic-item-acquisition-state'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import {
  readMagicItemSelections,
  resolveMagicItemAllowanceEligibility,
  resolveMagicItemGrantProgress,
  wouldViolateDuplicatePolicy,
} from '../resolvers/equipment/resolve-magic-item-grant-progress'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import type { MagicItemGrantSelection } from '../equipment/magic-item-selection'

import {
  applyManualEquipmentGrants,
  applyRequiredWeaponEquipmentGrants,
  validateAutomaticNpcConstraintsSatisfied,
} from './automatic-npc-build-constraint-selection'
import { resolveAutomaticChoiceSelections } from './resolve-automatic-choice-selections'
import {
  normalizeAutomaticNpcBuildConstraints,
  type AutomaticNpcBuildConstraints,
} from './automatic-npc-build-constraints'
import { ABILITY_IDS, type Ability } from '../../../vocab/ability'
import {
  validateAutomaticNpcBuildSeed,
  type AutomaticNpcBuildPreferences,
  type AutomaticNpcBuildSeed,
} from './automatic-npc-build-seed'

// ---------------------------------------------------------------------------
// resolveAutomaticNpcBuild — deterministically completes a character build
// draft from a compact seed. Required choices are filled through the same
// ChoiceSet registry the builder UI consumes: first eligible options in the
// canonical order the registered resolvers return, re-resolving after every
// commit so dependent ChoiceSets (heritage → traits, equipment package →
// pool picks) follow the normal dependency graph.
//
// The resolver does NOT run finalSubmit validation — final character validity
// is checked once, by finalize, after the caller applies contextual patches
// (e.g. organization membership connections).
//
// V1 is deliberately deterministic: same seed + same catalog → same draft.
// Randomized/preset strategies later supply richer seeds to this same entry
// point rather than a second assembly path.
// ---------------------------------------------------------------------------

export type AutomaticNpcBuildSuccess = {
  ok: true
  draft: CharacterBuilderDraft
  /** ChoiceSets resolved for the completed draft — pass as engine options to validation/finalize. */
  resolvedChoiceSets: ChoiceSet[]
}

export type AutomaticNpcBuildFailure = {
  ok: false
  issues: CharacterBuildValidationIssue[]
}

export type AutomaticNpcBuildResult = AutomaticNpcBuildSuccess | AutomaticNpcBuildFailure

export type ResolveAutomaticNpcBuildArgs = {
  seed: AutomaticNpcBuildSeed
  constraints?: AutomaticNpcBuildConstraints
  /** Soft ordering. Missing preferences fall through to canonical choice order. */
  preferences?: AutomaticNpcBuildPreferences
  /**
   * Complete allowance fills already decided by Starting choices.
   * Seeded before top-up so preference merging cannot replace or extend them.
   */
  allowanceSelections?: Record<string, readonly string[]>
  /** Caller-owned package decision seeded before automatic choice fill. */
  classPackage?: ClassPackageChoice
  /** Non-weapon equipment ids granted after automatic fill (armor, gear, magic items, …). */
  manualEquipmentGrantIds?: readonly string[]
  context: CharacterBuildContext
}

// Level 0 Quick NPC ability assignment uses the level-based standard array resolver.
function mergeClassAndTemplateAbilityOrder(
  classPrimary: readonly Ability[],
  templatePriority: readonly Ability[] | undefined,
): Ability[] {
  const seen = new Set<Ability>()
  const order: Ability[] = []
  const templateOrder = templatePriority ?? []

  for (const ability of classPrimary) {
    if (seen.has(ability)) continue
    seen.add(ability)
    order.push(ability)
  }
  for (const ability of templateOrder) {
    if (seen.has(ability)) continue
    seen.add(ability)
    order.push(ability)
  }
  for (const ability of ABILITY_IDS) {
    if (seen.has(ability)) continue
    order.push(ability)
  }
  return order
}

function seedAbilityScores(
  level: AutomaticNpcBuildSeed['level'],
  context: CharacterBuildContext,
  characterClass: CharacterClass | undefined,
  preferences: AutomaticNpcBuildPreferences | undefined,
): CharacterBuilderDraft['abilities']['scores'] {
  const standardArray = resolveBuilderStandardArray(context, level)
  const templatePriority = preferences?.abilityPriority

  if (level === 0) {
    if (templatePriority && templatePriority.length === ABILITY_IDS.length) {
      return resolveStandardArrayAssignment({
        standardArray,
        abilityScoreOrder: templatePriority,
      })
    }
    return deriveDeterministicAbilityAssignment([], standardArray)
  }

  if (characterClass && isClassProgressionApplicable(level)) {
    const classOrder = resolveClassAbilityScoreOrder({
      abilityScoreOrder: characterClass.characterCreation?.abilityScoreOrder,
      primaryAbilities: characterClass.primaryAbilities,
    })
    const order = templatePriority
      ? mergeClassAndTemplateAbilityOrder(characterClass.primaryAbilities, templatePriority)
      : classOrder
    return resolveStandardArrayAssignment({
      standardArray,
      abilityScoreOrder: order,
    })
  }

  return deriveDeterministicAbilityAssignment(characterClass?.primaryAbilities ?? [], standardArray)
}

export type AutomaticChoiceDraftSeed = {
  speciesId: string
  classId?: string
  level: AutomaticNpcBuildSeed['level']
  npcTemplateId?: AutomaticNpcBuildSeed['npcTemplateId']
  name?: string
  alignment?: AutomaticNpcBuildSeed['alignment']
  gender?: AutomaticNpcBuildSeed['gender']
}

/** Structural draft shared by automatic build and the starting-choice projection. */
export function seedAutomaticChoiceDraft(
  seed: AutomaticChoiceDraftSeed,
  context: CharacterBuildContext,
  preferences?: AutomaticNpcBuildPreferences,
): CharacterBuilderDraft {
  const abilityRules = context.characterCreationRules.abilityGeneration
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = seed.classId ? catalogIndex.classes.get(seed.classId) : undefined

  const empty = createEmptyCharacterBuilderDraft()
  return {
    ...empty,
    identity: {
      ...empty.identity,
      ...(seed.name !== undefined ? { name: seed.name.trim() } : {}),
      ...(seed.alignment !== undefined ? { alignment: seed.alignment } : {}),
      ...(seed.gender !== undefined ? { gender: seed.gender } : {}),
    },
    species: { speciesId: seed.speciesId },
    class: {
      ...(seed.classId && isClassProgressionApplicable(seed.level)
        ? { classId: seed.classId }
        : {}),
      level: seed.level,
    },
    ...(seed.npcTemplateId ? { npcTemplateId: seed.npcTemplateId } : {}),
    abilities: {
      method: resolveAbilityGenerationMethod(abilityRules),
      scores: seedAbilityScores(seed.level, context, characterClass, preferences),
    },
    equipment: cloneEquipmentDraftChannel(empty),
  }
}

type MagicItemGrantCompletion =
  | { ok: true; draft: CharacterBuilderDraft }
  | { ok: false; issues: CharacterBuildValidationIssue[] }

type MagicItemAllowance = Parameters<typeof resolveMagicItemGrantProgress>[0]['allowance']
type EquipmentPurchaseQuantity = { equipmentId: string; quantity: number }

/**
 * Fills one `exact` allowance with the first eligible catalog equipment until
 * its capacity is met, in catalog order. Returns the grown selection list and
 * whether capacity remains unmet.
 */
function fillAllowanceWithFirstEligible(args: {
  allowance: MagicItemAllowance
  selections: MagicItemGrantSelection[]
  purchases: EquipmentPurchaseQuantity[]
  context: CharacterBuildContext
}): { selections: MagicItemGrantSelection[]; remainingCapacity: number } {
  const { allowance, purchases, context } = args
  let selections = args.selections
  let progress = resolveMagicItemGrantProgress({ allowance, selections })

  for (const equipment of context.catalog.equipment) {
    if (progress.remainingCapacity <= 0) break

    const eligibility = resolveMagicItemAllowanceEligibility({ equipment, allowance, progress })
    const violatesDuplicatePolicy =
      eligibility.eligible &&
      wouldViolateDuplicatePolicy({
        equipment,
        equipmentId: equipment.id,
        selections,
        purchases,
        additionalQuantity: 1,
      })
    if (!eligibility.eligible || violatesDuplicatePolicy) continue

    selections = [
      ...selections,
      { allowanceId: allowance.id, equipmentId: equipment.id, quantity: 1 },
    ]
    progress = resolveMagicItemGrantProgress({ allowance, selections })
  }

  return { selections, remainingCapacity: progress.remainingCapacity }
}

function magicItemGrantIncompleteIssue(
  allowance: MagicItemAllowance,
  remainingCapacity: number,
): CharacterBuildValidationIssue {
  return validationIssue(
    magicItemGrantIncompleteIssueCode(allowance.id),
    characterBuilderValidationMessages.magicItemGrantIncomplete({
      rarityLabel: formatMagicItemGrantIncompleteLabel(allowance.rarity),
      remaining: remainingCapacity,
    }),
    {
      path: 'equipment.magicItemSelections',
      stepId: 'equipment',
      allowanceId: allowance.id,
    },
  )
}

/**
 * Fills required (`exact`) magic-item grant allowances with the first eligible
 * catalog equipment. `up_to` allowances are optional extras and stay empty.
 */
function completeMagicItemGrantSelections(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): MagicItemGrantCompletion {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const state = resolveMagicItemAcquisitionState({ draft, context, catalogIndex })
  if (state.allowances.length === 0) return { ok: true, draft }

  let selections: MagicItemGrantSelection[] = readMagicItemSelections(draft)
  const issues: CharacterBuildValidationIssue[] = []
  const purchases = (draft.equipment?.purchases ?? []).map((purchase) => ({
    equipmentId: purchase.equipmentId,
    quantity: purchase.quantity,
  }))

  for (const allowance of state.allowances) {
    if (allowance.requirement !== 'exact') continue

    const filled = fillAllowanceWithFirstEligible({ allowance, selections, purchases, context })
    selections = filled.selections
    if (filled.remainingCapacity > 0) {
      issues.push(magicItemGrantIncompleteIssue(allowance, filled.remainingCapacity))
    }
  }

  if (issues.length > 0) return { ok: false, issues }

  return {
    ok: true,
    draft: {
      ...draft,
      equipment: cloneEquipmentDraftChannel(draft, { magicItemSelections: selections }),
    },
  }
}

/**
 * Deterministically completes a character build draft from a compact seed.
 *
 * On success, the draft satisfies every required ChoiceSet; pass it (with
 * `resolvedChoiceSets`) through the normal finalize path — after applying any
 * contextual patches such as connections — for the single authoritative
 * finalSubmit validation.
 */
export function resolveAutomaticNpcBuild({
  seed,
  constraints,
  preferences,
  allowanceSelections,
  classPackage,
  manualEquipmentGrantIds,
  context,
}: ResolveAutomaticNpcBuildArgs): AutomaticNpcBuildResult {
  const seedIssues = validateAutomaticNpcBuildSeed(seed, context)
  if (seedIssues.length > 0) return { ok: false, issues: seedIssues }

  const normalizedConstraints = normalizeAutomaticNpcBuildConstraints(constraints)

  let draft = seedDraftClassPackage(
    seedAutomaticChoiceDraft(seed, context, preferences),
    classPackage,
  )
  if (allowanceSelections) {
    const choiceSelections = { ...draft.choiceSelections }
    for (const [choiceSetId, selectedIds] of Object.entries(allowanceSelections)) {
      choiceSelections[choiceSetId] = [...selectedIds]
    }
    draft = { ...draft, choiceSelections }
  }

  const choices = resolveAutomaticChoiceSelections({
    draft,
    context,
    preferences,
    constraints: normalizedConstraints,
  })
  if (!choices.ok) return choices

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const completion = completeMagicItemGrantSelections(choices.draft, context)
  if (!completion.ok) return completion

  const weaponGrantCompletion = applyRequiredWeaponEquipmentGrants({
    draft: completion.draft,
    constraints: normalizedConstraints,
    context,
    catalogIndex,
  })
  if (!weaponGrantCompletion.ok) return weaponGrantCompletion

  const manualGrantCompletion = applyManualEquipmentGrants({
    draft: weaponGrantCompletion.draft,
    equipmentIds: manualEquipmentGrantIds ?? [],
    context,
    catalogIndex,
  })
  if (!manualGrantCompletion.ok) return manualGrantCompletion

  const constraintIssue = validateAutomaticNpcConstraintsSatisfied(
    manualGrantCompletion.draft,
    normalizedConstraints,
    catalogIndex,
  )
  if (constraintIssue) {
    return { ok: false, issues: [constraintIssue] }
  }

  return {
    ok: true,
    draft: manualGrantCompletion.draft,
    resolvedChoiceSets: resolveAvailableChoices(manualGrantCompletion.draft, context),
  }
}
