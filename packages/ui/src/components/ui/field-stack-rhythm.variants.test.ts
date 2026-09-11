import { describe, expect, it } from 'vitest'

import {
  fieldAnatomyAlignVariants,
  fieldAnatomyStackVariants,
  fieldChipWrapGapClasses,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
  fieldArrayItemListClasses,
  fieldGroupLegendHeaderMarginVariants,
  fieldGroupLegendVariants,
  fieldStackRhythmVariants,
  resolveArrayLegendScale,
  resolveFieldGroupInsetPaddingClasses,
  resolveFieldGroupLegendClassName,
} from './field.variants'

describe('fieldAnatomyStackVariants', () => {
  it('maps sm to 4px label-to-control gap', () => {
    expect(fieldAnatomyStackVariants({ size: 'sm' })).toContain('gap-y-1')
  })

  it('maps md and lg to 6px label-to-control gap', () => {
    expect(fieldAnatomyStackVariants({ size: 'md' })).toContain('gap-y-1.5')
    expect(fieldAnatomyStackVariants({ size: 'lg' })).toContain('gap-y-1.5')
  })

  it('keeps stacked alignment on the same size map via gap-y', () => {
    expect(fieldAnatomyAlignVariants({ size: 'sm' })).toContain('gap-y-1')
    expect(fieldAnatomyAlignVariants({ size: 'md' })).toContain('gap-y-1.5')
    expect(fieldAnatomyAlignVariants({ size: 'lg' })).toContain('gap-y-1.5')
  })

  it('uses 2px between a label cluster and its below-label hint', () => {
    expect(fieldLabelHintStackClasses).toContain('gap-0.5')
  })

  it('limits chip wrap classes to pill-row gap', () => {
    expect(fieldChipWrapGapClasses).toBe('gap-2')
    expect(fieldChipWrapGapClasses).not.toContain('pt-')
  })

  it('maps default label placement to the type-scale line box', () => {
    expect(fieldLabelVariants({ size: 'sm' })).toContain('min-h-4')
    expect(fieldLabelVariants({ size: 'md' })).toContain('min-h-[1.375rem]')
    expect(fieldLabelVariants({ size: 'lg' })).toContain('min-h-[1.375rem]')
  })
})

describe('fieldStackRhythmVariants', () => {
  it('maps comfortable to gap-6', () => {
    expect(fieldStackRhythmVariants({ rhythm: 'comfortable' })).toContain('gap-6')
  })

  it('maps compact to gap-3', () => {
    expect(fieldStackRhythmVariants({ rhythm: 'compact' })).toContain('gap-3')
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

  it('uses gap-3 for compact sm sections', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'compact', size: 'sm' })).toContain('gap-3')
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
