import { describe, expect, it } from 'vitest'

import { compactLabelAppearanceToneClasses } from './compact-label.lib'

describe('compactLabelAppearanceToneClasses', () => {
  it('uses on-subtle negative text for soft appearance', () => {
    const classes = compactLabelAppearanceToneClasses('soft', 'negative').split(/\s+/)
    expect(classes).toContain('text-semantic-negative-on-subtle')
    expect(classes).not.toContain('text-semantic-negative')
  })

  it('keeps inline semantic negative for accent-outline', () => {
    expect(compactLabelAppearanceToneClasses('accent-outline', 'negative')).toContain(
      'text-semantic-negative',
    )
  })
})
