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
const SIZES: FieldSizeToken[] = ['xs', 'sm', 'md', 'lg']

const SIZE_MIN_HEIGHTS: Record<FieldSizeToken, string> = {
  xs: 'min-h-6',
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-11',
}

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
    expect(presentation.controlBandClassName).toContain('w-full')
    expect(presentation.controlBandClassName).toContain('min-w-0')
    expect(presentation.labelClassName).toBeTruthy()

    if (controlBand === 'single-line') {
      expect(presentation.controlBandClassName).toContain(SIZE_MIN_HEIGHTS[size])
      expect(presentation.controlBandClassName).toContain('items-center')
      expect(presentation.controlBandClassName).not.toContain('min-h-0')
      expect(presentation.controlBandClassName).not.toContain('items-start')
      for (const other of SIZES) {
        if (other === size) continue
        expect(presentation.controlBandClassName).not.toContain(SIZE_MIN_HEIGHTS[other])
      }
    } else {
      expect(presentation.controlBandClassName).toContain('min-h-0')
      expect(presentation.controlBandClassName).toContain('h-auto')
      expect(presentation.controlBandClassName).toContain('items-start')
      expect(presentation.controlBandClassName).not.toContain('items-center')
      for (const token of Object.values(SIZE_MIN_HEIGHTS)) {
        expect(presentation.controlBandClassName).not.toContain(token)
      }
    }

    if (labelLayout === 'stacked') {
      expect(presentation.groupClassName).toContain('flex-col')
      expect(presentation.alignmentAnchorClassName).toContain(
        size === 'sm' || size === 'xs' ? 'gap-y-1' : 'gap-y-1.5',
      )
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

  it('maps compact gap for tighter form rows', () => {
    const classes = resolveFieldRowClasses({ gap: 'compact' })
    expect(classes).toContain('gap-4')
    expect(classes).not.toContain('gap-6')
  })

  it('maps start alignment for rows with reserved derived metadata', () => {
    const classes = resolveFieldRowClasses({ align: 'start' })
    expect(classes).toContain('items-start')
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
