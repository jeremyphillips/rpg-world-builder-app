import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { DEPRECATED_PALETTE_TOKENS } from './palette-inventory'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

describe('removed canvas-relative palette muted/border roles', () => {
  const paletteLight = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
  const paletteDark = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')

  const removedCanvasChrome = DEPRECATED_PALETTE_TOKENS.filter(
    (token) =>
      token.includes('fg-subtle') ||
      token.includes('fg-muted') ||
      token.includes('fg-disabled') ||
      token.includes('border-') ||
      token.includes('semantic-neutral'),
  )

  it.each(removedCanvasChrome)('does not declare %s in palette files', (token) => {
    const pattern = new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`)
    expect(paletteLight).not.toMatch(pattern)
    expect(paletteDark).not.toMatch(pattern)
  })
})
