import { loadSeedVocabularyOptionSet } from '@rpg/catalog/vocabulary'
import {
  ATTACK_RESOLUTION_MODE_SET_ID,
  DEFAULT_SYSTEM_RULESET_ID,
  getAttackResolutionModeEntry,
  type ResolvedVocabularyOptionSet,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

export type AttackResolutionModeVocabulary = {
  labelById: Record<string, string>
  descriptionById: Record<string, string>
  activeIds: ReadonlySet<string>
}

/** Build label/description/active-id maps from a resolved attack-resolution-modes set. */
export function buildAttackResolutionModeVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): AttackResolutionModeVocabulary {
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
export function buildSeedAttackResolutionModeVocabulary(): AttackResolutionModeVocabulary {
  const seed = loadSeedVocabularyOptionSet(DEFAULT_SYSTEM_RULESET_ID, ATTACK_RESOLUTION_MODE_SET_ID)
  return buildAttackResolutionModeVocabulary({
    options: seed.options.map((option) => ({
      ...option,
      source: 'system' as const,
      status: 'active' as const,
      usedBy: 0,
    })),
  })
}

export function buildAttackResolutionModeFieldOptions(
  vocabulary: AttackResolutionModeVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []

  return [...vocabulary.activeIds].sort().map((id) => {
    const reference = getAttackResolutionModeEntry(id)
    return {
      value: id,
      label: vocabulary.labelById[id] ?? reference?.label ?? id,
      description: vocabulary.descriptionById[id] || reference?.description,
    }
  })
}
