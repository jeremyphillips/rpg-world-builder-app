import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button.variants'
import {
  resolveTextButtonGeometryClass,
  TEXT_BUTTON_SIZE_CLASS,
  UI_BUTTON_TEXT_SIZE_CLASS,
} from './button.styles'
import { resolveControlActionGapClass } from './compact-control.styles'
import { resolveControlActionMetricsTier } from './control-action.variants'

function classesFor(props: Parameters<typeof buttonVariants>[0]): string {
  return buttonVariants(props) ?? ''
}

describe('buttonVariants matrix', () => {
  it('emits semantic chrome classes for xs sizes', () => {
    const defaultClasses = classesFor({
      variant: 'outline',
      size: 'xs',
      density: 'default',
    })
    expect(defaultClasses).toContain('ui-button--xs')
    expect(defaultClasses).toContain('ui-button--outline')
    expect(defaultClasses).not.toContain('ui-button--md')

    const compactClasses = classesFor({
      variant: 'ghost',
      size: 'xs',
      density: 'compact',
    })
    expect(compactClasses).toContain('ui-button--xs-compact')
    expect(compactClasses).toContain('ui-button--ghost')
  })

  it('derives icon-label gap tier from size and density (control-action metrics)', () => {
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
      expect(resolveControlActionGapClass(tier)).toBeTruthy()
    }
  })

  it('maps default chrome to ui-button--md and appearance primary', () => {
    const classes = classesFor({ variant: 'default', size: 'default', density: 'default' })
    expect(classes).toContain('ui-button--primary')
    expect(classes).toContain('ui-button--md')
  })

  it('maps sm chrome to ui-button--sm', () => {
    const classes = classesFor({ variant: 'outline', size: 'sm', density: 'default' })
    expect(classes).toContain('ui-button--sm')
    expect(classes).toContain('ui-button--outline')
  })

  it('maps text xs compact to semantic text geometry', () => {
    const compactClasses = classesFor({ variant: 'text', size: 'xs', density: 'compact' })
    expect(compactClasses).toContain(UI_BUTTON_TEXT_SIZE_CLASS)
    expect(compactClasses).toContain(TEXT_BUTTON_SIZE_CLASS.xs.compact)
  })

  it('maps text sm compact without lg glyph classes', () => {
    const classes = classesFor({ variant: 'text', size: 'sm', density: 'compact' })
    expect(classes).toContain(TEXT_BUTTON_SIZE_CLASS.sm.compact)
    expect(classes).not.toContain('ui-button--md')
  })

  it('maps text xs default density to general text geometry', () => {
    const classes = classesFor({ variant: 'text', size: 'xs', density: 'default' })
    expect(classes).toContain(TEXT_BUTTON_SIZE_CLASS.xs.default)
    expect(classes).not.toContain(TEXT_BUTTON_SIZE_CLASS.xs.compact)
  })

  it('fixes text lg compact geometry', () => {
    expect(resolveTextButtonGeometryClass('lg', 'compact')).toBe('ui-button__text--lg-compact')
    const classes = classesFor({ variant: 'text', size: 'lg', density: 'compact' })
    expect(classes).toContain('ui-button__text--lg-compact')
  })

  it('normalizes attached xs to attached-sm size tier', () => {
    const attachedSm = classesFor({ variant: 'attached', size: 'sm' })
    const attachedXs = classesFor({ variant: 'attached', size: 'xs' })

    expect(attachedXs).toContain('ui-button--attached-xs')
    expect(attachedSm).toContain('ui-button--attached-sm')
    expect(attachedXs).toContain('ui-button--attached')
    expect(attachedXs).not.toContain('ui-button--xs')
  })

  it('keeps icon-xs geometry identical across density', () => {
    const defaultClasses = classesFor({ size: 'icon-xs', density: 'default' })
    const compactClasses = classesFor({ size: 'icon-xs', density: 'compact' })

    expect(defaultClasses).toContain('ui-button--icon-xs')
    expect(compactClasses).toBe(defaultClasses)
  })

  it('maps icon compact density to ui-button--icon-compact', () => {
    const classes = classesFor({ size: 'icon', density: 'compact' })
    expect(classes).toContain('ui-button--icon-compact')
  })
})
