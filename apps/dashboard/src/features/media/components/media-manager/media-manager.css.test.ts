import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'media-manager.css'), 'utf8')

describe('media-manager CSS', () => {
  it('owns both column grids and the coupled scroll inset', () => {
    expect(css).toContain('minmax(0, 0.28fr) minmax(0, 0.72fr)')
    expect(css).toContain('minmax(0, 0.28fr) minmax(0, 0.47fr) minmax(0, 0.25fr)')
    expect(css).toContain('margin-top: -1.25rem')
    expect(css).toContain('padding-top: 2.5rem')
  })

  it('selects the gallery tile from aria-pressed', () => {
    expect(css).toContain(".media-manager__tile[aria-pressed='true']")
    expect(css).toMatch(
      /\.media-manager__tile\[aria-pressed='true'\]\s*\{[^}]*border-color:\s*var\(--primary\)/,
    )
  })

  it('only overrides radius and overflow on the details panel', () => {
    const detailsRule = css.match(/\.ui-panel\.media-manager__details\s*\{[^}]*\}/)?.[0]
    expect(detailsRule).toBeDefined()
    expect(detailsRule).not.toMatch(/background/)
    expect(detailsRule).not.toMatch(/border-color/)
  })
})
