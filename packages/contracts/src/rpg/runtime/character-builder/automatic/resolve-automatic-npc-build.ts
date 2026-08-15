import { isClassProgressionApplicable } from '../progression/character-level-policy'
import { deriveDeterministicAbilityAssignment } from '../ability/ability-score-recommendations'
import { resolveAbilityGenerationMethod } from '../ability/ability-generation'
import { buildChoiceSetId, isChoiceSetSatisfied, type ChoiceSet } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { cloneEquipmentDraftChannel } from '../resolvers/equipment/equipment-draft-base'
import {
  formatMagicItemGrantIncompleteLabel,
  magicItemGrantIncompleteIssueCode,
} from '../resolvers/equipment/resolve-equipment-magic-item-grant-step-issues'
import { resolveMagicItemAcquisitionState } from '../resolvers/equipment/resolve-magic-item-acquisition-state'
import {
  readMagicItemSelections,
  resolveMagicItemAllowanceEligibility,
  resolveMagicItemGrantProgress,
  wouldViolateDuplicatePolicy,
} from '../resolvers/equipment/resolve-magic-item-grant-progress'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import { getChoiceSetStepId } from '../steps'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import type { MagicItemGrantSelection } from '../equipment/magic-item-selection'

import {
  fillChoiceSetWithConstraintAwareSelection,
  automaticNpcConstraintFailureIssue,
  applyRequiredWeaponEquipmentGrants,
  validateAutomaticNpcConstraintsSatisfied,
} from './automatic-npc-build-constraint-selection'
import {
  normalizeAutomaticNpcBuildConstraints,
  type AutomaticNpcBuildConstraints,
} from './automatic-npc-build-constraints'
import {
  validateAutomaticNpcBuildSeed,
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
  context: CharacterBuildContext
}

/**
 * Safety guard against resolver bugs only — termination is progress-based
 * (every iteration adds selections, marks equipment skipped once, or fails).
 */
const AUTOMATIC_BUILD_ITERATION_CEILING = 64

// Level 0 Quick NPC ability scores temporarily reuse the PC standard-array
// resolver with empty primary-ability priority — not Level 0 semantics.
function seedDraft(
  seed: AutomaticNpcBuildSeed,
  context: CharacterBuildContext,
): CharacterBuilderDraft {
  const abilityRules = context.characterCreationRules.abilityGeneration
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = seed.classId ? catalogIndex.classes.get(seed.classId) : undefined

  const empty = createEmptyCharacterBuilderDraft()
  return {
    ...empty,
    identity: { name: seed.name.trim(), alignment: seed.alignment },
    species: { speciesId: seed.speciesId },
    class: {
      ...(seed.classId && isClassProgressionApplicable(seed.level)
        ? { classId: seed.classId }
        : {}),
      level: seed.level,
    },
    abilities: {
      method: resolveAbilityGenerationMethod(abilityRules),
      scores: deriveDeterministicAbilityAssignment(
        characterClass?.primaryAbilities ?? [],
        abilityRules.standardArray,
      ),
    },
    equipment: cloneEquipmentDraftChannel(empty),
  }
}

function isEquipmentSkipped(draft: CharacterBuilderDraft): boolean {
  return draft.equipment?.skipped === true
}

function findUnsatisfiedRequiredChoiceSet(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): ChoiceSet | undefined {
  return choiceSets.find(
    (choiceSet) =>
      choiceSet.required &&
      !(isEquipmentSkipped(draft) && getChoiceSetStepId(choiceSet) === 'equipment') &&
      !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
  )
}

/**
 * Mirrors the builder's escape hatch: when the class's top-level starting
 * equipment ChoiceSet has no options, the build continues without starting
 * equipment (`equipment.skipped`) instead of failing.
 */
function isEmptyTopLevelStartingEquipmentChoiceSet(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
): boolean {
  return (
    choiceSet.options.length === 0 &&
    draft.class.classId !== undefined &&
    choiceSet.id === startingEquipmentChoiceSetId(draft.class.classId)
  )
}

function heritageChoiceSetIdFor(choiceSet: ChoiceSet): string {
  return buildChoiceSetId('species', choiceSet.sourceId, 'heritage')
}

function applyChoiceSetSelection(
  choiceSet: ChoiceSet,
  next: CharacterBuilderDraft,
): CharacterBuilderDraft {
  const selections = next.choiceSelections[choiceSet.id] ?? []

  // Heritage selections dual-write species.heritageId (mirrors the species step).
  if (choiceSet.sourceType === 'species' && choiceSet.id === heritageChoiceSetIdFor(choiceSet)) {
    return { ...next, species: { ...next.species, heritageId: selections[0] } }
  }

  return next
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
  context,
}: ResolveAutomaticNpcBuildArgs): AutomaticNpcBuildResult {
  const seedIssues = validateAutomaticNpcBuildSeed(seed, context)
  if (seedIssues.length > 0) return { ok: false, issues: seedIssues }

  const normalizedConstraints = normalizeAutomaticNpcBuildConstraints(constraints)

  let draft = seedDraft(seed, context)
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)

  for (let iteration = 0; iteration < AUTOMATIC_BUILD_ITERATION_CEILING; iteration += 1) {
    const choiceSets = resolveAvailableChoices(draft, context)
    const target = findUnsatisfiedRequiredChoiceSet(draft, choiceSets)

    if (!target) {
      const completion = completeMagicItemGrantSelections(draft, context)
      if (!completion.ok) return completion

      const grantCompletion = applyRequiredWeaponEquipmentGrants({
        draft: completion.draft,
        constraints: normalizedConstraints,
        context,
        catalogIndex,
      })
      if (!grantCompletion.ok) return grantCompletion

      const constraintIssue = validateAutomaticNpcConstraintsSatisfied(
        grantCompletion.draft,
        normalizedConstraints,
        catalogIndex,
      )
      if (constraintIssue) {
        return { ok: false, issues: [constraintIssue] }
      }

      return {
        ok: true,
        draft: grantCompletion.draft,
        resolvedChoiceSets: resolveAvailableChoices(grantCompletion.draft, context),
      }
    }

    if (isEmptyTopLevelStartingEquipmentChoiceSet(target, draft)) {
      draft = { ...draft, equipment: cloneEquipmentDraftChannel(draft, { skipped: true }) }
      continue
    }

    const characterClass =
      target.sourceType === 'class' ? catalogIndex.classes.get(target.sourceId) : undefined
    const next = fillChoiceSetWithConstraintAwareSelection({
      draft,
      choiceSet: target,
      constraints: normalizedConstraints,
      characterClass,
      catalogIndex,
    })
    if (next === null) {
      return {
        ok: false,
        issues: [automaticNpcConstraintFailureIssue(normalizedConstraints, target, catalogIndex)],
      }
    }
    draft = applyChoiceSetSelection(target, next)
  }

  return {
    ok: false,
    issues: [
      validationIssue(
        'automatic_resolution_stalled',
        characterBuilderValidationMessages.automaticResolutionStalled(),
      ),
    ],
  }
}
