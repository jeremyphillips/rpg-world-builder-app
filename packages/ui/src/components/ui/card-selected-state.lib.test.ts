import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { cardSurfaceVariants } from './card.variants'

const cardCssPath = fileURLToPath(new URL('./card.css', import.meta.url))

describe('ui-card toned ladders', () => {
  it('requires tone for selected modifier emission', () => {
    expect(cardSurfaceVariants({ tone: 'quiet', interactive: true, selected: true })).toContain(
      'ui-card--selected',
    )
    expect(cardSurfaceVariants({ interactive: true, selected: true })).not.toContain(
      'ui-card--selected',
    )
  })

  it('nests quiet and strong ladders with optimizer-safe selectors', () => {
    const source = readFileSync(cardCssPath, 'utf8')

    expect(source).toContain('&.ui-card--quiet')
    expect(source).toContain('&.ui-card--strong')
    expect(source).toContain('.ui-card-tone-host--inherit')
    expect(source).not.toMatch(/&--/)
    expect(source).not.toMatch(/&__/)
    expect(source).toMatch(
      /\.ui-card \{[\s\S]*border:\s*1px solid var\(--card-border\)[\s\S]*background-color:\s*var\(--card\)/,
    )
    expect(source).toMatch(
      /&\.ui-card--quiet[\s\S]*&\.ui-card--selected[\s\S]*border-color:\s*var\(--primary\)/,
    )
    expect(source).not.toMatch(/\.ui-card--selected:not\(\.ui-card--quiet\)/)
    expect(source).not.toMatch(/--ui-card-bg-selected/)
  })
})
