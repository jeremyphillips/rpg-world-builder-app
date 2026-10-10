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
})
