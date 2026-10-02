import { loadSeedVocabularyOptionSet } from '@rpg/catalog/vocabulary'
import {
  DEFAULT_SYSTEM_RULESET_ID,
  type ResolvedVocabularyOptionSet,
  type VocabularyOption,
  type VocabularyOptionSetId,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

export type LabelActiveVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
}

export type LabelDescriptionActiveVocabulary = LabelActiveVocabulary & {
  descriptionById: Record<string, string>
  optionById: Record<string, VocabularyOption>
}

/** Builds label and active-id maps from a resolved vocabulary set. */
export function buildLabelActiveVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): LabelActiveVocabulary {
  const labelById = Object.fromEntries(set.options.map((option) => [option.id, option.label]))
  const activeIds = new Set(
    set.options.filter((option) => option.status === 'active').map((option) => option.id),
  )
  return { labelById, activeIds }
}

/** Builds label, description, and active-id maps from a resolved vocabulary set. */
export function buildLabelDescriptionActiveVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): LabelDescriptionActiveVocabulary {
  const descriptionById = Object.fromEntries(
    set.options.map((option) => [option.id, option.description ?? '']),
  )
  const optionById = Object.fromEntries(set.options.map((option) => [option.id, option]))
  return { ...buildLabelActiveVocabulary(set), descriptionById, optionById }
}

/** Loads catalog seed options as an active resolved set for default-ruleset flows. */
export function buildSeedVocabularyOptions(setId: VocabularyOptionSetId) {
  const seed = loadSeedVocabularyOptionSet(DEFAULT_SYSTEM_RULESET_ID, setId)
  return seed.options.map((option) => ({
    ...option,
    source: 'system' as const,
    status: 'active' as const,
    usedBy: 0,
  }))
}

/** Builds vocabulary maps from the default ruleset seed for a set id. */
export function buildVocabularyFromSeedSet<T>(
  setId: VocabularyOptionSetId,
  build: (set: Pick<ResolvedVocabularyOptionSet, 'options'>) => T,
): T {
  return build({ options: buildSeedVocabularyOptions(setId) })
}

/** Alias for seed-only vocabulary map builders. */
export const buildSeedVocabulary = buildVocabularyFromSeedSet

/** Resolves a campaign label with id fallback when vocabulary is absent or unknown. */
export function getVocabularyLabel(
  vocabulary: LabelActiveVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}

/** Sorted combobox options from active vocabulary entries. */
export function buildActiveVocabularyFieldOptions(
  vocabulary: LabelActiveVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}
