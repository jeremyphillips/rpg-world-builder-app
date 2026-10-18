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

  it('nests quiet and strong ladders with selected border-color', () => {
    const source = readFileSync(cardCssPath, 'utf8')

    expect(source).toContain('&--quiet')
    expect(source).toContain('&--strong')
    expect(source).toContain('&--inherit')
    expect(source).toMatch(
      /&--quiet[\s\S]*&\.ui-card--selected[\s\S]*border-color:\s*var\(--primary\)/,
    )
    expect(source).not.toMatch(/\.ui-card--selected:not\(\.ui-card--quiet\)/)
    expect(source).not.toMatch(/--ui-card-bg-selected/)
  })
})
