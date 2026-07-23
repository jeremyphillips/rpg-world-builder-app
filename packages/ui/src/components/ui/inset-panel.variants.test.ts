import { describe, expect, it } from 'vitest'

import {
  DEFAULT_INSET_PANEL_SURFACE,
  insetPanelClassNames,
  insetPanelEmptyStateClasses,
  insetPanelEmptyStateVariants,
  insetPanelGateClasses,
  insetPanelGateVariants,
  insetPanelVariants,
  resolveInsetPanelTextVariant,
} from './inset-panel.variants'

const APPROVED_SURFACE_TOKENS = [
  '',
  'bg-surface-muted',
  'bg-surface-subtle',
  'bg-sunken',
  'shadow-surface-sunken',
]

describe('insetPanelVariants', () => {
  it('uses approved surface tokens for muted, subtle, and sunken configs', () => {
    for (const surface of [
      { emphasis: 'default' as const },
      { emphasis: 'subtle' as const },
      DEFAULT_INSET_PANEL_SURFACE,
    ]) {
      const classes = insetPanelClassNames({ surface })
      const surfaceToken = classes.split(/\s+/).find((token) => token.startsWith('bg-')) ?? ''
      expect(APPROVED_SURFACE_TOKENS).toContain(surfaceToken)
    }
  })

  it('omits wash classes for empty surface config', () => {
    const classes = insetPanelClassNames({ surface: {} })
    expect(classes).not.toContain('bg-sunken')
    expect(classes).not.toContain('bg-surface-muted')
  })

  it.each(['sm', 'md', 'lg'] as const)('maps size %s to a text variant', (size) => {
    expect(resolveInsetPanelTextVariant(size)).toBeTruthy()
  })

  it('exposes shared empty and gate presets', () => {
    expect(insetPanelEmptyStateVariants()).toContain('border-dashed')
    expect(insetPanelGateVariants()).toContain('bg-sunken')
    expect(insetPanelGateVariants()).toContain('shadow-surface-sunken')
    expect(insetPanelEmptyStateClasses).toContain('border-dashed')
    expect(insetPanelGateClasses).toContain('bg-sunken')
    expect(insetPanelGateClasses).toContain('shadow-surface-sunken')
  })

  it('keeps layout variants separate from surface config', () => {
    expect(insetPanelVariants({ size: 'md' })).toContain('rounded-md')
  })
})
