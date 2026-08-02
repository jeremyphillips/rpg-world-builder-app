import { describe, expect, it } from 'vitest'

import { SEMANTIC_SURFACE_TONES } from './surface.variants'
import { resolveFieldContainerChromeClasses } from './field-surface.variants'
import { DEFAULT_DEPENDENT_SURFACE } from './surface.variants'

const APPROVED_SURFACE_TOKENS = [
  'border-border',
  'bg-background',
  'bg-card',
  'bg-surface-faint',
  'bg-surface-subtle',
  'bg-surface-muted',
  'bg-surface-strong',
  'shadow-surface-raised',
  '[--surface-current:var(--background)]',
  '[--surface-current:var(--card)]',
  '[--surface-current:var(--sunken)]',
  '[--surface-current:var(--surface-faint)]',
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

describe('resolveFieldContainerChromeClasses', () => {
  it('uses approved tokens for default dependent surface', () => {
    const classes = resolveFieldContainerChromeClasses({ surface: DEFAULT_DEPENDENT_SURFACE })
    expectOnlyApprovedTokens(classes, APPROVED_SURFACE_TOKENS)
  })

  it.each(SEMANTIC_SURFACE_TONES)('uses approved tokens for tone %s', (tone) => {
    const classes = resolveFieldContainerChromeClasses({ tone })
    expectOnlyApprovedTokens(classes, APPROVED_STATUS_TOKENS)
  })

  it('composes surface and tone without neutral wash underneath', () => {
    const classes = resolveFieldContainerChromeClasses({
      surface: DEFAULT_DEPENDENT_SURFACE,
      tone: 'warning',
    })
    expect(classes).toContain('border-warning-muted')
    expect(classes).toContain('bg-warning-subtle')
    expect(classes).not.toContain('bg-surface-subtle')
  })

  it('defaults surface behavior to subtle when only tone is set', () => {
    const classes = resolveFieldContainerChromeClasses({ tone: 'warning' })
    expect(classes).toContain('border-warning-muted')
    expect(classes).toContain('bg-warning-subtle')
  })

  it('keeps raised shadow when elevation is raised and tone is present', () => {
    const classes = resolveFieldContainerChromeClasses({
      surface: { elevation: 'raised' },
      tone: 'warning',
    })
    expect(classes).toContain('shadow-surface-raised')
    expect(classes).toContain('bg-warning-subtle')
    expect(classes).not.toContain('bg-card')
  })
})
