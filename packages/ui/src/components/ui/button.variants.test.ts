import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button.variants'
import {
  controlActionGapClassesForTier,
  resolveControlActionMetricsTier,
} from './resolve-control-action-metrics-tier'

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
    expect(defaultClasses).not.toContain('[&_svg]:size-icon-glyph-lg')
    expect(defaultClasses).toContain('gap-1')
    expect(defaultClasses).not.toContain('gap-2')

    const compactClasses = classesFor({
      variant: 'ghost',
      size: 'xs',
      density: 'compact',
    })
    expect(compactClasses).toContain('text-control-action-xs')
    expect(compactClasses).toContain('h-control-action-compact')
    expect(compactClasses).toContain('px-2')
    expect(compactClasses).toContain('[&_svg]:size-icon-glyph-xs')
    expect(compactClasses).not.toContain('[&_svg]:size-icon-glyph-lg')
    expect(compactClasses).toContain('gap-1')
  })

  it('derives icon-label gap from the resolved control-action tier', () => {
    const cases = [
      {
        props: { variant: 'outline' as const, size: 'xs' as const, density: 'default' as const },
        tier: 'xs' as const,
      },
      {
        props: { variant: 'outline' as const, size: 'sm' as const, density: 'compact' as const },
        tier: 'xs' as const,
      },
      {
        props: { variant: 'outline' as const, size: 'sm' as const, density: 'default' as const },
        tier: 'sm' as const,
      },
      {
        props: {
          variant: 'default' as const,
          size: 'default' as const,
          density: 'default' as const,
        },
        tier: 'md' as const,
      },
    ] as const

    for (const { props, tier } of cases) {
      expect(resolveControlActionMetricsTier(props.size, props.density, props.variant)).toBe(tier)
      expect(classesFor(props)).toContain(controlActionGapClassesForTier(tier))
    }
  })

  it('applies default lg glyph to standard chrome sizes', () => {
    const classes = classesFor({ variant: 'default', size: 'default', density: 'default' })
    expect(classes).toContain('[&_svg]:size-icon-glyph-lg')
    expect(classes).not.toContain('[&_svg]:size-icon-glyph-xs')
  })

  it('applies sm glyph to chrome sm and not lg', () => {
    const classes = classesFor({ variant: 'outline', size: 'sm', density: 'default' })
    expect(classes).toContain('[&_svg]:size-icon-glyph-sm')
    expect(classes).not.toContain('[&_svg]:size-icon-glyph-lg')
  })

  it('applies control-action-xs typography to text xs compact actions', () => {
    const compactClasses = classesFor({ variant: 'text', size: 'xs', density: 'compact' })
    expect(compactClasses).toContain('text-control-action-xs')
    expect(compactClasses).toContain('h-control-action-compact')
    expect(compactClasses).toContain('[&_svg]:size-icon-glyph-xs')
    expect(compactClasses).not.toContain('[&_svg]:size-icon-glyph-lg')
  })

  it('does not stack lg onto text sm compact', () => {
    const classes = classesFor({ variant: 'text', size: 'sm', density: 'compact' })
    expect(classes).toContain('[&_svg]:size-icon-glyph-sm')
    expect(classes).not.toContain('[&_svg]:size-icon-glyph-lg')
  })

  it('keeps text xs default density on the general text-sm scale', () => {
    const classes = classesFor({ variant: 'text', size: 'xs', density: 'default' })
    expect(classes).toContain('text-sm')
    expect(classes).not.toContain('text-control-action-xs')
    expect(classes).toContain('h-8')
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
    expect(defaultClasses).not.toContain('[&_svg]:size-icon-glyph-lg')
    expect(defaultClasses).not.toContain('[&_svg]:size-icon-glyph-md')

    expect(compactClasses).toBe(defaultClasses)
  })
})
