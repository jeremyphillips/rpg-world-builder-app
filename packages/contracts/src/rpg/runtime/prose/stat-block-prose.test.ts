import { describe, expect, it } from 'vitest'

import { joinStatBlockProseParagraph } from './stat-block-prose'

describe('joinStatBlockProseParagraph', () => {
  it('inserts a space after paragraph leads before body text', () => {
    const joined = joinStatBlockProseParagraph([
      { kind: 'lead', treatment: 'paragraph', label: 'Cantrips' },
      { kind: 'text', value: 'You know three Wizard cantrips of your choice.' },
    ])
    expect(joined).toBe('Cantrips: You know three Wizard cantrips of your choice.')
  })

  it('does not duplicate spacing when body text already leads with a space', () => {
    const joined = joinStatBlockProseParagraph([
      { kind: 'lead', treatment: 'inline', label: 'Hit' },
      { kind: 'text', value: ' 7 (1d8 + 3) Piercing damage.' },
    ])
    expect(joined).toBe('Hit: 7 (1d8 + 3) Piercing damage.')
  })
})
