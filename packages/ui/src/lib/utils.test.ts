import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('keeps custom table font-size utilities alongside text color classes', () => {
    expect(
      cn(
        'bg-surface-subtle text-muted-foreground',
        'px-3 py-2',
        'text-table-stat font-medium text-foreground',
      ),
    ).toBe('bg-surface-subtle px-3 py-2 text-table-stat font-medium text-foreground')
  })

  it('keeps badge-sm font-size when merged with muted text color', () => {
    expect(cn('text-muted-foreground', 'text-badge-sm font-light italic')).toBe(
      'text-muted-foreground text-badge-sm font-light italic',
    )
  })

  it('keeps eyebrow and fine font-size utilities alongside text color classes', () => {
    expect(cn('text-muted-foreground', 'text-eyebrow-sm tracking-eyebrow')).toBe(
      'text-muted-foreground text-eyebrow-sm tracking-eyebrow',
    )
    expect(cn('text-foreground', 'text-fine-sm font-light')).toBe(
      'text-foreground text-fine-sm font-light',
    )
  })

  it('merges fine sizes with the standard scale and keeps them beside color', () => {
    expect(cn('text-sm', 'text-fine-sm')).toBe('text-fine-sm')
    expect(cn('text-fine-sm', 'text-sm')).toBe('text-sm')
    expect(cn('text-foreground', 'text-fine-sm')).toBe('text-foreground text-fine-sm')
    expect(cn('text-sm', 'text-control-action-xs')).toBe('text-control-action-xs')
    expect(cn('text-control-action-xs', 'text-sm')).toBe('text-sm')
    expect(cn('text-foreground', 'text-heading-page')).toBe('text-heading-page')
  })

  it('merges conflicting semantic font-weight utilities', () => {
    expect(cn('font-heading', 'font-body-emphasis')).toBe('font-body-emphasis')
    expect(cn('font-meta', 'font-data-name')).toBe('font-data-name')
  })

  it('replaces sibling text-style composites and the stacks they absorb', () => {
    expect(cn('text-style-supporting', 'text-style-caption')).toBe('text-style-caption')
    expect(cn('text-style-caption', 'text-style-caption')).toBe('text-style-caption')
    expect(cn('text-style-label', 'text-style-label')).toBe('text-style-label')
    expect(cn('text-style-supporting', 'text-style-body-compact')).toBe('text-style-body-compact')
    expect(cn('text-style-body-compact', 'font-semibold')).toBe('font-semibold')
    expect(cn('font-semibold', 'text-style-body-compact')).toBe('text-style-body-compact')
    expect(cn('text-style-body-compact', 'leading-tight')).toBe('leading-tight')
  })

  it('keeps a color-only tone beside a size utility in either order', () => {
    expect(cn('text-style-destructive', 'text-sm')).toBe('text-style-destructive text-sm')
    expect(cn('text-sm', 'text-style-destructive')).toBe('text-sm text-style-destructive')
    expect(cn('text-style-warning', 'text-xs')).toBe('text-style-warning text-xs')
    expect(cn('text-xs', 'text-style-warning')).toBe('text-xs text-style-warning')
    expect(cn('text-style-destructive', 'font-semibold')).toBe(
      'text-style-destructive font-semibold',
    )
    expect(cn('text-style-destructive', 'leading-tight')).toBe(
      'text-style-destructive leading-tight',
    )
    expect(cn('text-style-info', 'text-style-destructive')).toBe('text-style-destructive')
    expect(cn('text-style-destructive', 'text-style-warning')).toBe('text-style-warning')
  })

  it('keeps tone classes on the sized call-site strings', () => {
    expect(cn('text-style-destructive', 'text-right text-sm')).toBe(
      'text-style-destructive text-right text-sm',
    )
    expect(cn('text-style-warning', 'flex items-start gap-1.5 text-xs')).toBe(
      'text-style-warning flex items-start gap-1.5 text-xs',
    )
    expect(cn('text-style-destructive', 'absolute top-full mt-1 text-end text-xs')).toBe(
      'text-style-destructive absolute top-full mt-1 text-end text-xs',
    )
  })

  it('lets the later color class win between a color-only role and a text color', () => {
    expect(cn('text-style-body', 'text-destructive')).toBe('text-destructive')
    expect(cn('text-destructive', 'text-style-body')).toBe('text-style-body')
    expect(cn('text-style-muted', 'text-warning')).toBe('text-warning')
    expect(cn('text-warning', 'text-style-muted')).toBe('text-style-muted')
    expect(cn('text-style-body', 'text-sm text-destructive')).toBe('text-sm text-destructive')
    expect(cn('text-style-body', 'text-sm')).toBe('text-style-body text-sm')
  })

  it('keeps a size-setting role beside a text color in either order', () => {
    expect(cn('text-style-body-compact', 'text-destructive')).toBe(
      'text-style-body-compact text-destructive',
    )
    expect(cn('text-destructive', 'text-style-body-compact')).toBe(
      'text-destructive text-style-body-compact',
    )
    expect(cn('text-style-caption', 'text-destructive')).toBe('text-style-caption text-destructive')
    expect(cn('text-destructive', 'text-style-caption')).toBe('text-destructive text-style-caption')
  })

  it('replaces sibling heading-style composites', () => {
    expect(cn('heading-style-page', 'heading-style-section')).toBe('heading-style-section')
  })

  it('drops atomic heading typography when a composite follows', () => {
    expect(cn('text-4xl font-heading tracking-tight', 'heading-style-page')).toBe(
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

  it('preserves layout and color classes when merging eyebrow composites', () => {
    expect(cn('eyebrow-style-xs', 'text-foreground')).toBe('eyebrow-style-xs text-foreground')
  })

  it('preserves layout and color classes when merging heading composites', () => {
    expect(cn('heading-style-section', 'mb-4 text-foreground')).toBe(
      'heading-style-section mb-4 text-foreground',
    )
  })
})
