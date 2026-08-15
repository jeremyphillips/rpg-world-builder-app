import { describe, expect, it } from 'vitest'

import {
  fieldArrayItemListClasses,
  fieldGroupLegendHeaderMarginVariants,
  fieldGroupLegendVariants,
  fieldStackRhythmVariants,
  resolveArrayLegendScale,
  resolveFieldGroupInsetPaddingClasses,
  resolveFieldGroupLegendClassName,
} from './field.variants'

describe('fieldStackRhythmVariants', () => {
  it('maps comfortable to gap-6', () => {
    expect(fieldStackRhythmVariants({ rhythm: 'comfortable' })).toContain('gap-6')
  })

  it('maps compact to gap-2', () => {
    expect(fieldStackRhythmVariants({ rhythm: 'compact' })).toContain('gap-2')
  })
})

describe('fieldArrayItemListClasses', () => {
  it('uses tighter gaps for compact sm sections', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'comfortable', size: 'sm' })).toContain('gap-3')
    expect(fieldArrayItemListClasses({ rhythm: 'comfortable', size: 'sm' })).not.toContain('gap-6')
  })

  it('uses gap-6 for comfortable md sections', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'comfortable', size: 'md' })).toContain('gap-6')
  })

  it('uses gap-2 for compact sm sections', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'compact', size: 'sm' })).toContain('gap-2')
  })

  it('uses gap-3 for compact md sections', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'compact', size: 'md' })).toContain('gap-3')
  })
})

describe('resolveArrayLegendScale', () => {
  it('maps sm field size to sm legend scale', () => {
    expect(resolveArrayLegendScale('sm')).toBe('sm')
  })

  it('maps md field size to default legend scale', () => {
    expect(resolveArrayLegendScale('md')).toBe('default')
  })
})

describe('field group legend helpers', () => {
  it('applies sm array legend typography', () => {
    expect(fieldGroupLegendVariants({ size: 'array', scale: 'sm' })).toContain('text-sm')
    expect(fieldGroupLegendVariants({ size: 'array', scale: 'sm' })).not.toContain(
      'text-field-array-legend',
    )
  })

  it('applies default array legend typography', () => {
    expect(fieldGroupLegendVariants({ size: 'array', scale: 'default' })).toContain(
      'text-field-array-legend',
    )
  })

  it('applies legend header margins by size', () => {
    expect(fieldGroupLegendHeaderMarginVariants({ size: 'section' })).toBe('mb-5')
    expect(fieldGroupLegendHeaderMarginVariants({ size: 'subsection' })).toBe('mb-4')
    expect(fieldGroupLegendHeaderMarginVariants({ size: 'array' })).toBe('mb-4')
  })

  it('composes legend class names with header margin', () => {
    expect(resolveFieldGroupLegendClassName({ size: 'section' })).toContain('mb-5')
    expect(resolveFieldGroupLegendClassName({ size: 'section' })).toContain(
      'text-field-group-legend',
    )
    expect(resolveFieldGroupLegendClassName({ size: 'subsection' })).toContain('mb-4')
    expect(resolveFieldGroupLegendClassName({ size: 'subsection' })).toContain(
      'text-field-subgroup-legend',
    )
  })
})

describe('resolveFieldGroupInsetPaddingClasses', () => {
  it('returns compact inset padding from shared form inset policy', () => {
    expect(resolveFieldGroupInsetPaddingClasses('compact')).toBe('pl-8')
  })
})
