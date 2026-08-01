import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const stylesDir = join(dirname(fileURLToPath(import.meta.url)), '.')

const SURFACE_RELATIVE_UTILITY_NAMES = [
  'text-muted-foreground',
  'text-foreground-subtle',
  'text-foreground-disabled',
  'text-semantic-neutral',
  'text-sidebar-nav-item-fg',
  'border-border',
  'border-border-faint',
  'border-border-subtle',
  'border-border-strong',
  'border-card-selected-border',
  'border-card-border',
  'border-interactive-outline',
  'bg-interactive-outline-hover',
  'bg-interactive-outline-active',
  'border-semantic-neutral-border',
  'bg-border',
  'divide-border',
] as const

type MixSource = 'foreground' | 'primary'

type UtilityIngredientOwnership = {
  mixSource: MixSource
  mixVar: `--${string}`
}

const UTILITY_INGREDIENT_OWNERSHIP = {
  'text-muted-foreground': { mixSource: 'foreground', mixVar: '--mix-fg-muted' },
  'text-foreground-subtle': { mixSource: 'foreground', mixVar: '--mix-fg-subtle' },
  'text-foreground-disabled': { mixSource: 'foreground', mixVar: '--mix-fg-disabled' },
  'text-semantic-neutral': { mixSource: 'foreground', mixVar: '--mix-fg-muted' },
  'text-sidebar-nav-item-fg': { mixSource: 'foreground', mixVar: '--mix-sidebar-nav-item-fg' },
  'border-border': { mixSource: 'foreground', mixVar: '--mix-border-default' },
  'border-border-faint': { mixSource: 'foreground', mixVar: '--mix-border-faint' },
  'border-border-subtle': { mixSource: 'foreground', mixVar: '--mix-border-subtle' },
  'border-border-strong': { mixSource: 'foreground', mixVar: '--mix-border-strong' },
  'border-card-selected-border': { mixSource: 'foreground', mixVar: '--mix-border-selected' },
  'border-card-border': { mixSource: 'primary', mixVar: '--mix-card-border' },
  'border-interactive-outline': {
    mixSource: 'foreground',
    mixVar: '--mix-interactive-outline-border',
  },
  'bg-interactive-outline-hover': {
    mixSource: 'primary',
    mixVar: '--mix-interactive-outline-hover',
  },
  'bg-interactive-outline-active': {
    mixSource: 'primary',
    mixVar: '--mix-interactive-outline-active',
  },
  'border-semantic-neutral-border': { mixSource: 'foreground', mixVar: '--mix-border-default' },
  'bg-border': { mixSource: 'foreground', mixVar: '--mix-border-default' },
  'divide-border': { mixSource: 'foreground', mixVar: '--mix-border-default' },
} satisfies Record<(typeof SURFACE_RELATIVE_UTILITY_NAMES)[number], UtilityIngredientOwnership>

function readUtilityBlock(css: string, utilityName: string): string {
  const start = css.indexOf(`@utility ${utilityName}`)
  expect(start).toBeGreaterThan(-1)
  const next = css.indexOf('@utility', start + 1)
  return next === -1 ? css.slice(start) : css.slice(start, next)
}

describe('surface-relative chrome utilities', () => {
  const utilitiesCss = readFileSync(
    join(stylesDir, 'surface-relative-chrome.utilities.css'),
    'utf8',
  )
  const globalsCss = readFileSync(join(stylesDir, 'globals.css'), 'utf8')

  it.each(SURFACE_RELATIVE_UTILITY_NAMES)(
    'defines %s with a per-element color-mix toward --surface-current',
    (utilityName) => {
      expect(utilitiesCss).toContain(`@utility ${utilityName}`)
      const start = utilitiesCss.indexOf(`@utility ${utilityName}`)
      const next = utilitiesCss.indexOf('@utility', start + 1)
      const block = next === -1 ? utilitiesCss.slice(start) : utilitiesCss.slice(start, next)
      expect(block).toContain('color-mix')
      expect(block).toContain('var(--surface-current)')
    },
  )

  it('uses live var(--border) in the base safety-net rule without --color-border', () => {
    const baseRule = globalsCss.match(
      /@layer base\s*\{[\s\S]*?\*[\s\S]*?border-color:\s*([^;]+);/,
    )?.[1]
    expect(baseRule?.trim()).toBe('var(--border)')
    expect(globalsCss).not.toMatch(/--color-border:/)
    expect(globalsCss).not.toMatch(/border-color:\s*var\(--color-border\)/)
  })

  it('does not bridge surface-relative chrome through @theme --color-* aliases', () => {
    expect(globalsCss).not.toMatch(/--color-muted-foreground:/)
    expect(globalsCss).not.toMatch(/--color-foreground-subtle:/)
    expect(globalsCss).not.toMatch(/--color-border-subtle:/)
    expect(globalsCss).not.toMatch(/--color-interactive-outline-border:/)
    expect(globalsCss).not.toMatch(/--color-interactive-outline-hover:/)
    expect(globalsCss).not.toMatch(/--color-interactive-outline-active:/)
  })

  it.each(Object.entries(UTILITY_INGREDIENT_OWNERSHIP))(
    'matches Layer 2 ingredient ownership for %s',
    (utilityName, ownership) => {
      const block = readUtilityBlock(utilitiesCss, utilityName)
      expect(block).toContain(`var(--${ownership.mixSource})`)
      expect(block).toContain(`var(${ownership.mixVar})`)
      expect(block).toContain('var(--surface-current)')
    },
  )

  it('imports surface-relative utility definitions after semantic tokens', () => {
    const paletteImport = globalsCss.indexOf("import './tokens/palette-light.css'")
    const utilitiesImport = globalsCss.indexOf("import './surface-relative-chrome.utilities.css'")
    expect(paletteImport).toBeGreaterThan(-1)
    expect(utilitiesImport).toBeGreaterThan(paletteImport)
  })
})
