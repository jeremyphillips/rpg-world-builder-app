import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterToolProficiencyEntry } from '../../character/proficiencies'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'

// ---------------------------------------------------------------------------
// Character Builder tool proficiency finalization — merges class-fixed tools
// with ChoiceSet selections and provenance.
// ---------------------------------------------------------------------------

const CLASS_TOOL_PROFICIENCY_SOURCE = (classId: string): CharacterSelectionSource[] => [
  { kind: 'classFeature', sourceId: classId, grantId: 'tool-proficiencies' },
]

function classFixedToolProficiencies(
  characterClass: CharacterClass,
): CharacterToolProficiencyEntry[] {
  const tools = characterClass.proficiencies.tools ?? { categories: [], items: [] }

  const fromCategories = tools.categories.map((toolCategory) => ({
    toolCategory,
    rank: 'proficient' as const,
    sources: CLASS_TOOL_PROFICIENCY_SOURCE(characterClass.id),
  }))

  const fromItems = tools.items.map((toolId) => ({
    toolId,
    rank: 'proficient' as const,
    sources: CLASS_TOOL_PROFICIENCY_SOURCE(characterClass.id),
  }))

  return [...fromCategories, ...fromItems]
}

function toolProficiencySource(choiceSet: ChoiceSet): CharacterSelectionSource[] {
  return [{ kind: 'classFeature', sourceId: choiceSet.sourceId, grantId: choiceSet.id }]
}

/** Resolves a tool slug from a ChoiceSet option id or catalog equipment row. */
export function resolveToolIdFromOption(
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const equipment = catalogIndex.equipment.get(optionId)
  if (equipment) return equipment.slug

  const colonIndex = optionId.indexOf(':')
  return colonIndex >= 0 ? optionId.slice(colonIndex + 1) : optionId
}

function selectedToolProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
): CharacterToolProficiencyEntry[] {
  const entries: CharacterToolProficiencyEntry[] = []

  for (const choiceSet of choiceSets) {
    if (choiceSet.choiceType !== 'toolProficiency') continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const optionId of selections) {
      entries.push({
        toolId: resolveToolIdFromOption(optionId, catalogIndex),
        rank: 'proficient',
        sources: toolProficiencySource(choiceSet),
      })
    }
  }

  return entries
}

function mergeKey(entry: CharacterToolProficiencyEntry): string {
  return entry.toolId ? `tool:${entry.toolId}` : `category:${entry.toolCategory}`
}

/** Merges tool proficiency rows, combining sources when the same tool appears twice. */
export function mergeToolProficiencyEntries(
  entries: CharacterToolProficiencyEntry[],
): CharacterToolProficiencyEntry[] {
  const byTarget = new Map<string, CharacterToolProficiencyEntry>()

  for (const entry of entries) {
    const key = mergeKey(entry)
    const existing = byTarget.get(key)
    if (!existing) {
      byTarget.set(key, entry)
      continue
    }

    byTarget.set(key, {
      ...entry,
      rank:
        entry.rank === 'expertise' || existing.rank === 'expertise' ? 'expertise' : 'proficient',
      sources: [...(existing.sources ?? []), ...(entry.sources ?? [])],
    })
  }

  return [...byTarget.values()]
}

/** Returns finalized tool proficiency rows from class-fixed grants and ChoiceSet picks. */
export function assembleToolProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
): CharacterToolProficiencyEntry[] {
  if (!characterClass) return []

  return mergeToolProficiencyEntries([
    ...classFixedToolProficiencies(characterClass),
    ...selectedToolProficiencies(draft, catalogIndex, choiceSets),
  ])
}
