import { getSeedCreatureTypeLanguageAffinities } from '@rpg/catalog/vocabulary'
import {
  CREATURE_TYPE_SET_ID,
  type SystemRulesetId,
  type UpdateVocabularyEntryInput,
  type VocabularyOptionSetId,
  type VocabularySystemEntryPatchEntry,
} from '@rpg/contracts'

export function vocabularySetsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  const left = [...a].sort()
  const right = [...b].sort()
  return left.every((value, index) => value === right[index])
}

export function assertCreatureTypeLanguageAffinitiesSetOnly(
  setId: VocabularyOptionSetId,
  languageAffinities: string[] | undefined,
): void {
  if (languageAffinities === undefined) {
    return
  }

  if (setId !== CREATURE_TYPE_SET_ID) {
    throw new Error('languageAffinities is only supported for creature-types vocabulary entries.')
  }
}

/** Omits patch key when system entry chips still match seed affinities. */
export function normalizeSystemCreatureTypeLanguageAffinitiesPatch(
  rulesetId: SystemRulesetId,
  entryId: string,
  submitted: string[] | undefined,
): Pick<UpdateVocabularyEntryInput, 'languageAffinities'> {
  if (submitted === undefined) {
    return {}
  }

  const seedAffinities = getSeedCreatureTypeLanguageAffinities(rulesetId, entryId)
  if (vocabularySetsEqual(submitted, seedAffinities)) {
    return {}
  }

  return { languageAffinities: submitted }
}

export function mergeSystemEntryLanguageAffinitiesPatch(
  rulesetId: SystemRulesetId,
  entryId: string,
  existing: VocabularySystemEntryPatchEntry,
  submitted: string[] | undefined,
): VocabularySystemEntryPatchEntry {
  if (submitted === undefined) {
    return existing
  }

  const normalized = normalizeSystemCreatureTypeLanguageAffinitiesPatch(
    rulesetId,
    entryId,
    submitted,
  )

  if (normalized.languageAffinities !== undefined) {
    return { ...existing, languageAffinities: normalized.languageAffinities }
  }

  const { languageAffinities: _removed, ...rest } = existing
  return rest as VocabularySystemEntryPatchEntry
}
