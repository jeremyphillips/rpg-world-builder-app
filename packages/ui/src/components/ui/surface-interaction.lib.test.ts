import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const uiDir = dirname(fileURLToPath(import.meta.url))

const surfaceInteractionCss = readFileSync(join(uiDir, 'surface-interaction.css'), 'utf8')
const cardCss = readFileSync(join(uiDir, 'card.css'), 'utf8')
const destinationListCss = readFileSync(join(uiDir, 'destination-list.css'), 'utf8')

describe('surface-interaction.css contract', () => {
  it('owns the shared 94% / 88% color-mix formula once', () => {
    expect(surfaceInteractionCss).toContain('var(--ui-surface-bg) 94%')
    expect(surfaceInteractionCss).toContain('var(--ui-surface-bg) 88%')
    expect(surfaceInteractionCss).toContain(
      '.ui-card--interactive:is(.ui-card--quiet, .ui-card--strong)',
    )
    expect(surfaceInteractionCss).toContain(
      '.ui-destination-list--filled.ui-destination-list--tone-strong',
    )
    expect(cardCss).not.toContain('var(--ui-surface-bg) 96%')
    expect(cardCss).not.toContain('var(--ui-surface-bg) 92%')
  })

  it('publishes hover and pressed custom properties on publishers', () => {
    expect(surfaceInteractionCss).toContain('--ui-surface-hover-bg')
    expect(surfaceInteractionCss).toContain('--ui-surface-pressed-bg')
  })

  it('wires filled strong list rows to shared hover and scoped pressed', () => {
    expect(destinationListCss).toMatch(
      /\.ui-destination-list--filled\.ui-destination-list--tone-strong[^}]*--ui-surface-bg:\s*var\(--surface-strong\)/s,
    )
    expect(destinationListCss).toContain('--ui-row-bg-hover: var(--ui-surface-hover-bg)')
    expect(destinationListCss).toMatch(
      /\.ui-destination-list--filled\.ui-destination-list--tone-strong[\s\S]*:active[\s\S]*var\(--ui-surface-pressed-bg\)/,
    )
    expect(destinationListCss).not.toContain('--ui-row-bg-pressed')
  })
})
