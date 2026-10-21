import { describe, expect, it } from 'vitest'

import {
  fieldSelectDigitColumnCaretDescendantClasses,
  fieldSelectInlineCaretIconClasses,
  selectDigitTrailingColumnVariants,
} from './select-caret.variants'

describe('select-caret variants', () => {
  it('pairs sm field with sm (12px) caret glyph', () => {
    expect(fieldSelectInlineCaretIconClasses('sm')).toBe('size-icon-glyph-sm')
    expect(fieldSelectDigitColumnCaretDescendantClasses('sm')).toBe('[&_svg]:size-icon-glyph-sm')
  })

  it('pairs md and lg fields with lg (16px) caret glyph', () => {
    expect(fieldSelectInlineCaretIconClasses('md')).toBe('size-icon-glyph-lg')
    expect(fieldSelectInlineCaretIconClasses('lg')).toBe('size-icon-glyph-lg')
    expect(fieldSelectDigitColumnCaretDescendantClasses('md')).toBe('[&_svg]:size-icon-glyph-lg')
    expect(fieldSelectDigitColumnCaretDescendantClasses('lg')).toBe('[&_svg]:size-icon-glyph-lg')
  })

  it('uses the same glyph step for inline and digit-column at each field size', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const inlineStep = fieldSelectInlineCaretIconClasses(size).replace('size-icon-glyph-', '')
      const digitStep = fieldSelectDigitColumnCaretDescendantClasses(size).replace(
        '[&_svg]:size-icon-glyph-',
        '',
      )
      expect(inlineStep).toBe(digitStep)
    }
  })

  it('uses semantic caret slot layout for vertical alignment with the value', () => {
    const mdColumn = selectDigitTrailingColumnVariants({ size: 'md' })
    expect(mdColumn).toContain('ui-field-group--md')
    expect(mdColumn).toContain('ui-field-group__caret-slot')
    expect(mdColumn).not.toContain('absolute')
  })

  it('adds grouped-start caret slot modifier after the chevron only', () => {
    expect(selectDigitTrailingColumnVariants({ size: 'md', groupedStart: true })).toContain(
      'ui-field-group__caret-slot--grouped-start',
    )
    expect(selectDigitTrailingColumnVariants({ size: 'md', groupedStart: false })).not.toContain(
      'ui-field-group__caret-slot--grouped-start',
    )
  })
})
