import type { ResolvedVocabularyOptionSet, VocabularyOptionSetId } from '@rpg/contracts'

import {
  buildActiveVocabularyFieldOptions,
  buildLabelActiveVocabulary,
  buildVocabularyFromSeedSet,
  getVocabularyLabel,
  type LabelActiveVocabulary,
} from '../build-vocabulary-maps'

export type { LabelActiveVocabulary }

/** Shared helpers for browse sets that only need label + active-id maps. */
export function createLabelVocabularySetHelpers(setId: VocabularyOptionSetId) {
  const build = (set: Pick<ResolvedVocabularyOptionSet, 'options'>): LabelActiveVocabulary =>
    buildLabelActiveVocabulary(set)

  return {
    build,
    buildSeed: () => buildVocabularyFromSeedSet(setId, build),
    buildActiveFieldOptions: buildActiveVocabularyFieldOptions,
    getLabel: getVocabularyLabel,
  }
}
