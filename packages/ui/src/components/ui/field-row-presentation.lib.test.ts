import { describe, expect, it } from 'vitest'

import { fieldSettingsRowClasses } from './field.variants'
import {
  mapFormLabelPositionToLayout,
  resolveFieldActionBandClassName,
  resolveFieldPresentation,
  resolveFieldRowClasses,
} from './field-row-presentation.lib'
import type { FieldControlBand } from './field-control-band.variants'
import type { FieldLabelLayout } from './field-row-presentation.lib'
import type { FieldSizeToken } from './field-sizing.variants'

const LABEL_LAYOUTS: FieldLabelLayout[] = ['hidden', 'stacked', 'inline', 'settings']
const CONTROL_BANDS: FieldControlBand[] = ['single-line', 'content-sized']
const SIZES: FieldSizeToken[] = ['sm', 'md', 'lg']

describe('resolveFieldPresentation', () => {
  it.each(
    LABEL_LAYOUTS.flatMap((labelLayout) =>
      CONTROL_BANDS.flatMap((controlBand) =>
        SIZES.map((size) => ({ size, labelLayout, controlBand })),
      ),
    ),
  )('resolves $labelLayout × $controlBand × $size', ({ size, labelLayout, controlBand }) => {
    const presentation = resolveFieldPresentation({ size, labelLayout, controlBand })

    expect(presentation.controlSize).toBe(size)
    expect(presentation.controlBandClassName).toContain('flex')
    expect(presentation.labelClassName).toBeTruthy()

    if (controlBand === 'single-line') {
      if (size === 'sm') expect(presentation.controlBandClassName).toContain('min-h-8')
      if (size === 'md') expect(presentation.controlBandClassName).toContain('min-h-9')
      if (size === 'lg') expect(presentation.controlBandClassName).toContain('min-h-11')
    } else {
      expect(presentation.controlBandClassName).toContain('min-h-0')
      expect(presentation.controlBandClassName).toContain('items-start')
    }

    if (labelLayout === 'stacked') {
      expect(presentation.groupClassName).toContain('flex-col')
      expect(presentation.alignmentAnchorClassName).toContain('gap-y-2')
    }
    if (labelLayout === 'inline') {
      expect(presentation.groupClassName).toContain('items-center')
    }
    if (labelLayout === 'settings') {
      expect(presentation.groupClassName).toBe(fieldSettingsRowClasses)
    }
    if (labelLayout === 'hidden') {
      expect(presentation.groupClassName).toBe('')
    }
  })
})

describe('resolveFieldRowClasses', () => {
  it('defaults to control-edge form row (items-end, gap-6)', () => {
    const classes = resolveFieldRowClasses()
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-wrap')
    expect(classes).toContain('items-end')
    expect(classes).toContain('gap-6')
  })

  it('maps toolbar gap and center alignment', () => {
    const classes = resolveFieldRowClasses({
      layout: 'flow',
      align: 'center',
      gap: 'toolbar',
    })
    expect(classes).toContain('items-center')
    expect(classes).toContain('gap-2')
  })
})

describe('mapFormLabelPositionToLayout', () => {
  it('maps above/settings/inline', () => {
    expect(mapFormLabelPositionToLayout('above')).toBe('stacked')
    expect(mapFormLabelPositionToLayout(undefined)).toBe('stacked')
    expect(mapFormLabelPositionToLayout('settings')).toBe('settings')
    expect(mapFormLabelPositionToLayout('inline')).toBe('inline')
  })
})

describe('resolveFieldActionBandClassName', () => {
  it('returns a single-line band at the given size', () => {
    expect(resolveFieldActionBandClassName('sm')).toContain('min-h-8')
    expect(resolveFieldActionBandClassName('md')).toContain('min-h-9')
  })
})
