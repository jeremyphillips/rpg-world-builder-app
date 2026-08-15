import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterWeaponProficiencyEntry } from '../../character/proficiencies'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { isBuilderLevelZeroClassless } from '../progression/character-level-policy'
import { levelZeroBaselineWeaponEntries } from './level-zero-baseline-proficiency-entries'
import { assembleGrantWeaponProficiencyEntries } from './assemble-grant-proficiencies'
import { selectionSourceFromChoiceSet } from './selection-source-from-choice-set'

// ---------------------------------------------------------------------------
// Character Builder weapon proficiency finalization — merges class-fixed and
// grant-derived weapons with ChoiceSet selections and provenance.
// ---------------------------------------------------------------------------

const CLASS_WEAPON_PROFICIENCY_SOURCE = (classId: string) => [
  { kind: 'classFeature' as const, sourceId: classId, grantId: 'weapon-proficiencies' },
]

function classFixedWeaponProficiencies(
  characterClass: CharacterClass,
): CharacterWeaponProficiencyEntry[] {
  const weapons = characterClass.proficiencies.weapons

  const fromCategories = weapons.categories.map((weaponCategory) => ({
    weaponCategory,
    rank: 'proficient' as const,
    sources: CLASS_WEAPON_PROFICIENCY_SOURCE(characterClass.id),
  }))

  const fromItems = weapons.items.map((weaponId) => ({
    weaponId,
    rank: 'proficient' as const,
    sources: CLASS_WEAPON_PROFICIENCY_SOURCE(characterClass.id),
  }))

  return [...fromCategories, ...fromItems]
}

/** Resolves a weapon slug from a ChoiceSet option id or catalog equipment row. */
export function resolveWeaponIdFromOption(
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const equipment = catalogIndex.equipment.get(optionId)
  if (equipment?.kind === 'weapon') return equipment.slug

  const colonIndex = optionId.indexOf(':')
  return colonIndex >= 0 ? optionId.slice(colonIndex + 1) : optionId
}

function selectedWeaponProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
): CharacterWeaponProficiencyEntry[] {
  const entries: CharacterWeaponProficiencyEntry[] = []

  for (const choiceSet of choiceSets) {
    if (choiceSet.choiceType !== 'weaponProficiency') continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const optionId of selections) {
      entries.push({
        weaponId: resolveWeaponIdFromOption(optionId, catalogIndex),
        rank: 'proficient',
        sources: selectionSourceFromChoiceSet(choiceSet),
      })
    }
  }

  return entries
}

function mergeKey(entry: CharacterWeaponProficiencyEntry): string {
  return entry.weaponId ? `weapon:${entry.weaponId}` : `category:${entry.weaponCategory}`
}

/** Merges weapon proficiency rows, combining sources when the same target appears twice. */
export function mergeWeaponProficiencyEntries(
  entries: CharacterWeaponProficiencyEntry[],
): CharacterWeaponProficiencyEntry[] {
  const byTarget = new Map<string, CharacterWeaponProficiencyEntry>()

  for (const entry of entries) {
    const key = mergeKey(entry)
    const existing = byTarget.get(key)
    if (!existing) {
      byTarget.set(key, entry)
      continue
    }

    byTarget.set(key, {
      ...entry,
      rank: entry.rank === 'mastery' || existing.rank === 'mastery' ? 'mastery' : 'proficient',
      sources: [...(existing.sources ?? []), ...(entry.sources ?? [])],
    })
  }

  return [...byTarget.values()]
}

/** Returns finalized weapon proficiency rows for preview/finalization. */
export function assembleWeaponProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
  context?: CharacterBuildContext,
): CharacterWeaponProficiencyEntry[] {
  const classEntries = characterClass ? classFixedWeaponProficiencies(characterClass) : []
  const grantEntries = assembleGrantWeaponProficiencyEntries(draft, catalogIndex, characterClass)
  const selectedEntries = selectedWeaponProficiencies(draft, catalogIndex, choiceSets)
  const levelZeroEntries =
    context && isBuilderLevelZeroClassless(draft, context)
      ? levelZeroBaselineWeaponEntries(context.characterCreationRules.levelZeroNpcs)
      : []

  return mergeWeaponProficiencyEntries([
    ...levelZeroEntries,
    ...classEntries,
    ...grantEntries,
    ...selectedEntries,
  ])
}
