import { describe, expect, it } from 'vitest'

import {
  fieldSelectDigitColumnCaretDescendantClasses,
  fieldSelectInlineCaretIconSize,
  selectDigitTrailingColumnVariants,
} from './select-caret.variants'

describe('select-caret variants', () => {
  it('pairs sm field with sm (12px) caret glyph', () => {
    expect(fieldSelectInlineCaretIconSize('sm')).toBe('sm')
    expect(fieldSelectDigitColumnCaretDescendantClasses('sm')).toBe('[&_svg]:size-icon-glyph-sm')
  })

  it('pairs md and lg fields with lg (16px) caret glyph', () => {
    expect(fieldSelectInlineCaretIconSize('md')).toBe('lg')
    expect(fieldSelectInlineCaretIconSize('lg')).toBe('lg')
    expect(fieldSelectDigitColumnCaretDescendantClasses('md')).toBe('[&_svg]:size-icon-glyph-lg')
    expect(fieldSelectDigitColumnCaretDescendantClasses('lg')).toBe('[&_svg]:size-icon-glyph-lg')
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
