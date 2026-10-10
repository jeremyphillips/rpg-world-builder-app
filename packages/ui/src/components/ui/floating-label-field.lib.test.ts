import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { fieldCaptionTypographyVariants } from './field-caption.variants'
import { fieldGroupedValueSlotStartPaddingClasses } from './field-sizing.variants'
import { withFloatingLabelSizingLabel } from './floating-label-field.lib'
import { floatingLabelLayerVariants } from './floating-label-field.variants'

const stylesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../styles/globals.css',
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
    const css = readFileSync(stylesDir, 'utf8')
    expect(css).toContain('--field-floating-label-reduction')
    expect(css).toContain('--field-floating-label-sm')
    expect(css).toContain('--field-floating-label-md')
    expect(css).not.toContain('--floating-label-scale-md')

    const xs = readTokenRem(css, '--text-xs')
    const xsMeta = readTokenRem(css, '--text-xs-meta')
    const md = readTokenRem(css, '--text-md')
    const reduction = readTokenRem(css, '--field-floating-label-reduction')

    const expectedSm = Math.max(xsMeta, xs - reduction)
    const expectedMd = md - reduction

    expect(expectedSm).toBeCloseTo(xsMeta, 6)
    expect(expectedMd).toBeCloseTo(0.8125, 6) /* 13px */
  })

  it('uses caption typography without importing filters', () => {
    expect(fieldCaptionTypographyVariants({ size: 'sm' })).toBe('text-muted-foreground text-xs')
    expect(fieldCaptionTypographyVariants({ size: 'md' })).toBe('text-muted-foreground text-sm')
  })

  it('lines the resting label up with the value inset', () => {
    expect(floatingLabelLayerVariants({ size: 'sm' })).toContain('start-2.5')
    expect(fieldGroupedValueSlotStartPaddingClasses.sm).toContain('ps-2.5')
    expect(floatingLabelLayerVariants({ size: 'md' })).toContain('start-3')
    expect(fieldGroupedValueSlotStartPaddingClasses.md).toContain('ps-3')
  })
})
