import {
  CREATURE_SIZE_SET_ID,
  creatureSizeSchema,
  getCreatureSizeLabel,
  sortCreatureSizes,
  type CreatureSize,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(CREATURE_SIZE_SET_ID)

export type SizeVocabulary = LabelActiveVocabulary

export const buildSizeVocabulary = helpers.build
export const buildSeedSizeVocabulary = helpers.buildSeed
export const getSizeLabelFromVocabulary = helpers.getLabel

function isCreatureSize(id: string): id is CreatureSize {
  return creatureSizeSchema.safeParse(id).success
}

/**
 * Active sizes plus saved sizes that are no longer active, ordered once by descending rank.
 * An inactive size is included only when it is already selected.
 */
export function buildActiveSizeFieldOptions(
  vocabulary: SizeVocabulary | undefined,
  selectedIds: readonly string[] = [],
): FieldOption[] {
  const activeIds = vocabulary ? [...vocabulary.activeIds] : []
  const included = new Set<CreatureSize>()
  for (const id of activeIds) {
    if (isCreatureSize(id)) included.add(id)
  }
  for (const id of selectedIds) {
    if (!isCreatureSize(id)) continue
    if (vocabulary && vocabulary.activeIds.has(id)) continue
    included.add(id)
  }
  return sortCreatureSizes([...included]).map((id) => ({
    value: id,
    label: vocabulary?.labelById[id] ?? getCreatureSizeLabel(id),
  }))
}
