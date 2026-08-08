import { describe, expect, it } from 'vitest'

import { composeFormLeaveDirty } from './form-leave-dirty'

describe('composeFormLeaveDirty', () => {
  it('returns false when all signals are clean', () => {
    expect(
      composeFormLeaveDirty({
        dirtyFields: {},
        extraUnsavedEdits: false,
        campaignAccessDirty: false,
        subclassEdits: false,
      }),
    ).toBe(false)
  })

  it('returns true when body fields are dirty', () => {
    expect(composeFormLeaveDirty({ dirtyFields: { name: true } })).toBe(true)
  })

  it('returns true when subclass edits are active', () => {
    expect(composeFormLeaveDirty({ dirtyFields: {}, subclassEdits: true })).toBe(true)
  })

  it('returns true when extraUnsavedEdits is set', () => {
    expect(composeFormLeaveDirty({ dirtyFields: {}, extraUnsavedEdits: true })).toBe(true)
  })

  it('returns true when campaign access is dirty', () => {
    expect(composeFormLeaveDirty({ dirtyFields: {}, campaignAccessDirty: true })).toBe(true)
  })
})
