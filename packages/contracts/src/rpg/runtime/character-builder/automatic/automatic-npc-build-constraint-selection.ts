import type { CharacterClass } from '../../../content/classes/class'
import type { StartingEquipmentOption } from '../../../content/starting-equipment'
import { availableStartingEquipmentOptions } from '../../../content/starting-equipment-availability'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { resolvePlayableBuilderContent } from '../preview/resolve-playable-builder-content'
import { getChoiceSetStepId } from '../steps'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import {
  deriveEquipmentDraftEntries,
  inventoryContainsEquipmentId,
} from '../resolvers/equipment/derive-equipment-draft-entries'
import { ensureEquipmentGrant } from '../resolvers/equipment/ensure-equipment-grant'
import { optionIdentityKeys, optionIsHeld } from '../option-identity'
import type { NpcRecommendationSource, SourcedRecommendation } from '../sourced-recommendation'
import type { AutomaticNpcBuildConstraints } from './automatic-npc-build-constraints'
import type { AutomaticNpcBuildPreferences } from './automatic-npc-build-seed'
import { startingEquipmentOptionProvidesWeapon } from './list-reachable-starting-weapons'

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

  if (eligible.length > 0) return eligible.slice(0, needed)

  const fallback = choiceSet.options.map((option) => option.id).slice(0, needed)
  return fallback.length > 0 ? fallback : null
}

function preferenceEntriesForChoiceSet(
  choiceSet: ChoiceSet,
  preferences: AutomaticNpcBuildPreferences | undefined,
): readonly SourcedRecommendation[] {
  if (!preferences) return []
  if (choiceSet.choiceType === 'skillProficiency') return preferences.skills ?? []
  if (choiceSet.choiceType === 'toolProficiency') return preferences.tools ?? []
  if (choiceSet.choiceType === 'language') return preferences.languages ?? []
  return []
}

const HELD_SKIP_CHOICE_TYPES = new Set<ChoiceSet['choiceType']>([
  'skillProficiency',
  'toolProficiency',
  'language',
])

function choiceOptionIsHeld(
  choiceSet: ChoiceSet,
  optionId: string,
  heldKeys: ReadonlySet<string> | undefined,
): boolean {
  if (!HELD_SKIP_CHOICE_TYPES.has(choiceSet.choiceType)) return false
  if (!heldKeys || heldKeys.size === 0) return false
  return optionIsHeld(optionId, heldKeys)
}

function matchChoiceOption(choiceSet: ChoiceSet, idOrSlug: string): string | undefined {
  return choiceSet.options.find((option) => optionIdentityKeys(option.id).includes(idOrSlug))?.id
}

/**
 * Preference-then-canonical fill for one ChoiceSet.
 * Already-held options are skipped and do not satisfy the required count.
 * `suggestedBy` records the sources for each added id. Canonical order is `[]`.
 * Ids already present in `current` are not attributed.
 */
export function selectChoiceSetFill(args: {
  choiceSet: ChoiceSet
  current: readonly string[]
  preferences?: AutomaticNpcBuildPreferences
  heldKeys?: ReadonlySet<string>
  hardPreferredIds?: readonly string[]
}): {
  additions: string[]
  suggestedBy: Record<string, readonly NpcRecommendationSource[]>
} {
  const needed = Math.max(0, args.choiceSet.min - args.current.length)
  if (needed === 0) return { additions: [], suggestedBy: {} }

  const preferences = preferenceEntriesForChoiceSet(args.choiceSet, args.preferences)
  const selected = new Set(args.current)
  const additions: string[] = []
  const suggestedBy: Record<string, readonly NpcRecommendationSource[]> = {}

  function take(optionId: string, sources: readonly NpcRecommendationSource[] | undefined): void {
    if (additions.length >= needed) return
    if (selected.has(optionId) || additions.includes(optionId)) return
    if (choiceOptionIsHeld(args.choiceSet, optionId, args.heldKeys)) return
    additions.push(optionId)
    suggestedBy[optionId] = sources ? [...sources] : []
  }

  for (const optionId of args.hardPreferredIds ?? []) {
    if (!args.choiceSet.options.some((option) => option.id === optionId)) continue
    take(optionId, undefined)
  }

  for (const preference of preferences) {
    const optionId = matchChoiceOption(args.choiceSet, preference.id)
    if (!optionId) continue
    take(optionId, preference.sources)
  }

  for (const option of args.choiceSet.options) take(option.id, undefined)

  return { additions, suggestedBy }
}

