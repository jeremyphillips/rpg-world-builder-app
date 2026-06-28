import { loadSeedVocabularyOptionSet } from '@rpg/catalog/vocabulary'
import {
  DEFAULT_SYSTEM_RULESET_ID,
  EDITION_PRESET_ENTRIES,
  EDITION_PRESET_SET_ID,
  getEditionPresetEntry,
  type ResolvedVocabularyOptionSet,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

export type EditionPresetVocabulary = {
  labelById: Record<string, string>
  descriptionById: Record<string, string>
  activeIds: ReadonlySet<string>
}

/** Build label/description/active-id maps from a resolved edition-presets set. */
export function buildEditionPresetVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): EditionPresetVocabulary {
  const labelById = Object.fromEntries(set.options.map((option) => [option.id, option.label]))
  const descriptionById = Object.fromEntries(
    set.options.map((option) => [option.id, option.description ?? '']),
  )
  const activeIds = new Set(
    set.options.filter((option) => option.status === 'active').map((option) => option.id),
  )
  return { labelById, descriptionById, activeIds }
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedEditionPresetVocabulary(): EditionPresetVocabulary {
  const seed = loadSeedVocabularyOptionSet(DEFAULT_SYSTEM_RULESET_ID, EDITION_PRESET_SET_ID)
  return buildEditionPresetVocabulary({
    options: seed.options.map((option) => ({
      ...option,
      source: 'system' as const,
      status: 'active' as const,
      usedBy: 0,
    })),
  })
}

export function buildEditionPresetFieldOptions(
  vocabulary: EditionPresetVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []

  return [...vocabulary.activeIds].sort().map((id) => {
    const reference =
      getEditionPresetEntry(id) ?? EDITION_PRESET_ENTRIES[id as keyof typeof EDITION_PRESET_ENTRIES]
    return {
      value: id,
      label: vocabulary.labelById[id] ?? reference?.label ?? id,
      description: vocabulary.descriptionById[id] || reference?.description,
      meta: reference?.meta ? [...reference.meta] : undefined,
    }
  })
}
