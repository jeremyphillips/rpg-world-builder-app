import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button.variants'

function classesFor(props: Parameters<typeof buttonVariants>[0]): string {
  return buttonVariants(props) ?? ''
}

describe('buttonVariants matrix', () => {
  it('applies xs chrome typography and geometry via control-action recipes', () => {
    const defaultClasses = classesFor({
      variant: 'outline',
      size: 'xs',
      density: 'default',
    })
    expect(defaultClasses).toContain('text-control-action-xs')
    expect(defaultClasses).toContain('h-control-action-xs')
    expect(defaultClasses).toContain('[&_svg]:size-icon-glyph-xs')

    const compactClasses = classesFor({
      variant: 'ghost',
      size: 'xs',
      density: 'compact',
    })
    expect(compactClasses).toContain('text-control-action-xs')
    expect(compactClasses).toContain('h-control-action-compact')
    expect(compactClasses).toContain('px-2')
  })

  it('keeps text variant typography off control-action-xs when size is xs', () => {
    for (const density of ['default', 'compact'] as const) {
      const classes = classesFor({ variant: 'text', size: 'xs', density })
      expect(classes).toContain('text-sm')
      expect(classes).not.toContain('text-control-action-xs')
      expect(classes).toContain(density === 'default' ? 'h-8' : 'h-6')
    }
  })

  it('normalizes attached xs to the same geometry as attached sm', () => {
    const attachedSm = classesFor({ variant: 'attached', size: 'sm' })
    const attachedXs = classesFor({ variant: 'attached', size: 'xs' })

    expect(attachedXs).toContain('text-xs')
    expect(attachedXs).toContain('px-2.5')
    expect(attachedSm).toContain('px-2.5')
    expect(attachedXs).toContain('h-full')
    expect(attachedSm).toContain('h-full')
    expect(attachedXs).not.toContain('text-control-action-xs')
  })

  it('keeps icon-xs geometry identical across density', () => {
    const defaultClasses = classesFor({ size: 'icon-xs', density: 'default' })
    const compactClasses = classesFor({ size: 'icon-xs', density: 'compact' })

    expect(defaultClasses).toContain('size-control-action-compact')
    expect(defaultClasses).toContain('[&_svg]:size-icon-glyph-xs')
    expect(defaultClasses).not.toContain('[&_svg]:size-icon-glyph-md')

    expect(compactClasses).toBe(defaultClasses)
  })
})
