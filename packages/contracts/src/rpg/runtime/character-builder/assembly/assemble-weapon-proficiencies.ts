import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterWeaponProficiencyEntry } from '../../character/proficiencies'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
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
  return characterClass.proficiencies.weapons.categories.map((weaponCategory) => ({
    weaponCategory,
    rank: 'proficient' as const,
    sources: CLASS_WEAPON_PROFICIENCY_SOURCE(characterClass.id),
  }))
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
): CharacterWeaponProficiencyEntry[] {
  const classEntries = characterClass ? classFixedWeaponProficiencies(characterClass) : []
  const grantEntries = assembleGrantWeaponProficiencyEntries(draft, catalogIndex, characterClass)
  const selectedEntries = selectedWeaponProficiencies(draft, catalogIndex, choiceSets)

  return mergeWeaponProficiencyEntries([...classEntries, ...grantEntries, ...selectedEntries])
}
