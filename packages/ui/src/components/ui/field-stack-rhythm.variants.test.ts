import { describe, expect, it } from 'vitest'

import {
  fieldStackRhythmVariants,
  resolveArraySectionSize,
  resolveFieldStackRhythm,
  resolveFormFieldSize,
  resolveInheritedFieldSize,
} from './field.variants'

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
