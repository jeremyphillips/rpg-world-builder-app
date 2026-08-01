import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { FIELD_CONTROL_SEMANTIC_ROLES, SURFACE_RELATIVE_CHROME_ROLES } from './palette-inventory'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

function extractRoleValue(css: string, role: string): string | undefined {
  const match = css.match(
    new RegExp(`${role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`),
  )
  return match?.[1]?.trim()
}

function readThemeCss(): { light: string; dark: string } {
  return {
    light: readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8'),
    dark: readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8'),
  }
}

const SURFACE_RELATIVE_FORMULA_ROLES = [
  '--muted-foreground',
  '--foreground-subtle',
  '--foreground-disabled',
  '--border-faint',
  '--border-subtle',
  '--border-default',
  '--border-strong',
  '--card-selected-border',
] as const

const MIX_WEIGHT_ROLES = [
  '--mix-fg-subtle',
  '--mix-fg-muted',
  '--mix-fg-disabled',
  '--mix-border-faint',
  '--mix-border-subtle',
  '--mix-border-default',
  '--mix-border-strong',
  '--mix-border-selected',
  '--mix-sidebar-nav-item-fg',
] as const

/** Minimum contrast ratio for smoke checks — oklch-L approximation, not full WCAG. */
const MIN_MUTED_CONTRAST = 2.0
const MIN_BORDER_CONTRAST = 1.15

function oklchLightness(value: string): number | undefined {
  const match = value.match(/oklch\(\s*([\d.]+)/)
  return match ? Number(match[1]) : undefined
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('surface-relative chrome formulas', () => {
  const { light, dark } = readThemeCss()

  it('declares surface-relative chrome roles in both themes', () => {
    for (const role of SURFACE_RELATIVE_CHROME_ROLES) {
      expect(extractRoleValue(light, role), `${role} in semantic-light.css`).toBeTruthy()
      expect(extractRoleValue(dark, role), `${role} in semantic-dark.css`).toBeTruthy()
    }
  })

  it('defaults --surface-current to page canvas', () => {
    expect(extractRoleValue(light, '--surface-current')).toBe('var(--background)')
    expect(extractRoleValue(dark, '--surface-current')).toBe('var(--background)')
  })

  it('mirrors formula shape for neutral chrome roles across themes', () => {
    for (const role of SURFACE_RELATIVE_FORMULA_ROLES) {
      const lightValue = extractRoleValue(light, role) ?? ''
      const darkValue = extractRoleValue(dark, role) ?? ''

      expect(lightValue).toContain('color-mix')
      expect(darkValue).toContain('color-mix')
      expect(lightValue).toContain('var(--foreground)')
      expect(darkValue).toContain('var(--foreground)')
      expect(lightValue).toContain('var(--surface-current)')
      expect(darkValue).toContain('var(--surface-current)')
    }
  })

  it('declares theme-local mix weights with identical role names', () => {
    const percentWeight = /^\d+%$/
    const sidebarNavMix = /^var\(--mix-(fg-subtle|fg-muted)\)$/

    for (const role of MIX_WEIGHT_ROLES) {
      const lightValue = extractRoleValue(light, role) ?? ''
      const darkValue = extractRoleValue(dark, role) ?? ''

      if (role === '--mix-sidebar-nav-item-fg') {
        expect(lightValue, `${role} in light`).toMatch(sidebarNavMix)
        expect(darkValue, `${role} in dark`).toMatch(sidebarNavMix)
        continue
      }

      expect(lightValue, `${role} in light`).toMatch(percentWeight)
      expect(darkValue, `${role} in dark`).toMatch(percentWeight)
    }
  })

  it('aliases outline button border directly to border-subtle', () => {
    expect(extractRoleValue(light, '--outline-button-border')).toBe('var(--border-subtle)')
    expect(extractRoleValue(dark, '--outline-button-border')).toBe('var(--border-subtle)')
  })

  it('keeps field-disabled separate from surface-disabled', () => {
    expect(extractRoleValue(light, '--field-control-fg-disabled')).toBe(
      'var(--palette-field-fg-disabled)',
    )
    expect(extractRoleValue(dark, '--field-control-fg-disabled')).toBe(
      'var(--palette-field-fg-disabled)',
    )
    expect(FIELD_CONTROL_SEMANTIC_ROLES).toContain('--field-control-fg-disabled')
    expect(SURFACE_RELATIVE_CHROME_ROLES).toContain('--foreground-disabled')
    expect(SURFACE_RELATIVE_CHROME_ROLES).not.toContain('--field-control-fg-disabled')
  })

  it('derives field placeholder and field-disabled toward field plane, not surface-current', () => {
    const paletteLight = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
    const paletteDark = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')

    for (const css of [paletteLight, paletteDark]) {
      const placeholder = extractRoleValue(css, '--palette-field-placeholder') ?? ''
      const fieldDisabled = extractRoleValue(css, '--palette-field-fg-disabled') ?? ''

      expect(placeholder).toContain('color-mix')
      expect(placeholder).toContain('var(--palette-surface-field)')
      expect(placeholder).not.toContain('surface-current')

      expect(fieldDisabled).toContain('color-mix')
      expect(fieldDisabled).toContain('var(--palette-surface-field)')
      expect(fieldDisabled).not.toContain('surface-current')
    }
  })

  it('holds minimum contrast floors on card plane for muted ink (light + dark)', () => {
    const paletteLight = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
    const paletteDark = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')

    for (const [css, theme] of [
      [paletteLight, 'light'],
      [paletteDark, 'dark'],
    ] as const) {
      const fg = oklchLightness(extractRoleValue(css, '--palette-fg-default') ?? '')
      const card = oklchLightness(extractRoleValue(css, '--palette-surface-panel') ?? '')

      expect(fg, `${theme} fg L`).toBeDefined()
      expect(card, `${theme} card L`).toBeDefined()
      expect(contrastRatio(fg!, card!)).toBeGreaterThanOrEqual(MIN_MUTED_CONTRAST)
    }
  })

  it('holds minimum contrast floors on popover plane for border-subtle mix weights', () => {
    const paletteLight = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
    const paletteDark = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')
    const { light: semanticLight, dark: semanticDark } = readThemeCss()

    for (const [paletteCss, semanticCss, theme] of [
      [paletteLight, semanticLight, 'light'],
      [paletteDark, semanticDark, 'dark'],
    ] as const) {
      const fg = oklchLightness(extractRoleValue(paletteCss, '--palette-fg-default') ?? '')
      const panel = oklchLightness(extractRoleValue(paletteCss, '--palette-surface-panel') ?? '')
      const mixWeight = extractRoleValue(semanticCss, '--mix-border-subtle') ?? '14%'

      expect(fg, `${theme} fg L`).toBeDefined()
      expect(panel, `${theme} panel L`).toBeDefined()

      const blended =
        (fg! * parseFloat(mixWeight)) / 100 + (panel! * (100 - parseFloat(mixWeight))) / 100
      expect(contrastRatio(fg!, blended)).toBeGreaterThanOrEqual(MIN_BORDER_CONTRAST)
    }
  })
})
