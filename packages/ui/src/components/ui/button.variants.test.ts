import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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
    const classes = classesFor({
      variant: 'outline',
      size: 'xs',
    })
    expect(classes).toContain('ui-button--xs')
    expect(classes).toContain('ui-button--outline')
    expect(classes).not.toContain('ui-button--md')
  })

  it('derives icon-label gap tier from size (control-action metrics)', () => {
    const cases = [
      {
        props: { variant: 'outline' as const, size: 'xs' as const },
        tier: 'xs' as const,
      },
      {
        props: { variant: 'outline' as const, size: 'sm' as const },
        tier: 'sm' as const,
      },
      {
        props: {
          variant: 'default' as const,
          size: 'default' as const,
        },
        tier: 'md' as const,
      },
    ] as const

    for (const { props, tier } of cases) {
      expect(resolveControlActionMetricsTier(props.size, props.variant)).toBe(tier)
      expect(resolveControlActionGapClass(tier)).toBeTruthy()
    }
  })

  it('maps default chrome to ui-button--md and appearance primary', () => {
    const classes = classesFor({ variant: 'default', size: 'default' })
    expect(classes).toContain('ui-button--primary')
    expect(classes).toContain('ui-button--md')
  })

  it('maps sm chrome to ui-button--sm', () => {
    const classes = classesFor({ variant: 'outline', size: 'sm' })
    expect(classes).toContain('ui-button--sm')
    expect(classes).toContain('ui-button--outline')
  })

  it('keeps every sm modifier at text-xs so text and attached do not inherit 14px', () => {
    const source = readFileSync(join(__dirname, 'button.css'), 'utf8')
    const modifiers = ['.ui-button--sm {', '.ui-button__text--sm {', '.ui-button--attached-sm {']

    for (const modifier of modifiers) {
      const start = source.indexOf(modifier)
      const block = source.slice(start, source.indexOf('}', start))
      expect(block, modifier).toContain('font-size: var(--text-xs)')
    }
  })

  it('maps text xs to semantic text geometry', () => {
    const classes = classesFor({ variant: 'text', size: 'xs' })
    expect(classes).toContain(UI_BUTTON_TEXT_SIZE_CLASS)
    expect(classes).toContain(TEXT_BUTTON_SIZE_CLASS.xs)
  })

  it('maps text sm without lg glyph classes', () => {
    const classes = classesFor({ variant: 'text', size: 'sm' })
    expect(classes).toContain(TEXT_BUTTON_SIZE_CLASS.sm)
    expect(classes).not.toContain('ui-button--md')
  })

  it('maps text lg geometry', () => {
    expect(resolveTextButtonGeometryClass('lg')).toBe('ui-button__text--lg')
    const classes = classesFor({ variant: 'text', size: 'lg' })
    expect(classes).toContain('ui-button__text--lg')
  })

  it('maps text icon-xs to text chrome plus the icon-xs host', () => {
    const classes = classesFor({ variant: 'text', size: 'icon-xs' })
    expect(classes).toContain(UI_BUTTON_TEXT_SIZE_CLASS)
    expect(classes).toContain('ui-button--icon-xs')
    expect(classes).not.toContain('ui-button__text--default')
  })

  it('maps text icon-sm to text chrome plus the icon-sm host', () => {
    const classes = classesFor({ variant: 'text', size: 'icon-sm' })
    expect(classes).toContain(UI_BUTTON_TEXT_SIZE_CLASS)
    expect(classes).toContain('ui-button--icon-sm')
    expect(classes).not.toContain('ui-button__text--default')
  })

  it('normalizes attached xs to attached-sm size tier', () => {
    const attachedSm = classesFor({ variant: 'attached', size: 'sm' })
    const attachedXs = classesFor({ variant: 'attached', size: 'xs' })

    expect(attachedXs).toContain('ui-button--attached-xs')
    expect(attachedSm).toContain('ui-button--attached-sm')
    expect(attachedXs).toContain('ui-button--attached')
    expect(attachedXs).not.toContain('ui-button--xs')
  })

  it('maps icon size to ui-button--icon-md', () => {
    const classes = classesFor({ size: 'icon' })
    expect(classes).toContain('ui-button--icon-md')
  })

  it('maps icon-xs to ui-button--icon-xs', () => {
    const classes = classesFor({ size: 'icon-xs' })
    expect(classes).toContain('ui-button--icon-xs')
  })

  it('maps icon-sm to ui-button--icon-sm', () => {
    const classes = classesFor({ size: 'icon-sm' })
    expect(classes).toContain('ui-button--icon-sm')
  })

  it('publishes one owner icon token per size modifier', () => {
    const source = readFileSync(join(__dirname, 'button.css'), 'utf8')
    const tokens = {
      '.ui-button--xs': '--icon-glyph-sm',
      '.ui-button--sm': '--icon-glyph-md',
      '.ui-button--md': '--icon-glyph-md',
      '.ui-button--lg': '--icon-glyph-lg',
      '.ui-button__text--xs': '--icon-glyph-sm',
      '.ui-button__text--sm': '--icon-glyph-md',
      '.ui-button__text--default': '--icon-glyph-md',
      '.ui-button__text--lg': '--icon-glyph-lg',
      '.ui-button--attached-xs': '--icon-glyph-sm',
      '.ui-button--attached-sm': '--icon-glyph-md',
      '.ui-button--attached-md': '--icon-glyph-md',
      '.ui-button--attached-lg': '--icon-glyph-lg',
      '.ui-button--icon-xs': '--icon-glyph-md',
      '.ui-button--icon-sm': '--icon-glyph-lg',
      '.ui-button--icon-md': '--icon-glyph-xl',
      '.ui-button--icon-lg': '--icon-glyph-2xl',
    } as const

    for (const [modifier, token] of Object.entries(tokens)) {
      const start = source.indexOf(`${modifier} {`)
      expect(start, modifier).toBeGreaterThanOrEqual(0)
      const block = source.slice(start, source.indexOf('}', start))
      expect(block.match(/--icon-size:/g), modifier).toHaveLength(1)
      expect(block, modifier).toContain(`--icon-size: var(${token})`)
    }
  })
})
