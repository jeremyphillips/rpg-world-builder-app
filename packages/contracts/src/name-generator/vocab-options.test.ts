import { describe, expect, it } from 'vitest'

import { SPELL_FUNCTION_TAG_ENTRIES } from '../rpg/vocab/spell/function-tag'
import { toVocabOptions } from './vocab-options'

describe('toVocabOptions', () => {
  it('maps vocab entries to value/label/description options', () => {
    expect(toVocabOptions(SPELL_FUNCTION_TAG_ENTRIES)).toEqual(
      Object.entries(SPELL_FUNCTION_TAG_ENTRIES).map(([value, entry]) => ({
        value,
        label: entry.label,
        description: entry.description,
      })),
    )
  })
})
