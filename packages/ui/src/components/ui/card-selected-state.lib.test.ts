import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { cardSurfaceVariants } from './card.variants'

const cardCssPath = fileURLToPath(new URL('./card.css', import.meta.url))

describe('ui-card toned ladders', () => {
  it('emits selected modifier with default strong tone', () => {
    expect(cardSurfaceVariants({ tone: 'quiet', interactive: true, selected: true })).toContain(
      'ui-card--selected',
    )
    expect(cardSurfaceVariants({ interactive: true, selected: true })).toContain(
      'ui-card--selected',
    )
  })

  it('nests quiet and strong ladders with optimizer-safe selectors', () => {
    const source = readFileSync(cardCssPath, 'utf8')

    expect(source).toContain('&.ui-card--quiet')
    expect(source).toContain('&.ui-card--strong')
    expect(source).not.toContain('.ui-card-tone-host--inherit')
    expect(source).not.toContain('--ui-card-quiet-bg')
    expect(source).toContain('.ui-card--compact')
    expect(source).toContain('--ui-card-inset-block')
    expect(source).toContain('--ui-card-inset-inline')
    expect(source).not.toMatch(/&--/)
    expect(source).not.toMatch(/&__/)
    expect(source).toContain('.ui-card .ui-card__header')
    expect(source).toContain('.ui-card .ui-card__content')
    expect(source).toContain('.ui-card .ui-card__footer')
    expect(source).toMatch(/\.ui-card \{[\s\S]*box-shadow:\s*none/)
    expect(source).toContain('.ui-card--elevation-subtle')
    expect(source).toContain('.ui-card--elevation-raised')
    expect(source).not.toMatch(/&\.ui-card--quiet[\s\S]*border-radius:\s*var\(--radius-md\)/)
    expect(source).toMatch(
      /&\.ui-card--quiet[\s\S]*&\.ui-card--selected[\s\S]*border-color:\s*var\(--primary\)/,
    )
    expect(source).not.toMatch(/\.ui-card--selected:not\(\.ui-card--quiet\)/)
    expect(source).not.toMatch(/--ui-card-bg-selected/)
  })
})
