import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { isNonEmptyCharacterBuilderDraft } from './is-non-empty-character-builder-draft'

describe('isNonEmptyCharacterBuilderDraft', () => {
  it('returns false for the empty template', () => {
    expect(isNonEmptyCharacterBuilderDraft(createEmptyCharacterBuilderDraft())).toBe(false)
  })

  it('returns true when identity has progress', () => {
    expect(
      isNonEmptyCharacterBuilderDraft({
        ...createEmptyCharacterBuilderDraft(),
        identity: { name: 'Verna' },
      }),
    ).toBe(true)
  })

  it('returns true when only narrative fields are filled', () => {
    expect(
      isNonEmptyCharacterBuilderDraft({
        ...createEmptyCharacterBuilderDraft(),
        identity: { narrative: { backstory: 'A soldier.' } },
      }),
    ).toBe(true)
  })
})
