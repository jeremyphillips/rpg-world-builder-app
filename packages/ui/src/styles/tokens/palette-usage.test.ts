import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PALETTE_PRIMITIVE_VARS } from './palette-inventory'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

function extractPaletteVarReferences(css: string): Set<string> {
  return new Set([...css.matchAll(/var\((--palette-[\w-]+)\)/g)].map((match) => match[1]!))
}

describe('palette primitive usage', () => {
  const combinedCss = [
    'palette-light.css',
    'palette-dark.css',
    'semantic-light.css',
    'semantic-dark.css',
    '../globals.css',
  ]
    .map((file) => readFileSync(join(tokensDir, file), 'utf8'))
    .join('\n')

  const referenced = extractPaletteVarReferences(combinedCss)

  it('references every inventory primitive at least once across token files and globals.css', () => {
    const orphans = PALETTE_PRIMITIVE_VARS.filter((cssVar) => !referenced.has(cssVar))
    expect(orphans, `unreferenced palette primitives: ${orphans.join(', ')}`).toEqual([])
  })
})
