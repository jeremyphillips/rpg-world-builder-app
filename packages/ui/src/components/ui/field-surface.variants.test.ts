import { describe, expect, it } from 'vitest'

import {
  FIELD_STATUS_TONES,
  FIELD_SURFACE_VARIANTS,
  resolveFieldContainerChromeClasses,
} from './field-surface.variants'

const APPROVED_SURFACE_TOKENS = [
  'border-border',
  'bg-background',
  'bg-card',
  'bg-surface-subtle',
  'bg-surface-muted',
  'bg-surface-strong',
  'shadow-surface-raised',
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
  it.each(FIELD_SURFACE_VARIANTS)('uses approved tokens for surface %s', (surface) => {
    const classes = resolveFieldContainerChromeClasses({ surface })
    expectOnlyApprovedTokens(classes, APPROVED_SURFACE_TOKENS)
  })

  it.each(FIELD_STATUS_TONES)('uses approved tokens for status %s', (status) => {
    const classes = resolveFieldContainerChromeClasses({ status })
    expectOnlyApprovedTokens(classes, APPROVED_STATUS_TOKENS)
  })

  it('composes surface and status without neutral wash underneath', () => {
    const classes = resolveFieldContainerChromeClasses({ surface: 'subtle', status: 'warning' })
    expect(classes).toContain('border-warning-muted')
    expect(classes).toContain('bg-warning-subtle')
    expect(classes).not.toContain('bg-surface-subtle')
  })

  it('defaults surface behavior to subtle when only status is set', () => {
    const classes = resolveFieldContainerChromeClasses({ status: 'warning' })
    expect(classes).toContain('border-warning-muted')
    expect(classes).toContain('bg-warning-subtle')
  })

  it('keeps raised shadow when surface is raised and status is present', () => {
    const classes = resolveFieldContainerChromeClasses({ surface: 'raised', status: 'warning' })
    expect(classes).toContain('shadow-surface-raised')
    expect(classes).toContain('bg-warning-subtle')
    expect(classes).not.toContain('bg-card')
  })
})
