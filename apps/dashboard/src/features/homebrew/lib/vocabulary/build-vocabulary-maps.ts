import { loadSeedVocabularyOptionSet } from '@rpg/catalog/vocabulary'
import {
  DEFAULT_SYSTEM_RULESET_ID,
  type ResolvedVocabularyOptionSet,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

export type LabelActiveVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
}

export type LabelDescriptionActiveVocabulary = LabelActiveVocabulary & {
  descriptionById: Record<string, string>
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
  return { ...buildLabelActiveVocabulary(set), descriptionById }
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
