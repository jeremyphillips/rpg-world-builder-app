import { loadSeedVocabularyOptionSet } from '@rpg/catalog/vocabulary'
import {
  CREATURE_TYPE_SET_ID,
  DEFAULT_SYSTEM_RULESET_ID,
  type ResolvedVocabularyOptionSet,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

export type CreatureTypeVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
}

/** Build label/active-id maps from a resolved creature-types set. */
export function buildCreatureTypeVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): CreatureTypeVocabulary {
  const labelById = Object.fromEntries(set.options.map((option) => [option.id, option.label]))
  const activeIds = new Set(
    set.options.filter((option) => option.status === 'active').map((option) => option.id),
  )
  return { labelById, activeIds }
}

/** Default ruleset seed vocabulary for flows without a campaign id (e.g. create wizard). */
export function buildSeedCreatureTypeVocabulary(): CreatureTypeVocabulary {
  const seed = loadSeedVocabularyOptionSet(DEFAULT_SYSTEM_RULESET_ID, CREATURE_TYPE_SET_ID)
  return buildCreatureTypeVocabulary({
    options: seed.options.map((option) => ({
      ...option,
      source: 'system' as const,
      status: 'active' as const,
      usedBy: 0,
    })),
  })
}

export function buildActiveCreatureTypeFieldOptions(
  vocabulary: CreatureTypeVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}

export function getCreatureTypeLabel(
  vocabulary: CreatureTypeVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}
