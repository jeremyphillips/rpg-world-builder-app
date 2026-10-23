import { describe, expect, it } from 'vitest'

import {
  fieldSelectInlineCaretIconSize,
  selectDigitTrailingColumnVariants,
} from './select-caret.variants'

describe('select caret variants', () => {
  it('maps field sizes to Icon steps for inline carets', () => {
    expect(fieldSelectInlineCaretIconSize('xs')).toBe('xs')
    expect(fieldSelectInlineCaretIconSize('sm')).toBe('sm')
    expect(fieldSelectInlineCaretIconSize('md')).toBe('lg')
    expect(fieldSelectInlineCaretIconSize('lg')).toBe('lg')
  })

  it('composes digit-column caret slots from field-group anatomy', () => {
    const mdColumn = selectDigitTrailingColumnVariants({ size: 'md' })
    expect(mdColumn).toContain('ui-field-group__caret-slot')

    const groupedStart = selectDigitTrailingColumnVariants({ size: 'md', groupedStart: true })
    expect(groupedStart).toContain('ui-field-group__caret-slot--grouped-start')
    expect(groupedStart).not.toContain('ui-field-group__caret-slot--grouped-start'.repeat(2))
  })
})
