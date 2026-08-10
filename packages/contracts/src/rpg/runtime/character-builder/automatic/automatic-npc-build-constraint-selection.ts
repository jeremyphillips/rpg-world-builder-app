import type { CharacterClass } from '../../../content/classes/class'
import type { StartingEquipmentOption } from '../../../content/starting-equipment'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { getChoiceSetStepId } from '../steps'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import type { AutomaticNpcBuildConstraints } from './automatic-npc-build-constraints'
import {
  startingEquipmentOptionProvidesWeapon,
  isRequiredStartingWeaponSatisfiedInDraft,
} from './list-reachable-starting-weapons'

function preferredConstraintOptionIds(
  choiceSet: ChoiceSet,
  constraints: AutomaticNpcBuildConstraints | undefined,
): string[] {
  const preferred: string[] = []
  if (!constraints) return preferred

  for (const spellId of constraints.requiredSpellIds) {
    if (
      (choiceSet.choiceType === 'spell' || choiceSet.choiceType === 'cantrip') &&
      choiceSet.options.some((option) => option.id === spellId)
    ) {
      preferred.push(spellId)
    }
  }

  for (const weaponId of constraints.requiredWeaponIds) {
    if (
      choiceSet.choiceType === 'equipment' &&
      choiceSet.options.some((option) => option.id === weaponId)
    ) {
      preferred.push(weaponId)
    }
  }

  const canonicalOrder = choiceSet.options.map((option) => option.id)
  return preferred.sort(
    (left, right) => canonicalOrder.indexOf(left) - canonicalOrder.indexOf(right),
  )
}

function startingPackageProvidesAllRequiredWeapons(args: {
  option: StartingEquipmentOption
  requiredWeaponIds: readonly string[]
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  return args.requiredWeaponIds.every((weaponId) =>
    startingEquipmentOptionProvidesWeapon({
      option: args.option,
      weaponId,
      characterClass: args.characterClass,
      catalogIndex: args.catalogIndex,
    }),
  )
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
  if (!startingEquipment || constraints.requiredWeaponIds.length === 0) return null

  const eligible = choiceSet.options
    .map((option) => option.id)
    .filter((optionId) => {
      const option = startingEquipment.options.find((entry) => entry.id === optionId)
      if (!option) return false
      return startingPackageProvidesAllRequiredWeapons({
        option,
        requiredWeaponIds: constraints.requiredWeaponIds,
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
    constraints &&
    constraints.requiredWeaponIds.length > 0 &&
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
  if (constraints.requiredWeaponIds.length === 0 || choiceSet.sourceType !== 'class') {
    return undefined
  }
  const characterClass = catalogIndex.classes.get(choiceSet.sourceId)
  if (!characterClass || choiceSet.id !== startingEquipmentChoiceSetId(characterClass.id)) {
    return undefined
  }

  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return undefined

  const hasEligiblePackage = startingEquipment.options.some((option) =>
    startingPackageProvidesAllRequiredWeapons({
      option,
      requiredWeaponIds: constraints.requiredWeaponIds,
      characterClass,
      catalogIndex,
    }),
  )
  if (hasEligiblePackage) return undefined

  const firstWeaponId = constraints.requiredWeaponIds[0]
  const weapon = firstWeaponId ? catalogIndex.equipment.get(firstWeaponId) : undefined
  return constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')
}

function spellConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (constraints.requiredSpellIds.length === 0) return undefined
  if (choiceSet.choiceType !== 'spell' && choiceSet.choiceType !== 'cantrip') return undefined

  const unsatisfiedSpellId = constraints.requiredSpellIds.find(
    (spellId) => !choiceSet.options.some((option) => option.id === spellId),
  )
  if (!unsatisfiedSpellId) return undefined

  const spell = catalogIndex.spells.get(unsatisfiedSpellId)
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

function collectChoiceSelectionIds(draft: CharacterBuilderDraft): Set<string> {
  const selectedIds = new Set<string>()
  for (const selections of Object.values(draft.choiceSelections)) {
    for (const optionId of selections ?? []) {
      selectedIds.add(optionId)
    }
  }
  return selectedIds
}

function validateRequiredSpellsSatisfied(
  selectedIds: ReadonlySet<string>,
  requiredSpellIds: readonly string[],
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  for (const spellId of requiredSpellIds) {
    if (selectedIds.has(spellId)) continue
    const spell = catalogIndex.spells.get(spellId)
    return constraintUnsatisfiableIssue(spell?.name ?? 'spell')
  }
  return undefined
}

function validateRequiredWeaponsSatisfied(
  draft: CharacterBuilderDraft,
  requiredWeaponIds: readonly string[],
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  const characterClass = catalogIndex.classes.get(draft.class.classId ?? '')
  if (!characterClass) return undefined

  for (const weaponId of requiredWeaponIds) {
    if (
      isRequiredStartingWeaponSatisfiedInDraft({
        weaponId,
        draft,
        characterClass,
        catalogIndex,
      })
    ) {
      continue
    }
    const weapon = catalogIndex.equipment.get(weaponId)
    return constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')
  }
  return undefined
}

/** Verifies every hard requirement id appears in the resolved draft choice selections. */
export function validateAutomaticNpcConstraintsSatisfied(
  draft: CharacterBuilderDraft,
  constraints: AutomaticNpcBuildConstraints | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (!constraints) return undefined

  const selectedIds = collectChoiceSelectionIds(draft)
  const spellIssue = validateRequiredSpellsSatisfied(
    selectedIds,
    constraints.requiredSpellIds,
    catalogIndex,
  )
  if (spellIssue) return spellIssue

  return validateRequiredWeaponsSatisfied(draft, constraints.requiredWeaponIds, catalogIndex)
}
