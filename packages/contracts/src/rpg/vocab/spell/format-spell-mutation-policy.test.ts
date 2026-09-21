import { describe, expect, it } from 'vitest'

import { formatSpellMutationCopyParts } from './format-spell-mutation-policy'

describe('formatSpellMutationCopyParts', () => {
  it('returns null for immutable policies', () => {
    expect(formatSpellMutationCopyParts({ kind: 'none' })).toBeNull()
  })

  it('formats long rest full-list replacement', () => {
    expect(
      formatSpellMutationCopyParts({ kind: 'replace', trigger: 'longRest', limit: 'all' }),
    ).toEqual({
      trigger: 'after a long rest',
      replaceCount: 'all',
    })
  })

  it('formats long rest single replacement', () => {
    expect(
      formatSpellMutationCopyParts({ kind: 'replace', trigger: 'longRest', limit: 1 }),
    ).toEqual({
      trigger: 'after a long rest',
      replaceCount: 1,
    })
  })

  it('formats level-up replacement counts', () => {
    expect(formatSpellMutationCopyParts({ kind: 'replace', trigger: 'levelUp', limit: 1 })).toEqual(
      {
        trigger: 'when you gain a class level',
        replaceCount: 1,
      },
    )

    expect(formatSpellMutationCopyParts({ kind: 'replace', trigger: 'levelUp', limit: 2 })).toEqual(
      {
        trigger: 'when you gain a class level',
        replaceCount: 2,
      },
    )
  })
})
