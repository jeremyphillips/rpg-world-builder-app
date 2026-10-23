import { describe, expect, it } from 'vitest'

import {
  DEFAULT_INSET_PANEL_SURFACE,
  insetPanelClassNames,
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

  it('exposes dashed empty and gate presets via insetPanelClassNames', () => {
    const empty = insetPanelClassNames({
      borderStyle: 'dashed',
      surface: DEFAULT_INSET_PANEL_SURFACE,
      size: 'md',
      align: 'center',
    })
    expect(empty).toContain('ui-inset-panel--dashed')
    expect(empty).toContain('bg-sunken')
    expect(empty).toContain('shadow-surface-sunken')

    const gate = insetPanelClassNames({
      borderStyle: 'dashed',
      surface: DEFAULT_INSET_PANEL_SURFACE,
      size: 'lg',
      align: 'center',
    })
    expect(gate).toContain('bg-sunken')
    expect(gate).toContain('shadow-surface-sunken')
  })

  it('keeps layout variants separate from surface config', () => {
    expect(insetPanelVariants({ size: 'md' })).toContain('ui-inset-panel--md')
    expect(insetPanelClassNames({ size: 'md' })).toContain('ui-border--default')
  })
})
