import {
  ATTACK_RESOLUTION_MODE_SET_ID,
  getAttackResolutionModeEntry,
  type ResolvedVocabularyOptionSet,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  buildLabelDescriptionActiveVocabulary,
  buildVocabularyFromSeedSet,
  type LabelDescriptionActiveVocabulary,
} from '../build-vocabulary-maps'

export type AttackResolutionModeVocabulary = LabelDescriptionActiveVocabulary

/** Build label/description/active-id maps from a resolved attack-resolution-modes set. */
export function buildAttackResolutionModeVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): AttackResolutionModeVocabulary {
  return buildLabelDescriptionActiveVocabulary(set)
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedAttackResolutionModeVocabulary(): AttackResolutionModeVocabulary {
  return buildVocabularyFromSeedSet(
    ATTACK_RESOLUTION_MODE_SET_ID,
    buildAttackResolutionModeVocabulary,
  )
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
