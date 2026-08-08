import { describe, expect, it } from 'vitest'

import {
  radioCardControlVariants,
  radioCardDescriptionVariants,
  radioCardDetailsGridVariants,
  radioCardEmbeddedSlotVariants,
  radioCardGroupGapVariants,
  radioCardBodyVariants,
  radioCardRootLayoutVariants,
  radioCardShellVariants,
  radioCardTitleVariants,
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

  it('uses compact 10px/16px padding and density-owned typography', () => {
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('py-2.5')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('px-4')
    expect(radioCardShellVariants({ density: 'compact' })).toContain('py-2.5')
    expect(radioCardShellVariants({ density: 'compact' })).toContain('px-4')
    expect(radioCardTitleVariants({ density: 'compact' })).toContain('text-sm')
    expect(radioCardDescriptionVariants({ density: 'compact' })).toContain('text-xs')
    expect(radioCardDescriptionVariants({ density: 'compact' })).toContain('text-muted-foreground')
    expect(radioCardDescriptionVariants({ density: 'default' })).toContain('text-sm')
  })

  it('removes compact title/description gap via shared body stack token', () => {
    expect(radioCardBodyVariants({ density: 'compact' })).toContain('gap-0')
  })

  it('uses compact horizontal rhythm with 12px gap and 16px controls', () => {
    expect(radioCardRootLayoutVariants({ density: 'compact' })).toContain('gap-3')
    expect(radioCardDetailsGridVariants({ density: 'compact' })).toContain('gap-x-3')
    expect(radioCardControlVariants({ variant: 'card', density: 'compact' })).toContain('size-4')
  })

  it('does not establish a plane on divider embedded slots', () => {
    expect(radioCardEmbeddedSlotVariants({ tone: 'divider' })).not.toContain('[--surface-current:')
  })
})

describe('radioCard group layout', () => {
  it('stretches card groups to the full field width', () => {
    expect(radioCardGroupGapVariants({ variant: 'card' })).toContain('w-full')
    expect(radioCardGroupGapVariants({ variant: 'card' })).toContain('min-w-0')
  })
})
