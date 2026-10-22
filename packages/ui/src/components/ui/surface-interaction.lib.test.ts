import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const uiDir = dirname(fileURLToPath(import.meta.url))

const surfaceInteractionCss = readFileSync(join(uiDir, 'surface-interaction.css'), 'utf8')
const cardCss = readFileSync(join(uiDir, 'card.css'), 'utf8')
const destinationListCss = readFileSync(join(uiDir, 'destination-list.css'), 'utf8')
const interactiveRowCss = readFileSync(join(uiDir, 'interactive-row.css'), 'utf8')
describe('surface-interaction.css contract', () => {
  it('owns the shared 94% / 88% color-mix formula once', () => {
    expect(surfaceInteractionCss).toContain('var(--ui-surface-bg) 94%')
    expect(surfaceInteractionCss).toContain('var(--ui-surface-bg) 88%')
    expect(surfaceInteractionCss).toMatch(
      /\.ui-card--interactive:is\([\s\S]*\.ui-card--subtle[\s\S]*\.ui-card--strong/,
    )
    expect(surfaceInteractionCss).toContain(
      '.ui-destination-list--filled.ui-destination-list--tone-strong',
    )
    expect(surfaceInteractionCss).toContain(':root')
    expect(surfaceInteractionCss).toContain('.ui-panel--quiet')
    expect(surfaceInteractionCss).toContain('.ui-data-table__table-wrap')
    expect(surfaceInteractionCss).toContain('.ui-popover-content--popover')
    expect(cardCss).not.toContain('var(--ui-surface-bg) 96%')
    expect(cardCss).not.toContain('var(--ui-surface-bg) 92%')
  })

  it('publishes hover and pressed custom properties on publishers', () => {
    expect(surfaceInteractionCss).toContain('--ui-surface-hover-bg')
    expect(surfaceInteractionCss).toContain('--ui-surface-pressed-bg')
  })

  it('publishes canvas rest on :root', () => {
    expect(surfaceInteractionCss).toMatch(/:root\s*\{[^}]*--ui-surface-bg:\s*var\(--background\)/s)
  })

  it('does not scope row hover overrides on destination lists', () => {
    expect(destinationListCss).not.toContain('--ui-row-bg-hover')
    expect(destinationListCss).not.toMatch(
      /\.ui-destination-list--filled[\s\S]*:active[\s\S]*--ui-surface-pressed-bg/,
    )
  })

  it('routes interactive rows through shared surface tokens only', () => {
    expect(interactiveRowCss).toContain('--ui-row-bg-hover: var(--ui-surface-hover-bg)')
    expect(interactiveRowCss).not.toContain('--row-hover-bg')
    expect(interactiveRowCss).not.toContain('--ui-row-bg-hover: var(--muted)')
    expect(interactiveRowCss).toContain('--ui-surface-selected-bg')
  })
})
