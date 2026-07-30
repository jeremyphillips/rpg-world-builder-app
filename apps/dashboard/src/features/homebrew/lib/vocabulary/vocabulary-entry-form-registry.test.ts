import { describe, expect, it } from 'vitest'

import { vocabularySetIdsRequiringFormDefinition } from '@rpg/contracts'

import {
  assertVocabularyFormRegistryCoverage,
  VOCABULARY_ENTRY_FORM_REGISTRY,
} from './vocabulary-entry-form-registry'

describe('vocabulary entry form registry', () => {
  it('registers form defs for every create/edit-enabled set', () => {
    expect(() => assertVocabularyFormRegistryCoverage()).not.toThrow()
  })

  it('covers creature-types in the production registry', () => {
    for (const setId of vocabularySetIdsRequiringFormDefinition()) {
      expect(VOCABULARY_ENTRY_FORM_REGISTRY[setId]).toBeDefined()
    }
  })
})
