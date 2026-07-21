import { describe, expect, it } from 'vitest'

import { collectTermVariants } from './collect-term-variants'
import { resolveContentTypeTarget, resolveVocabularySetTarget } from './resolve-term-target'

describe('collectTermVariants', () => {
  it('collects content-type forms including the derived collection label', () => {
    expect(collectTermVariants(resolveContentTypeTarget('skill-proficiencies'))).toEqual(
      expect.arrayContaining([
        { form: 'label', value: 'Skill Proficiency' },
        { form: 'singular', value: 'skill proficiency' },
        { form: 'plural', value: 'skill proficiencies' },
        { form: 'derived_collection_label', value: 'Skill Proficiencies' },
      ]),
    )
  })

  it('omits compact labels by default and collection labels for vocabulary sets', () => {
    const variants = collectTermVariants(resolveVocabularySetTarget('creature-types'))
    expect(variants.map((variant) => variant.form)).not.toContain('derived_collection_label')
    expect(variants.map((variant) => variant.form)).not.toContain('compact_label')
  })
})
