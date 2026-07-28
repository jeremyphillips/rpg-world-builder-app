import { describe, expect, it } from 'vitest'

import { PROFICIENCY_DOMAIN_ENTRIES } from '../../vocab/proficiency'
import { SKILL_PROFICIENCY_SENTENCE } from '../../vocab/proficiency-sentence'
import { getVocabularyTermLabel } from '../../vocab/types'
import { CONTENT_TYPE_CAPABILITIES } from './content-type-capabilities'
import { CONTENT_TYPE_KEYS } from './content-type-keys'
import {
  CONTENT_TYPE_TERMS,
  CONTENT_TYPE_TERM_KEYS,
  getContentTypeCapitalizedSentenceLabel,
  getContentTypeSentenceForm,
  getContentTypeTerm,
} from './content-type-terms'

describe('content type terms', () => {
  it('maps every content type key to a non-empty term', () => {
    expect(CONTENT_TYPE_TERM_KEYS).toEqual(CONTENT_TYPE_KEYS)
    expect(Object.keys(CONTENT_TYPE_TERMS).sort()).toEqual([...CONTENT_TYPE_KEYS].sort())
    expect(Object.keys(CONTENT_TYPE_CAPABILITIES).sort()).toEqual([...CONTENT_TYPE_KEYS].sort())

    for (const key of CONTENT_TYPE_KEYS) {
      const term = getContentTypeTerm(key)
      expect(getVocabularyTermLabel(term)).not.toBe('')
      expect(term.description).not.toBe('')
      expect(term.sentence).toBeDefined()
      if (!term.sentence) throw new Error(`${key} needs sentence forms`)
      if (!term.sentence.singular || !term.sentence.plural) {
        throw new Error(`${key} needs singular and plural sentence forms`)
      }
      expect(term.sentence.singular.trim()).not.toBe('')
      expect(term.sentence.plural.trim()).not.toBe('')
      if (term.compactLabel) {
        expect(term.compactLabel).not.toBe(term.label)
      }
    }
  })

  it('keeps skill proficiency grammar aligned between content-type and domain registries', () => {
    expect(CONTENT_TYPE_TERMS['skill-proficiencies'].sentence).toEqual(SKILL_PROFICIENCY_SENTENCE)
    expect(PROFICIENCY_DOMAIN_ENTRIES.skill.sentence).toEqual(SKILL_PROFICIENCY_SENTENCE)
  })

  it('resolves counted sentence forms for catalog prose', () => {
    expect(getContentTypeSentenceForm('species')).toBe('species')
    expect(getContentTypeSentenceForm('classes', 2)).toBe('classes')
    expect(getContentTypeCapitalizedSentenceLabel('classes')).toBe('Class')
    expect(getContentTypeCapitalizedSentenceLabel('classes', { plural: true })).toBe('Classes')
  })
})
