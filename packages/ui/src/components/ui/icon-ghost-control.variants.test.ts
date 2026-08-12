import { describe, expect, it } from 'vitest'

import { iconGhostControlVariants } from './icon-ghost-control.variants'

describe('iconGhostControlVariants', () => {
  it('composes compact geometry with embedded focus', () => {
    const classes = iconGhostControlVariants({ hover: 'text', layout: 'flex' })

    expect(classes).toContain('size-control-action-compact')
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).not.toContain('focus-visible:ring-offset-2')
    expect(classes).toContain('hover:text-foreground')
  })

  it('supports semantic destructive hover tones', () => {
    expect(iconGhostControlVariants({ hover: 'destructive' })).toContain('hover:text-destructive')
    expect(iconGhostControlVariants({ hover: 'destructiveSubtle' })).toContain(
      'hover:bg-destructive-subtle',
    )
  })

  it('supports accent hover fill', () => {
    expect(iconGhostControlVariants({ hover: 'accent' })).toContain('hover:bg-control-hover')
  })
})
