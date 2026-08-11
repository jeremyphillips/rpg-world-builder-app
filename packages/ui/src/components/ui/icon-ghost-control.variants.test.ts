import { describe, expect, it } from 'vitest'

import { iconGhostControlVariants } from './icon-ghost-control.variants'

describe('iconGhostControlVariants', () => {
  it('composes compact geometry with embedded focus', () => {
    const classes = iconGhostControlVariants({ size: 'compact', hover: 'text', layout: 'flex' })

    expect(classes).toContain('size-control-action-compact')
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).not.toContain('focus-visible:ring-offset-2')
    expect(classes).toContain('hover:text-foreground')
  })

  it('supports comfortable hit targets and destructive hover tones', () => {
    const classes = iconGhostControlVariants({
      size: 'comfortable',
      hover: 'destructive',
      layout: 'flex',
    })

    expect(classes).toContain('size-8')
    expect(classes).toContain('hover:text-destructive')
  })

  it('supports accent and destructive-subtle hover fills', () => {
    expect(iconGhostControlVariants({ hover: 'accent' })).toContain('hover:bg-control-hover')
    expect(iconGhostControlVariants({ hover: 'destructiveSubtle' })).toContain(
      'hover:bg-destructive-subtle',
    )
  })
})