/**
 * Fills one required ChoiceSet with hard constraints, then soft preferences,
 * then remaining first-eligible defaults in canonical resolver order.
 * Soft preferences never fail a build. Already-held options are skipped.
 */
export type ConstraintAwareChoiceFill = {
  draft: CharacterBuilderDraft
  /** Sources for ids this call added. Seeded ids are absent. */
  suggestedBy: Record<string, readonly NpcRecommendationSource[]>
}

export function fillChoiceSetWithConstraintAwareSelection(args: {
  draft: CharacterBuilderDraft
  choiceSet: ChoiceSet
  constraints: AutomaticNpcBuildConstraints | undefined
  preferences?: AutomaticNpcBuildPreferences
  heldKeys?: ReadonlySet<string>
  characterClass: CharacterClass | undefined
  catalogIndex: CharacterBuildCatalogIndex
}): ConstraintAwareChoiceFill | null {
  const { draft, choiceSet, constraints, preferences, heldKeys, characterClass, catalogIndex } =
    args
  const current = draft.choiceSelections[choiceSet.id] ?? []

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
    if (packageIds.length === 0) return { draft, suggestedBy: {} }
    const selections = [...current, ...packageIds]
    return {
      draft: {
        ...draft,
        choiceSelections: { ...draft.choiceSelections, [choiceSet.id]: selections },
      },
      suggestedBy: {},
    }
  }

  const filled = selectChoiceSetFill({
    choiceSet,
    current,
    preferences,
    heldKeys,
    hardPreferredIds: preferredConstraintOptionIds(choiceSet, constraints),
  })
  if (filled.additions.length === 0) return null
  const additions = filled.additions

  const selections = [...current, ...additions]
  return {
    draft: {
      ...draft,
      choiceSelections: { ...draft.choiceSelections, [choiceSet.id]: selections },
    },
    suggestedBy: filled.suggestedBy,
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

  const hasEligiblePackage = availableStartingEquipmentOptions(startingEquipment.options).some(
    (option) =>
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
  const inventory = deriveEquipmentDraftEntries(draft, catalogIndex)

  for (const weaponId of requiredWeaponIds) {
    if (inventoryContainsEquipmentId(inventory, weaponId)) continue
    const weapon = catalogIndex.equipment.get(weaponId)
    return constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')
  }
  return undefined
}

type RequiredWeaponGrantCompletion =
  | { ok: true; draft: CharacterBuilderDraft }
  | { ok: false; issues: CharacterBuildValidationIssue[] }

/**
 * After package/pool bias, applies domain ensure grants for required weapons still
 * missing from assembled inventory. Rejects campaign-unavailable ids before grant.
 */
export function applyRequiredWeaponEquipmentGrants(args: {
  draft: CharacterBuilderDraft
  constraints: AutomaticNpcBuildConstraints | undefined
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): RequiredWeaponGrantCompletion {
  const { draft, constraints, context, catalogIndex } = args
  if (!constraints || constraints.requiredWeaponIds.length === 0) {
    return { ok: true, draft }
  }

  const availableEquipmentIds = new Set(
    resolvePlayableBuilderContent(context).equipment.map((equipment) => equipment.id),
  )
  let nextDraft = draft

  for (const weaponId of constraints.requiredWeaponIds) {
    if (!availableEquipmentIds.has(weaponId)) {
      const weapon = catalogIndex.equipment.get(weaponId)
      return {
        ok: false,
        issues: [constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')],
      }
    }

    const inventory = deriveEquipmentDraftEntries(nextDraft, catalogIndex)
    if (inventoryContainsEquipmentId(inventory, weaponId)) continue

    const grantResult = ensureEquipmentGrant({
      draft: nextDraft,
      equipmentId: weaponId,
      quantity: 1,
      catalogIndex,
    })
    if (!grantResult.ok) {
      const weapon = catalogIndex.equipment.get(weaponId)
      return {
        ok: false,
        issues: [constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')],
      }
    }
    nextDraft = grantResult.draft
  }

  return { ok: true, draft: nextDraft }
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
