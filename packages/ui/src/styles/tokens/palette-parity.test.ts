import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PALETTE_PRIMITIVE_VARS } from '../../styles/tokens/palette-inventory'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '../../styles/tokens')

function extractDeclaredPaletteVars(css: string): Set<string> {
  return new Set([...css.matchAll(/(--palette-[\w-]+)\s*:/g)].map((match) => match[1]!))
}

describe('palette token parity', () => {
  const lightCss = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
  const darkCss = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')
  const lightVars = extractDeclaredPaletteVars(lightCss)
  const darkVars = extractDeclaredPaletteVars(darkCss)

  it('declares every inventory primitive in light and dark palette files', () => {
    for (const cssVar of PALETTE_PRIMITIVE_VARS) {
      expect(lightVars.has(cssVar), `missing in palette-light.css: ${cssVar}`).toBe(true)
      expect(darkVars.has(cssVar), `missing in palette-dark.css: ${cssVar}`).toBe(true)
    }
  })

  it('does not declare extra palette primitives outside the inventory', () => {
    const inventory = new Set(PALETTE_PRIMITIVE_VARS)
    const extras = [...lightVars, ...darkVars].filter((cssVar) => !inventory.has(cssVar))
    expect(extras).toEqual([])
  })

  it('keeps light and dark palette inventories identical', () => {
    expect([...lightVars].sort()).toEqual([...darkVars].sort())
  })
})
