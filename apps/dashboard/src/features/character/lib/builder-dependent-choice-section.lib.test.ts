import { describe, expect, it } from 'vitest'

import type { RadioCardOption } from '@rpg/ui'

import { resolveDependentChoiceVisibleOptions } from './builder-dependent-choice-section.lib'

const options = [
  { label: 'Drow', value: 'drow' },
  { label: 'High Elf', value: 'high-elf' },
] satisfies RadioCardOption[]

describe('builder-dependent-choice-section.lib', () => {
  it('returns all options when unresolved', () => {
    expect(resolveDependentChoiceVisibleOptions(options, '', false)).toEqual(options)
  })

  it('returns only the selected option when resolved and collapsed', () => {
    expect(resolveDependentChoiceVisibleOptions(options, 'drow', false)).toEqual([
      { label: 'Drow', value: 'drow' },
    ])
  })

  it('returns all options when resolved and expanded', () => {
    expect(resolveDependentChoiceVisibleOptions(options, 'drow', true)).toEqual(options)
  })
})
