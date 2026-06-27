import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('keeps custom table font-size utilities alongside text color classes', () => {
    expect(
      cn(
        'bg-muted/10 text-muted-foreground',
        'px-3 py-2',
        'text-table-stat font-medium text-foreground',
      ),
    ).toBe('bg-muted/10 px-3 py-2 text-table-stat font-medium text-foreground')
  })

  it('keeps badge-sm font-size when merged with muted text color', () => {
    expect(cn('text-muted-foreground', 'text-badge-sm font-light italic')).toBe(
      'text-muted-foreground text-badge-sm font-light italic',
    )
  })

  it('keeps eyebrow and meta font-size utilities alongside text color classes', () => {
    expect(cn('text-muted-foreground', 'text-eyebrow-sm tracking-eyebrow')).toBe(
      'text-muted-foreground text-eyebrow-sm tracking-eyebrow',
    )
    expect(cn('text-foreground', 'text-xs-meta font-light')).toBe(
      'text-foreground text-xs-meta font-light',
    )
  })

  it('keeps heading role font-size utilities alongside text color classes', () => {
    expect(cn('text-foreground', 'text-heading-page font-heading')).toBe(
      'text-foreground text-heading-page font-heading',
    )
  })

  it('merges conflicting semantic font-weight utilities', () => {
    expect(cn('font-heading', 'font-body-emphasis')).toBe('font-body-emphasis')
    expect(cn('font-meta', 'font-data-name')).toBe('font-data-name')
  })

  it('replaces sibling heading-style composites', () => {
    expect(cn('heading-style-page', 'heading-style-section')).toBe('heading-style-section')
  })

  it('drops atomic heading typography when a composite follows', () => {
    expect(cn('text-heading-display font-heading tracking-tight', 'heading-style-page')).toBe(
      'heading-style-page',
    )
  })

  it('replaces sibling eyebrow-style composites', () => {
    expect(cn('eyebrow-style-sm', 'eyebrow-style-xs')).toBe('eyebrow-style-xs')
  })

  it('drops atomic eyebrow typography when a composite follows', () => {
    expect(cn('text-eyebrow-xs tracking-eyebrow uppercase', 'eyebrow-style-sm')).toBe(
      'eyebrow-style-sm',
    )
  })

  it('preserves layout and color classes when merging heading composites', () => {
    expect(cn('heading-style-section', 'mb-4 text-foreground')).toBe(
      'heading-style-section mb-4 text-foreground',
    )
  })
})
