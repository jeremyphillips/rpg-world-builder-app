import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn semantic control groups', () => {
  it('drops conflicting ui-button appearance modifiers', () => {
    expect(cn('ui-button--primary', 'ui-button--outline')).toBe('ui-button--outline')
  })

  it('drops conflicting ui-button size modifiers', () => {
    expect(cn('ui-button--md', 'ui-button--sm')).toBe('ui-button--sm')
  })
})
