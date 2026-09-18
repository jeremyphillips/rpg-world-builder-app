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

  it('uses in-flow flex column layout for vertical alignment with the value', () => {
    const mdColumn = selectDigitTrailingColumnVariants({ size: 'md' })
    expect(mdColumn).toContain('self-stretch')
    expect(mdColumn).toContain('items-center')
    expect(mdColumn).toContain('w-8')
    expect(mdColumn).not.toContain('absolute')
  })

  it('adds grouped-start trailing inset after the chevron only', () => {
    expect(selectDigitTrailingColumnVariants({ size: 'md', groupedStart: true })).toContain('pe-1')
    expect(selectDigitTrailingColumnVariants({ size: 'md', groupedStart: false })).not.toContain(
      'pe-1',
    )
  })
})
