import { describe, expect, it } from 'vitest'

import {
  INSET_PANEL_SIZES,
  INSET_PANEL_SURFACES,
  insetPanelEmptyStateClasses,
  insetPanelEmptyStateVariants,
  insetPanelGateClasses,
  insetPanelGateVariants,
  insetPanelVariants,
  resolveInsetPanelTextVariant,
} from './inset-panel.variants'

const APPROVED_SURFACE_TOKENS = ['', 'bg-surface-muted', 'bg-surface-subtle', 'bg-sunken']

describe('insetPanelVariants', () => {
  it.each(INSET_PANEL_SURFACES)('uses approved surface tokens for %s', (surface) => {
    const classes = insetPanelVariants({ surface })
    const surfaceToken = classes.split(/\s+/).find((token) => token.startsWith('bg-')) ?? ''
    expect(APPROVED_SURFACE_TOKENS).toContain(surfaceToken)
  })

  it.each(INSET_PANEL_SIZES)('maps size %s to a text variant', (size) => {
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
})
