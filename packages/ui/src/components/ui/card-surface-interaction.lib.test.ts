import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const uiDir = dirname(fileURLToPath(import.meta.url))
const tokensDir = join(uiDir, '../../styles/tokens')

const cardCss = readFileSync(join(uiDir, 'card.css'), 'utf8')
const semanticLight = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
const semanticDark = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')
const paletteLight = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
const paletteDark = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')

describe('card surface interaction contract', () => {
  it('maps tone rest to lift and strong planes', () => {
    expect(cardCss).toMatch(/&\.ui-card--quiet[\s\S]*--ui-surface-bg:\s*var\(--surface-lift\)/)
    expect(cardCss).toMatch(/&\.ui-card--strong[\s\S]*--ui-surface-bg:\s*var\(--surface-strong\)/)
  })

  it('mixes hover and pressed from immutable --ui-surface-bg', () => {
    expect(cardCss).toContain('var(--ui-surface-bg) 96%')
    expect(cardCss).toContain('var(--ui-surface-bg) 92%')
    expect(cardCss).not.toContain('--row-hover-bg')
    expect(cardCss).not.toContain('--surface-subtle')
  })

  it('uses shared selected fill with explicit hover/active persistence', () => {
    expect(cardCss).toContain('var(--ui-surface-selected-bg)')
    expect(cardCss).toMatch(/&\.ui-card--selected:hover[\s\S]*var\(--ui-surface-selected-bg\)/)
    expect(cardCss).toMatch(/&\.ui-card--selected:active[\s\S]*var\(--ui-surface-selected-bg\)/)
  })

  it('omits tone-host inversion and legacy quiet bg alias', () => {
    expect(cardCss).not.toContain('ui-card-tone-host')
    expect(cardCss).not.toContain('--ui-card-quiet-bg')
  })

  it('declares --ui-surface-selected-bg in both semantic themes', () => {
    expect(semanticLight).toContain('--ui-surface-selected-bg: var(--palette-surface-selected)')
    expect(semanticDark).toContain('--ui-surface-selected-bg: var(--palette-surface-selected)')
  })

  it('authors palette surface-selected in light and dark', () => {
    expect(paletteLight).toContain('--palette-surface-selected:')
    expect(paletteDark).toContain('--palette-surface-selected:')
  })
})
