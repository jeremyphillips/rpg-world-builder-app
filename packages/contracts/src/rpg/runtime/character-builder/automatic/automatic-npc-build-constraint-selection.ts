import type { CharacterClass } from '../../../content/classes/class'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { getChoiceSetStepId } from '../steps'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import type { AutomaticNpcBuildConstraints } from './automatic-npc-build-constraints'
import { startingEquipmentOptionProvidesWeapon } from './list-reachable-starting-weapons'

function preferredConstraintOptionIds(
  choiceSet: ChoiceSet,
  constraints: AutomaticNpcBuildConstraints | undefined,
): string[] {
  const preferred: string[] = []
  if (!constraints) return preferred

  if (
    constraints.requiredSpellId &&
    (choiceSet.choiceType === 'spell' || choiceSet.choiceType === 'cantrip') &&
    choiceSet.options.some((option) => option.id === constraints.requiredSpellId)
  ) {
    preferred.push(constraints.requiredSpellId)
  }

  if (
    constraints.requiredWeaponId &&
    choiceSet.choiceType === 'equipment' &&
    choiceSet.options.some((option) => option.id === constraints.requiredWeaponId)
  ) {
    preferred.push(constraints.requiredWeaponId)
  }

  return preferred
}

function selectStartingEquipmentPackageIds(args: {
  choiceSet: ChoiceSet
  current: readonly string[]
  constraints: AutomaticNpcBuildConstraints
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): string[] | null {
  const { choiceSet, current, constraints, characterClass, catalogIndex } = args
  const needed = Math.max(0, choiceSet.min - current.length)
  if (needed === 0) return []

  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment || !constraints.requiredWeaponId) return null

  const eligible = choiceSet.options
    .map((option) => option.id)
    .filter((optionId) => {
      const option = startingEquipment.options.find((entry) => entry.id === optionId)
      if (!option) return false
      return startingEquipmentOptionProvidesWeapon({
        option,
        weaponId: constraints.requiredWeaponId!,
        characterClass,
        catalogIndex,
      })
    })

  if (eligible.length === 0) return null
  return eligible.slice(0, needed)
}

/**
 * Fills one required ChoiceSet with constraint-aware first picks, then remaining
 * first-eligible defaults in canonical resolver order.
 */
export function fillChoiceSetWithConstraintAwareSelection(args: {
  draft: CharacterBuilderDraft
  choiceSet: ChoiceSet
  constraints: AutomaticNpcBuildConstraints | undefined
  characterClass: CharacterClass | undefined
  catalogIndex: CharacterBuildCatalogIndex
}): CharacterBuilderDraft | null {
  const { draft, choiceSet, constraints, characterClass, catalogIndex } = args
  const current = draft.choiceSelections[choiceSet.id] ?? []
  const selectedIds = new Set(current)

  if (
    constraints?.requiredWeaponId &&
    characterClass &&
    choiceSet.id === startingEquipmentChoiceSetId(characterClass.id)
  ) {
    const packageIds = selectStartingEquipmentPackageIds({
      choiceSet,
      current,
      constraints,
      characterClass,
      catalogIndex,
    })
    if (packageIds === null) return null
    if (packageIds.length === 0) return draft
    const selections = [...current, ...packageIds]
    return {
      ...draft,
      choiceSelections: { ...draft.choiceSelections, [choiceSet.id]: selections },
    }
  }

  const preferredIds = preferredConstraintOptionIds(choiceSet, constraints)
  const canonicalOrder = choiceSet.options.map((option) => option.id)
  const orderedEligible = [
    ...preferredIds.filter((optionId) => !selectedIds.has(optionId)),
    ...canonicalOrder.filter(
      (optionId) => !selectedIds.has(optionId) && !preferredIds.includes(optionId),
    ),
  ]
  const additions = orderedEligible.slice(0, Math.max(0, choiceSet.min - current.length))
  if (additions.length === 0) return null

  const selections = [...current, ...additions]
  return {
    ...draft,
    choiceSelections: { ...draft.choiceSelections, [choiceSet.id]: selections },
  }
}

function unsatisfiedChoiceSetIssue(choiceSet: ChoiceSet): CharacterBuildValidationIssue {
  return validationIssue(
    'choice_set_unsatisfied',
    characterBuilderValidationMessages.choiceSetUnsatisfied({
      label: choiceSet.label,
      min: choiceSet.min,
    }),
    { stepId: getChoiceSetStepId(choiceSet), choiceSetId: choiceSet.id },
  )
}

function constraintUnsatisfiableIssue(constraintLabel: string): CharacterBuildValidationIssue {
  return validationIssue(
    'automatic_constraint_unsatisfiable',
    characterBuilderValidationMessages.automaticConstraintUnsatisfiable({ constraintLabel }),
    { stepId: 'equipment' },
  )
}

function weaponConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (!constraints.requiredWeaponId || choiceSet.sourceType !== 'class') return undefined
  const characterClass = catalogIndex.classes.get(choiceSet.sourceId)
  if (!characterClass || choiceSet.id !== startingEquipmentChoiceSetId(characterClass.id)) {
    return undefined
  }
  const weapon = catalogIndex.equipment.get(constraints.requiredWeaponId)
  return constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')
}

function spellConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (!constraints.requiredSpellId) return undefined
  if (choiceSet.choiceType !== 'spell' && choiceSet.choiceType !== 'cantrip') return undefined
  const spell = catalogIndex.spells.get(constraints.requiredSpellId)
  const fallback = choiceSet.choiceType === 'cantrip' ? 'cantrip' : 'spell'
  return constraintUnsatisfiableIssue(spell?.name ?? fallback)
}

export function automaticNpcConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints | undefined,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue {
  if (constraints) {
    const weaponIssue = weaponConstraintFailureIssue(constraints, choiceSet, catalogIndex)
    if (weaponIssue) return weaponIssue
    const spellIssue = spellConstraintFailureIssue(constraints, choiceSet, catalogIndex)
    if (spellIssue) return spellIssue
  }

  return unsatisfiedChoiceSetIssue(choiceSet)
}
