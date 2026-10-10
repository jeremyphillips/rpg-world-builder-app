import { describe, expect, it } from 'vitest'

import { splitSemanticClassName } from './split-semantic-class-name.lib'

describe('splitSemanticClassName', () => {
  it('splits ui-* tokens from utilities', () => {
    expect(splitSemanticClassName('ui-button ui-button--sm inline-flex h-9')).toEqual({
      semantic: ['ui-button', 'ui-button--sm'],
      utilities: ['inline-flex', 'h-9'],
    })
  })

  it('returns empty arrays for blank input', () => {
    expect(splitSemanticClassName(undefined)).toEqual({ semantic: [], utilities: [] })
    expect(splitSemanticClassName('   ')).toEqual({ semantic: [], utilities: [] })
  })

  it('treats dash-* tokens as semantic and honors a custom prefix list', () => {
    expect(splitSemanticClassName('dash-card dash-card--nav flex')).toEqual({
      semantic: ['dash-card', 'dash-card--nav'],
      utilities: ['flex'],
    })
    expect(splitSemanticClassName('ui-button dash-card', { prefixes: ['ui-'] })).toEqual({
      semantic: ['ui-button'],
      utilities: ['dash-card'],
    })
  })
})
