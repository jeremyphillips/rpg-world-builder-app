import { CREATURE_FAMILY_SET_ID, type ResolvedVocabularyOptionSet } from '@rpg/contracts'
import {
  buildLabelDescriptionActiveVocabulary,
  buildVocabularyFromSeedSet,
} from '../build-vocabulary-maps'

export function buildCreatureFamilyVocabulary(set: Pick<ResolvedVocabularyOptionSet, 'options'>) {
  const base = buildLabelDescriptionActiveVocabulary(set)
  return { ...base, byId: new Map(set.options.map((row) => [row.id, row])) }
}
export type CreatureFamilyVocabulary = ReturnType<typeof buildCreatureFamilyVocabulary>

export function buildSeedCreatureFamilyVocabulary(): CreatureFamilyVocabulary {
  return buildVocabularyFromSeedSet(CREATURE_FAMILY_SET_ID, buildCreatureFamilyVocabulary)
}
