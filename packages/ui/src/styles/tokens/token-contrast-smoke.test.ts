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

  it('keeps placeholder text derived from muted foreground toward field plane', () => {
    for (const css of [lightCss, darkCss]) {
      const placeholder = resolvePaletteVar(css, '--palette-field-placeholder') ?? ''
      const fieldBg = resolvePaletteVar(css, '--palette-field-bg') ?? ''
      expect(placeholder).toContain('color-mix')
      expect(placeholder).toContain('var(--palette-fg-default)')
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

  it('derives muted foreground from fg-default toward canvas (light + dark)', () => {
    for (const css of [lightCss, darkCss]) {
      const raw = readPaletteVar(css, '--palette-fg-muted') ?? ''
      expect(raw).toContain('color-mix')
      expect(raw).toContain('var(--palette-fg-default)')
      expect(raw).toContain('var(--palette-surface-base)')
    }
  })

  it('derives subtle foreground between default and muted (light + dark)', () => {
    for (const css of [lightCss, darkCss]) {
      const raw = readPaletteVar(css, '--palette-fg-subtle') ?? ''
      expect(raw).toContain('color-mix')
      expect(raw).toContain('var(--palette-fg-default)')
      expect(raw).toContain('var(--palette-surface-base)')
    }
  })

  it('aliases on-muted field fill to surface-subtle in both semantic themes', () => {
    const semanticLight = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
    const semanticDark = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')

    for (const css of [semanticLight, semanticDark]) {
      expect(readPaletteVar(css, '--field-control-bg-on-muted')).toBe('var(--surface-subtle)')
      expect(readPaletteVar(css, '--field-control-bg-default')).toBe('var(--palette-field-bg)')
      expect(readPaletteVar(css, '--outline-control-border')).toBe('var(--border-subtle)')
    }
  })
})
