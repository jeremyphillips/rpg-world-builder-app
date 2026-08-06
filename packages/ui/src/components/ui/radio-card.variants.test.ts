import { describe, expect, it } from 'vitest'

import {
  radioCardDescriptionVariants,
  radioCardEmbeddedSlotVariants,
  radioCardShellVariants,
  radioCardVariants,
} from './radio-card.variants'

describe('radioCard surface establishment', () => {
  it('establishes the card plane on card variant and outer shell', () => {
    expect(radioCardVariants({ variant: 'card' })).toContain('[--surface-current:var(--card)]')
    expect(radioCardShellVariants()).toContain('[--surface-current:var(--card)]')
  })

  it('does not establish a plane on row variant', () => {
    expect(radioCardVariants({ variant: 'row' })).not.toContain('[--surface-current:')
  })

  it('establishes surface-muted independently on embedded panel slots', () => {
    const panel = radioCardEmbeddedSlotVariants({ tone: 'panel' })
    expect(panel).toContain('[--surface-current:var(--surface-muted)]')
    expect(panel).toContain('bg-surface-muted')
  })

  it('uses compact vertical padding and 14px muted descriptions', () => {
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('py-2.5')
    expect(radioCardShellVariants({ density: 'compact' })).toContain('py-2.5')
    expect(radioCardDescriptionVariants()).toContain('text-sm')
    expect(radioCardDescriptionVariants()).toContain('text-muted-foreground')
  })

  it('does not establish a plane on divider embedded slots', () => {
    expect(radioCardEmbeddedSlotVariants({ tone: 'divider' })).not.toContain('[--surface-current:')
  })
})
