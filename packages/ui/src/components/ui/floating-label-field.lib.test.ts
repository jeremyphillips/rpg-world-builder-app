import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { fieldCaptionTypographyVariants } from './field-caption.variants'
import { UI_FIELD_GROUP_VALUE_SLOT_START_CLASS } from './field-group.styles'
import { withFloatingLabelSizingLabel } from './floating-label-field.lib'
import { FLOATING_LABEL_LAYER_CLASS } from './floating-label-field.styles'
import { floatingLabelLayerVariants } from './floating-label-field.variants'

const floatingLabelCssPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'floating-label-field.css',
)

const fieldGroupCssPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'field-group.css',
)

const tailwindThemeCssPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../styles/tokens/tailwind-theme.css',
)

function readTokenRem(css: string, name: string): number {
  const match = css.match(new RegExp(`${name}:\\s*([0-9.]+)rem`))
  if (!match?.[1]) throw new Error(`Missing ${name}`)
  return Number(match[1])
}

describe('floating-label-field.lib', () => {
  it('appends the label as a sizing ghost', () => {
    expect(withFloatingLabelSizingLabel('School', ['All', 'Evocation'])).toEqual([
      'All',
      'Evocation',
      'School',
    ])
  })

  it('derives floated label sizes from the type scale with an 11px compact floor', () => {
    const fieldCss = readFileSync(floatingLabelCssPath, 'utf8')
    const themeCss = readFileSync(tailwindThemeCssPath, 'utf8')
    expect(fieldCss).toContain('--field-floating-label-reduction')
    expect(fieldCss).toContain('--field-floating-label-sm')
    expect(fieldCss).toContain('--field-floating-label-md')
    expect(fieldCss).not.toContain('--floating-label-scale-md')

    const xs = readTokenRem(themeCss, '--text-xs')
    const xsMeta = readTokenRem(themeCss, '--text-fine-sm')
    const md = readTokenRem(themeCss, '--text-md')
    const reduction = readTokenRem(fieldCss, '--field-floating-label-reduction')

    const expectedSm = Math.max(xsMeta, xs - reduction)
    const expectedMd = md - reduction

    expect(expectedSm).toBeCloseTo(xsMeta, 6)
    expect(expectedMd).toBeCloseTo(0.8125, 6) /* 13px */
  })

  it('does not encode float state in Tailwind group selectors', () => {
    const variantsSource = readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        'floating-label-field.variants.ts',
      ),
      'utf8',
    )
    expect(variantsSource).not.toContain('group/float')
    expect(variantsSource).not.toContain('group-focus-within/float')
  })

  it('uses caption typography without importing filters', () => {
    expect(fieldCaptionTypographyVariants({ size: 'sm' })).toBe('text-style-caption')
    expect(fieldCaptionTypographyVariants({ size: 'md' })).toBe('text-style-supporting')
  })

  it('lines the resting label up with the value inset', () => {
    const css = readFileSync(floatingLabelCssPath, 'utf8')
    const fieldGroupCss = readFileSync(fieldGroupCssPath, 'utf8')
    expect(floatingLabelLayerVariants({ size: 'sm' })).toBe(FLOATING_LABEL_LAYER_CLASS)
    expect(css).toContain('ui-floating-label-field--sm .ui-floating-label-field__layer')
    expect(css).toContain('calc(var(--spacing) * 2.5)')
    expect(UI_FIELD_GROUP_VALUE_SLOT_START_CLASS).toBe('ui-field-group__value-slot--start')
    expect(css).toContain('ui-floating-label-field--md .ui-floating-label-field__layer')
    expect(css).toContain('calc(var(--spacing) * 3)')
    expect(fieldGroupCss).toContain('--ui-field-slot-ps-start')
    expect(fieldGroupCss).toContain('var(--field-padding-md)')
  })
})
