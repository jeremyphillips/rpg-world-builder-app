import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_DEPENDENT_SURFACE,
  DEFAULT_PANEL_SURFACE,
  resolveSurfaceClasses,
} from './surface.variants'

const APPROVED_SURFACE_TOKENS = [
  'border-border',
  'bg-background',
  'bg-card',
  'bg-surface-subtle',
  'bg-surface-muted',
  'bg-surface-strong',
  'bg-sunken',
  'shadow-surface-raised',
  'shadow-surface-sunken',
  '[--surface-current:var(--background)]',
  '[--surface-current:var(--card)]',
  '[--surface-current:var(--sunken)]',
  '[--surface-current:var(--surface-subtle)]',
  '[--surface-current:var(--surface-muted)]',
  '[--surface-current:var(--surface-strong)]',
]

const APPROVED_STATUS_TOKENS = [
  'border-info-muted',
  'bg-info-subtle',
  'border-success-muted',
  'bg-success-subtle',
  'border-warning-muted',
  'bg-warning-subtle',
  'border-destructive-muted',
  'bg-destructive-subtle',
]

function expectOnlyApprovedTokens(classes: string, approved: string[]) {
  const tokens = classes.split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    expect(approved).toContain(token)
  }
}

describe('resolveSurfaceClasses', () => {
  it('uses approved tokens for default dependent surface', () => {
    const classes = resolveSurfaceClasses(DEFAULT_DEPENDENT_SURFACE)
    expect(classes).toContain('bg-surface-subtle')
    expectOnlyApprovedTokens(classes, APPROVED_SURFACE_TOKENS)
  })

  it('uses approved tokens for raised array item surface', () => {
    const classes = resolveSurfaceClasses(DEFAULT_ARRAY_ITEM_SURFACE)
    expect(classes).toContain('bg-card')
    expect(classes).toContain('[--surface-current:var(--card)]')
    expect(classes).toContain('shadow-surface-raised')
    expectOnlyApprovedTokens(classes, APPROVED_SURFACE_TOKENS)
  })

  it('uses approved tokens for panel default surface', () => {
    const classes = resolveSurfaceClasses(DEFAULT_PANEL_SURFACE)
    expect(classes).toContain('bg-surface-subtle')
    expectOnlyApprovedTokens(classes, APPROVED_SURFACE_TOKENS)
  })

  it.each(['info', 'success', 'warning', 'destructive'] as const)(
    'uses approved tokens for semantic tone %s',
    (tone) => {
      const classes = resolveSurfaceClasses({ tone, emphasis: 'subtle' })
      expectOnlyApprovedTokens(classes, APPROVED_STATUS_TOKENS)
    },
  )

  it('composes raised elevation with semantic tone', () => {
    const classes = resolveSurfaceClasses({
      tone: 'warning',
      emphasis: 'subtle',
      elevation: 'raised',
    })
    expect(classes).toContain('border-warning-muted')
    expect(classes).toContain('bg-warning-subtle')
    expect(classes).toContain('shadow-surface-raised')
    expect(classes).not.toContain('bg-surface-subtle')
  })

  it('maps emphasis default to muted wash', () => {
    const classes = resolveSurfaceClasses({ emphasis: 'default', elevation: 'flat' })
    expect(classes).toContain('bg-surface-muted')
  })
})
