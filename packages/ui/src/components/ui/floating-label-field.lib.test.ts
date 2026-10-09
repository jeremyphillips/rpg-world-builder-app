import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { fieldCaptionTypographyVariants } from './field-caption.variants'
import { fieldGroupedValueSlotStartPaddingClasses } from './field-sizing.variants'
import { FLOATING_LABEL_COMFORTABLE_SCALE_RATIO } from './floating-label-field.lib'
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

  it('keeps the comfortable scale token aligned with the type scale', () => {
    const css = readFileSync(stylesDir, 'utf8')
    const ratio = readTokenRem(css, '--text-sm') / readTokenRem(css, '--text-md')
    const declared = css.match(/--floating-label-scale-md:\s*([0-9.]+)/)
    expect(declared?.[1]).toBeTruthy()
    expect(Number(declared?.[1])).toBeCloseTo(ratio, 6)
    expect(FLOATING_LABEL_COMFORTABLE_SCALE_RATIO).toBeCloseTo(ratio, 6)
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
