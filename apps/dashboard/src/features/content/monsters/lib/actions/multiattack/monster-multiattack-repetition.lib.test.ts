import { describe, expect, it } from 'vitest'

import { multiattackRepetitionDisclosureOpen } from './monster-multiattack-repetition.lib'

describe('multiattackRepetitionDisclosureOpen', () => {
  it('stays closed for absent, empty, and one use', () => {
    expect(multiattackRepetitionDisclosureOpen(undefined)).toBe(false)
    expect(multiattackRepetitionDisclosureOpen('')).toBe(false)
    expect(multiattackRepetitionDisclosureOpen(1)).toBe(false)
    expect(multiattackRepetitionDisclosureOpen('1')).toBe(false)
  })

  it('opens for repetition above one and invalid stored numbers', () => {
    expect(multiattackRepetitionDisclosureOpen(2)).toBe(true)
    expect(multiattackRepetitionDisclosureOpen('3')).toBe(true)
    expect(multiattackRepetitionDisclosureOpen('x')).toBe(true)
  })
})
