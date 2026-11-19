import { describe, expect, it } from 'vitest'

import {
  optionalDisclosureInheritedSourceLeading,
  splitOptionalDisclosureSummary,
} from './optional-disclosure-inherited.lib'

describe('optionalDisclosureInheritedSourceLeading', () => {
  it('appends a colon when the label has no punctuation', () => {
    expect(optionalDisclosureInheritedSourceLeading('Base')).toBe('Base:')
    expect(optionalDisclosureInheritedSourceLeading('Weapon base damage')).toBe(
      'Weapon base damage:',
    )
  })

  it('leaves labels that already end with a colon', () => {
    expect(optionalDisclosureInheritedSourceLeading('Base:')).toBe('Base:')
  })
})

describe('splitOptionalDisclosureSummary', () => {
  it('splits middle-dot inherit summaries', () => {
    expect(splitOptionalDisclosureSummary('Inherits · Walk 30 ft.')).toEqual({
      leading: 'Inherits ·',
      value: 'Walk 30 ft.',
    })
  })

  it('splits colon inherit summaries', () => {
    expect(splitOptionalDisclosureSummary('Inherits: Walk 30 ft.')).toEqual({
      leading: 'Inherits:',
      value: 'Walk 30 ft.',
    })
  })

  it('returns a single leading segment when no delimiter is present', () => {
    expect(splitOptionalDisclosureSummary('Inherits base movement.')).toEqual({
      leading: 'Inherits base movement.',
    })
  })
})
