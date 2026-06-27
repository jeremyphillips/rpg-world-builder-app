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
})
