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

/** Resolve `var(--palette-*)` alias chains for smoke checks. Stops at color-mix or oklch literals. */
function resolvePaletteVar(css: string, name: string): string | undefined {
  let raw = readPaletteVar(css, name)
  if (!raw) return undefined

  for (let depth = 0; depth < 6; depth++) {
    const alias = raw.match(/^var\((--palette-[\w-]+)\)$/)
    if (!alias) return raw
    raw = readPaletteVar(css, alias[1]!)
    if (!raw) return undefined
  }

  return raw
}

/** Minimum contrast ratio for smoke checks — oklch-L approximation, not full WCAG. */
const MIN_SOLID_CONTRAST = 2.3
/** Minimum fill separation for default field plane vs card / subtle wash backgrounds. */
const MIN_FIELD_FILL_SURFACE_CONTRAST = 1.02

function blendedLightness(fgL: number, bgL: number, fgWeightPercent: number): number {
  const weight = fgWeightPercent / 100
  return fgL * weight + bgL * (1 - weight)
}

function subtleWashMixWeight(paletteCss: string): number {
  const subtle = readPaletteVar(paletteCss, '--palette-surface-subtle') ?? ''
  const match = subtle.match(/neutral-contrast\)\s*([\d.]+)%/)
  return match ? Number(match[1]) : 8
}

function fieldFillContrastChecks(paletteCss: string): {
  fieldVsCard: number
  fieldVsSubtle: number
} {
  const baseL = oklchLightness(resolvePaletteVar(paletteCss, '--palette-surface-base') ?? '')!
  const panelL = oklchLightness(resolvePaletteVar(paletteCss, '--palette-surface-panel') ?? '')!
  const contrastL = oklchLightness(
    resolvePaletteVar(paletteCss, '--palette-neutral-contrast') ?? '',
  )!

  const fieldRaw = resolvePaletteVar(paletteCss, '--palette-surface-field') ?? ''
  const fieldL = fieldRaw.includes('white')
    ? blendedLightness(baseL, 1, 50)
    : blendedLightness(baseL, panelL, 30)

  const subtleL = blendedLightness(contrastL, baseL, subtleWashMixWeight(paletteCss))

  return {
    fieldVsCard: contrastRatio(fieldL, panelL),
    fieldVsSubtle: contrastRatio(fieldL, subtleL),
  }
}

describe('token contrast smoke checks', () => {
  const lightCss = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
  const darkCss = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')

  it('keeps readable field text on default field background (light + dark)', () => {
    for (const css of [lightCss, darkCss]) {
      const fg = oklchLightness(readPaletteVar(css, '--palette-fg-default') ?? '')
      const fieldBgRaw = resolvePaletteVar(css, '--palette-field-bg') ?? ''
      expect(fg, 'field fg L').toBeDefined()
      expect(fieldBgRaw).toContain('color-mix')
      expect(fieldBgRaw).toContain('var(--palette-surface-base)')

      const bg = oklchLightness(fieldBgRaw)
      if (bg !== undefined) {
        expect(contrastRatio(fg!, bg)).toBeGreaterThanOrEqual(MIN_SOLID_CONTRAST)
      }
    }
  })

  it('keeps disabled field text derived separately from disabled field background', () => {
    for (const css of [lightCss, darkCss]) {
      const fg = resolvePaletteVar(css, '--palette-field-fg-disabled') ?? ''
      const bg = resolvePaletteVar(css, '--palette-field-bg-disabled') ?? ''
      expect(fg).toContain('color-mix')
      expect(fg).toContain('var(--palette-fg-default)')
      expect(bg).toContain('color-mix')
      expect(bg).toContain('var(--palette-surface-field)')
    }
  })

  it('keeps placeholder text derived toward field plane', () => {
    for (const css of [lightCss, darkCss]) {
      const placeholder = resolvePaletteVar(css, '--palette-field-placeholder') ?? ''
      const fieldBg = resolvePaletteVar(css, '--palette-field-bg') ?? ''
      expect(placeholder).toContain('color-mix')
      expect(placeholder).toContain('var(--palette-fg-default)')
      expect(placeholder).toContain('var(--palette-surface-field)')
      expect(fieldBg).toContain('color-mix')
      expect(fieldBg).toContain('var(--palette-surface-base)')
    }
  })

  it('keeps primary foreground readable on primary (light + dark)', () => {
    const lightFg = oklchLightness(resolvePaletteVar(lightCss, '--palette-fg-on-solid') ?? '')
    const lightBg = oklchLightness(readPaletteVar(lightCss, '--palette-primary') ?? '')
    expect(contrastRatio(lightFg!, lightBg!)).toBeGreaterThanOrEqual(MIN_SOLID_CONTRAST)

    const darkFg = oklchLightness(readPaletteVar(darkCss, '--palette-primary-foreground') ?? '')
    const darkBg = oklchLightness(readPaletteVar(darkCss, '--palette-primary') ?? '')
    expect(contrastRatio(darkFg!, darkBg!)).toBeGreaterThanOrEqual(MIN_SOLID_CONTRAST)
  })

  it('keeps interactive outline border distinct from border-subtle in both semantic themes', () => {
    const semanticLight = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
    const semanticDark = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')

    for (const css of [semanticLight, semanticDark]) {
      expect(readPaletteVar(css, '--field-control-bg-on-muted')).toBe('var(--surface-subtle)')
      expect(readPaletteVar(css, '--field-control-bg-default')).toBe('var(--palette-field-bg)')

      const interactive = readPaletteVar(css, '--interactive-outline-border') ?? ''
      expect(interactive).toContain('color-mix')
      expect(interactive).toContain('var(--mix-interactive-outline-border)')
      expect(interactive).not.toBe('var(--border-subtle)')
    }
  })

  it('keeps default field fill separated from card and surface-subtle planes (light + dark)', () => {
    for (const [paletteCss, theme] of [
      [lightCss, 'light'],
      [darkCss, 'dark'],
    ] as const) {
      const { fieldVsCard, fieldVsSubtle } = fieldFillContrastChecks(paletteCss)
      expect(fieldVsCard, `${theme} field vs card`).toBeGreaterThanOrEqual(
        MIN_FIELD_FILL_SURFACE_CONTRAST,
      )
      expect(fieldVsSubtle, `${theme} field vs subtle`).toBeGreaterThanOrEqual(
        MIN_FIELD_FILL_SURFACE_CONTRAST,
      )
    }
  })
})
