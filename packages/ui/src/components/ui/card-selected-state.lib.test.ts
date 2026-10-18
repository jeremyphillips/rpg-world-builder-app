import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cardCssPath = fileURLToPath(new URL('./card.css', import.meta.url))

describe('ui-card quiet selected resting chrome', () => {
  it('beats tone resting fill and applies host-plane selected border', () => {
    const source = readFileSync(cardCssPath, 'utf8')

    expect(source).toContain('.ui-card.ui-card--quiet.ui-card--selected')
    expect(source).toMatch(
      /\.ui-card\.ui-card--quiet\.ui-card--selected[\s\S]*background-color:\s*var\(--ui-card-bg-selected\)/,
    )
    expect(source).toMatch(/--ui-card-border-selected:\s*color-mix\([\s\S]*var\(--ui-card-bg\)/)
    expect(source).not.toMatch(/^\s*\.ui-card--selected\s*\{/m)
  })
})
