import { describe, expect, it } from 'vitest'

import {
  fieldArrayItemListClasses,
  fieldGroupLegendHeaderMarginVariants,
  fieldGroupLegendVariants,
  fieldLabelVariants,
  fieldStackRhythmVariants,
  resolveArrayLegendScale,
  resolveArraySectionSize,
  resolveFieldGroupLegendClassName,
  resolveFieldGroupLegendHeaderStackClassName,
  resolveFieldStackRhythm,
  resolveFormFieldSize,
  resolveInheritedFieldSize,
} from './field.variants'
import {
  fieldSizeToArrayAddButtonSize,
  buttonSizeToComboboxFieldSize,
} from './field-sizing.variants'
import { richTextEditorProseClasses, richTextProseSizeClasses } from './rich-text-content.variants'

describe('fieldStackRhythmVariants', () => {
  it('applies compact gap by default', () => {
    expect(fieldStackRhythmVariants()).toContain('gap-2')
    expect(fieldStackRhythmVariants()).toContain('flex')
    expect(fieldStackRhythmVariants()).toContain('flex-col')
  })

  it('applies comfortable gap when requested', () => {
    expect(fieldStackRhythmVariants({ rhythm: 'comfortable' })).toContain('gap-6')
  })
})

describe('fieldLabelVariants', () => {
  it('shrinks the label hit target to label copy width', () => {
    expect(fieldLabelVariants()).toContain('w-fit')
    expect(fieldLabelVariants()).toContain('self-start')
  })

  it('adds first-line min-height for inline toggles without overriding label weight', () => {
    expect(fieldLabelVariants({ placement: 'inlineSwitch' })).toContain('min-h-5')
    expect(fieldLabelVariants({ placement: 'inlineSwitch' })).toContain('font-field-label')
    expect(fieldLabelVariants({ placement: 'inlineCheckbox' })).toContain('min-h-4')
    expect(fieldLabelVariants({ placement: 'inlineCheckbox' })).not.toContain('font-normal')
  })
})

describe('fieldArrayItemListClasses', () => {
  it('uses gap-3 between sm comfortable array items', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'comfortable', size: 'sm' })).toContain('gap-3')
    expect(fieldArrayItemListClasses({ rhythm: 'comfortable', size: 'sm' })).not.toContain('gap-6')
  })

  it('uses gap-6 between md comfortable array items', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'comfortable', size: 'md' })).toContain('gap-6')
  })

  it('uses gap-2 for default compact sm arrays', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'compact', size: 'sm' })).toContain('gap-2')
  })

  it('uses gap-3 for compact md arrays', () => {
    expect(fieldArrayItemListClasses({ rhythm: 'compact', size: 'md' })).toContain('gap-3')
  })
})

describe('resolveFieldStackRhythm', () => {
  it('prefers explicit config rhythm', () => {
    expect(
      resolveFieldStackRhythm({
        explicit: 'comfortable',
        inherited: 'compact',
        sectionDefault: 'compact',
      }),
    ).toBe('comfortable')
  })

  it('falls back to section default before inherited rhythm', () => {
    expect(
      resolveFieldStackRhythm({
        inherited: 'comfortable',
        sectionDefault: 'compact',
      }),
    ).toBe('compact')
  })

  it('inherits form rhythm when no override or section default', () => {
    expect(resolveFieldStackRhythm({ inherited: 'comfortable' })).toBe('comfortable')
  })
})

describe('resolveFormFieldSize', () => {
  it('maps compact rhythm to sm when size is omitted', () => {
    expect(resolveFormFieldSize({ rhythm: 'compact' })).toBe('sm')
  })

  it('maps comfortable rhythm to md when size is omitted', () => {
    expect(resolveFormFieldSize({ rhythm: 'comfortable' })).toBe('md')
  })

  it('prefers an explicit form size over rhythm mapping', () => {
    expect(resolveFormFieldSize({ explicit: 'lg', rhythm: 'compact' })).toBe('lg')
  })
})

describe('fieldSizeToArrayAddButtonSize', () => {
  it('bumps sm array sections to default button size', () => {
    expect(fieldSizeToArrayAddButtonSize.sm).toBe('default')
    expect(fieldSizeToArrayAddButtonSize.md).toBe('default')
    expect(fieldSizeToArrayAddButtonSize.lg).toBe('lg')
  })
})

