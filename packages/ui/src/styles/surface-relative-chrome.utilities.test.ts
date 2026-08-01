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
  'border-outline-button-border',
  'border-semantic-neutral-border',
  'bg-border',
  'divide-border',
] as const

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

  it('does not bridge surface-relative chrome through @theme --color-* aliases', () => {
    expect(globalsCss).not.toMatch(/--color-muted-foreground:/)
    expect(globalsCss).not.toMatch(/--color-foreground-subtle:/)
    expect(globalsCss).not.toMatch(/--color-border-subtle:/)
    expect(globalsCss).not.toMatch(/--color-outline-button-border:/)
  })

  it('imports surface-relative utility definitions after semantic tokens', () => {
    const paletteImport = globalsCss.indexOf("import './tokens/palette-light.css'")
    const utilitiesImport = globalsCss.indexOf("import './surface-relative-chrome.utilities.css'")
    expect(paletteImport).toBeGreaterThan(-1)
    expect(utilitiesImport).toBeGreaterThan(paletteImport)
  })
})
