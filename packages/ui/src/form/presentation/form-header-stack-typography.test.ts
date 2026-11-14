import { describe, expect, it } from 'vitest'

import {
  resolveEffectiveFormHeaderScale,
  resolveEffectiveFormHeaderScaleFromLegendSize,
  resolveFormHeaderStackTypography,
} from './form-header-stack-typography.lib'

describe('resolveEffectiveFormHeaderScale', () => {
  it('derives section at depth 0 when headingScale is omitted', () => {
    expect(resolveEffectiveFormHeaderScale({ namedGroupDepth: 0 })).toBe('section')
  })

  it('derives subsection at depth 1 when headingScale is omitted', () => {
    expect(resolveEffectiveFormHeaderScale({ namedGroupDepth: 1 })).toBe('subsection')
  })

  it('uses explicit subsection presentation without changing depth semantics', () => {
    expect(
      resolveEffectiveFormHeaderScale({ namedGroupDepth: 0, headingScale: 'subsection' }),
    ).toBe('subsection')
  })
})

describe('resolveEffectiveFormHeaderScaleFromLegendSize', () => {
  it('maps legendSize to presentation when headingScale is omitted', () => {
    expect(resolveEffectiveFormHeaderScaleFromLegendSize({ legendSize: 'section' })).toBe('section')
    expect(resolveEffectiveFormHeaderScaleFromLegendSize({ legendSize: 'subsection' })).toBe(
      'subsection',
    )
  })

  it('prefers explicit headingScale over legendSize', () => {
    expect(
      resolveEffectiveFormHeaderScaleFromLegendSize({
        legendSize: 'section',
        headingScale: 'subsection',
      }),
    ).toBe('subsection')
  })
})

describe('resolveFormHeaderStackTypography', () => {
  it('pairs section legend and section description at comfortable rhythm', () => {
    const stack = resolveFormHeaderStackTypography({
      headingScale: 'section',
      rhythm: 'comfortable',
    })
    expect(stack.labelClass).toBe('text-style-field-legend')
    expect(stack.hintClass).toBe('text-style-field-section-description')
    expect(stack.labelHintStackClass).toContain('gap-2')
  })

  it('pairs subsection compact legend and description', () => {
    const stack = resolveFormHeaderStackTypography({
      headingScale: 'subsection',
      rhythm: 'compact',
    })
    expect(stack.labelClass).toBe('text-style-field-legend-sub-compact')
    expect(stack.hintClass).toBe('text-style-field-subsection-description-compact')
  })

  it('uses field label and hint for field scale', () => {
    const comfortable = resolveFormHeaderStackTypography({
      headingScale: 'field',
      rhythm: 'comfortable',
      size: 'md',
    })
    expect(comfortable.labelClass).toBe('text-style-field-label-md')
    expect(comfortable.hintClass).toBe('text-style-field-hint')

    const compact = resolveFormHeaderStackTypography({
      headingScale: 'field',
      rhythm: 'compact',
      size: 'sm',
    })
    expect(compact.labelClass).toBe('text-style-field-label-sm')
    expect(compact.hintClass).toBe('text-style-field-hint-compact')
  })

  it('supports large label with compact rhythm on field scale', () => {
    const stack = resolveFormHeaderStackTypography({
      headingScale: 'field',
      rhythm: 'compact',
      size: 'lg',
    })
    expect(stack.labelClass).toBe('text-style-field-label-lg')
    expect(stack.hintClass).toBe('text-style-field-hint-compact')
  })
})
