import { getVocabularyOptionSetTerm } from './vocabulary-option-set-terms'
import { getVocabularySetCapability } from './vocabulary-set-capabilities'
import { vocabularyTermLabel, type VocabularyTerm } from './types'
import { VOCABULARY_OPTION_SET_IDS, type VocabularyOptionSetId } from './vocabulary'

/** Sets excluded from Game Terms — reachable only via internal consumers (rules config, etc.). */
export const VOCABULARY_INTERNAL_ONLY_SET_IDS = [
  'edition-presets',
  'attack-resolution-modes',
] as const satisfies readonly VocabularyOptionSetId[]

export type VocabularyInternalOnlySetId = (typeof VOCABULARY_INTERNAL_ONLY_SET_IDS)[number]

/** Product-facing category metadata for Game Terms hub, sidebar, and route guards. */
export type VocabularyCategory = {
  setId: VocabularyOptionSetId
  label: string
  description: string
  order: number
  browse: boolean
  internalOnly: boolean
}

function titleCaseWords(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase())
}

/** Hub / navigation label — title-cased plural taxonomy name. */
export function vocabularyCategoryHubLabel(term: VocabularyTerm): string {
  const phrase = vocabularyTermLabel(term, { number: 'plural', casing: 'sentence' })
  return titleCaseWords(phrase)
}

function isInternalOnlySetId(setId: VocabularyOptionSetId): boolean {
  return (VOCABULARY_INTERNAL_ONLY_SET_IDS as readonly VocabularyOptionSetId[]).includes(setId)
}

/** Explicit public browse order — excludes internal-only sets. */
export const BROWSABLE_VOCABULARY_SET_ORDER = VOCABULARY_OPTION_SET_IDS.filter(
  (setId) => !isInternalOnlySetId(setId),
)

function buildVocabularyCategory(setId: VocabularyOptionSetId, order: number): VocabularyCategory {
  const internalOnly = isInternalOnlySetId(setId)
  const term = getVocabularyOptionSetTerm(setId)
  return {
    setId,
    label: vocabularyCategoryHubLabel(term),
    description: term.description,
    order,
    browse: internalOnly ? false : getVocabularySetCapability(setId).browse,
    internalOnly,
  }
}

/** Every known set with category metadata — includes internal-only (browse false). */
export const VOCABULARY_CATEGORIES: readonly VocabularyCategory[] = VOCABULARY_OPTION_SET_IDS.map(
  (setId, index) => buildVocabularyCategory(setId, index),
)

/** Browsable categories in hub display order. */
export const BROWSABLE_VOCABULARY_CATEGORIES: readonly VocabularyCategory[] =
  BROWSABLE_VOCABULARY_SET_ORDER.map((setId, order) => buildVocabularyCategory(setId, order))

export function getVocabularyCategory(setId: VocabularyOptionSetId): VocabularyCategory {
  const browseOrder = BROWSABLE_VOCABULARY_SET_ORDER.indexOf(setId)
  return buildVocabularyCategory(
    setId,
    browseOrder >= 0 ? browseOrder : VOCABULARY_OPTION_SET_IDS.indexOf(setId),
  )
}

export function findBrowsableVocabularyCategory(setId: string): VocabularyCategory | undefined {
  const category = VOCABULARY_CATEGORIES.find((entry) => entry.setId === setId)
  if (!category || !category.browse || category.internalOnly) {
    return undefined
  }
  return category
}