describe('buttonSizeToComboboxFieldSize', () => {
  it('maps outline button sizes to combobox search row sizes', () => {
    expect(buttonSizeToComboboxFieldSize.sm).toBe('sm')
    expect(buttonSizeToComboboxFieldSize.default).toBe('md')
    expect(buttonSizeToComboboxFieldSize.lg).toBe('lg')
  })
})

describe('resolveArraySectionSize', () => {
  it('defaults array item fields to sm', () => {
    expect(
      resolveArraySectionSize({
        inherited: 'md',
        sectionDefault: 'sm',
      }),
    ).toBe('sm')
  })

  it('prefers explicit ArrayConfig size', () => {
    expect(
      resolveArraySectionSize({
        explicit: 'md',
        inherited: 'md',
        sectionDefault: 'sm',
      }),
    ).toBe('md')
  })
})

describe('resolveInheritedFieldSize', () => {
  it('prefers explicit field config size', () => {
    expect(resolveInheritedFieldSize({ explicit: 'lg', inherited: 'sm' })).toBe('lg')
  })

  it('inherits context size when field config omits size', () => {
    expect(resolveInheritedFieldSize({ inherited: 'sm' })).toBe('sm')
  })
})

describe('resolveArrayLegendScale', () => {
  it('maps sm section size to compact array legend scale', () => {
    expect(resolveArrayLegendScale('sm')).toBe('sm')
  })

  it('keeps default array legend scale for md and lg section sizes', () => {
    expect(resolveArrayLegendScale('md')).toBe('default')
    expect(resolveArrayLegendScale('lg')).toBe('default')
  })
})

describe('fieldGroupLegendVariants', () => {
  it('uses text-sm for array legends in sm sections', () => {
    expect(fieldGroupLegendVariants({ size: 'array', scale: 'sm' })).toContain('text-sm')
    expect(fieldGroupLegendVariants({ size: 'array', scale: 'sm' })).not.toContain(
      'text-field-array-legend',
    )
  })

  it('keeps the token scale for default array legends', () => {
    expect(fieldGroupLegendVariants({ size: 'array', scale: 'default' })).toContain(
      'text-field-array-legend',
    )
  })
})

describe('fieldGroupLegendHeaderMarginVariants', () => {
  it('uses 20px below section legends and 16px below subgroups and arrays', () => {
    expect(fieldGroupLegendHeaderMarginVariants({ size: 'section' })).toBe('mb-5')
    expect(fieldGroupLegendHeaderMarginVariants({ size: 'subsection' })).toBe('mb-4')
    expect(fieldGroupLegendHeaderMarginVariants({ size: 'array' })).toBe('mb-4')
  })
})

describe('resolveFieldGroupLegendClassName', () => {
  it('combines typography and header margin', () => {
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

describe('resolveFieldGroupLegendHeaderStackClassName', () => {
  it('combines legend/hint stack rhythm with header margin', () => {
    expect(resolveFieldGroupLegendHeaderStackClassName('section')).toContain('gap-2')
    expect(resolveFieldGroupLegendHeaderStackClassName('section')).toContain('mb-5')
    expect(resolveFieldGroupLegendHeaderStackClassName('subsection')).toContain('gap-2')
    expect(resolveFieldGroupLegendHeaderStackClassName('subsection')).toContain('mb-4')
  })
})

describe('richTextProseSizeClasses', () => {
  it('maps field sizes to prose modifiers', () => {
    expect(richTextProseSizeClasses.sm).toBe('prose-sm')
    expect(richTextProseSizeClasses.md).toBe('prose-md')
    expect(richTextProseSizeClasses.lg).toBe('')
  })

  it('builds editor prose classes from field size', () => {
    expect(richTextEditorProseClasses('md')).toContain('prose-md')
    expect(richTextEditorProseClasses('sm')).toContain('prose-sm')
    expect(richTextEditorProseClasses('lg')).not.toContain('prose-sm')
    expect(richTextEditorProseClasses('lg')).not.toContain('prose-md')
  })
})
