import { DAMAGE_TYPE_SET_ID, type ResolvedVocabularyOptionSet } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import { buildLabelActiveVocabulary, buildVocabularyFromSeedSet } from '../build-vocabulary-maps'

export type DamageTypeVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
}

/** Build label/active-id maps from a resolved damage-types set. */
export function buildDamageTypeVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): DamageTypeVocabulary {
  return buildLabelActiveVocabulary(set)
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedDamageTypeVocabulary(): DamageTypeVocabulary {
  return buildVocabularyFromSeedSet(DAMAGE_TYPE_SET_ID, buildDamageTypeVocabulary)
}

export function buildActiveDamageTypeFieldOptions(
  vocabulary: DamageTypeVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}

export function getDamageTypeLabelFromVocabulary(
  vocabulary: DamageTypeVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}
