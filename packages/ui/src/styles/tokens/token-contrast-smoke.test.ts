import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

/** Extract perceptual lightness (0–1) from simple oklch() literals for smoke contrast checks. */
function oklchLightness(value: string): number | undefined {
  const match = value.match(/oklch\(\s*([\d.]+)/)
  return match ? Number(match[1]) : undefined
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function readPaletteVar(css: string, name: string): string | undefined {
  const match = css.match(
    new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`),
  )
  return match?.[1]?.trim()
}

/** Minimum contrast ratio for smoke checks — oklch-L approximation, not full WCAG. */
const MIN_SOLID_CONTRAST = 2.3

describe('token contrast smoke checks', () => {
  const lightCss = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
  const darkCss = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')

  it('keeps readable field text on default field background (light + dark)', () => {
    for (const css of [lightCss, darkCss]) {
      const fg = oklchLightness(readPaletteVar(css, '--palette-fg-default') ?? '')
      const bg = oklchLightness(readPaletteVar(css, '--palette-field-bg') ?? '')
      expect(fg, 'field fg L').toBeDefined()
      expect(bg, 'field bg L').toBeDefined()
      expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(MIN_SOLID_CONTRAST)
    }
  })

  it('keeps disabled field text visually distinct from disabled field background', () => {
    for (const css of [lightCss, darkCss]) {
      const fg = oklchLightness(readPaletteVar(css, '--palette-field-fg-disabled') ?? '')
      const bg = oklchLightness(readPaletteVar(css, '--palette-field-bg-disabled') ?? '')
      expect(fg, 'disabled fg L').toBeDefined()
      expect(bg, 'disabled bg L').toBeDefined()
      expect(Math.abs(fg! - bg!)).toBeGreaterThan(0.04)
    }
  })

  it('keeps placeholder text visually distinct from field background', () => {
    for (const css of [lightCss, darkCss]) {
      const fg = oklchLightness(readPaletteVar(css, '--palette-field-placeholder') ?? '')
      const bg = oklchLightness(readPaletteVar(css, '--palette-field-bg') ?? '')
      expect(fg, 'placeholder L').toBeDefined()
      expect(bg, 'field bg L').toBeDefined()
      expect(Math.abs(fg! - bg!)).toBeGreaterThan(0.04)
    }
  })

  it('keeps primary foreground readable on primary (light + dark)', () => {
    const lightFg = oklchLightness(readPaletteVar(lightCss, '--palette-fg-on-solid') ?? '')
    const lightBg = oklchLightness(readPaletteVar(lightCss, '--palette-primary') ?? '')
    expect(contrastRatio(lightFg!, lightBg!)).toBeGreaterThanOrEqual(MIN_SOLID_CONTRAST)

    const darkFg = oklchLightness(readPaletteVar(darkCss, '--palette-primary-foreground') ?? '')
    const darkBg = oklchLightness(readPaletteVar(darkCss, '--palette-primary') ?? '')
    expect(contrastRatio(darkFg!, darkBg!)).toBeGreaterThanOrEqual(MIN_SOLID_CONTRAST)
  })
})
