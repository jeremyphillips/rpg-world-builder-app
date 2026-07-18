import { describe, expect, it } from 'vitest'

import { compactLabelAppearanceToneClasses } from './compact-label.lib'

describe('compactLabelAppearanceToneClasses', () => {
  it('uses on-subtle destructive text for soft appearance', () => {
    const classes = compactLabelAppearanceToneClasses('soft', 'destructive').split(/\s+/)
    expect(classes).toContain('text-semantic-destructive-on-subtle')
    expect(classes).not.toContain('text-semantic-destructive')
  })

  it('keeps inline semantic destructive for accent-outline', () => {
    expect(compactLabelAppearanceToneClasses('accent-outline', 'destructive')).toContain(
      'text-semantic-destructive',
    )
  })
})
