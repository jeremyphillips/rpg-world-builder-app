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

  it('keeps independent quiet and strong selected paint with border-color', () => {
    const source = readFileSync(cardCssPath, 'utf8')

    expect(source).toContain('.ui-card.ui-card--quiet.ui-card--selected')
    expect(source).toContain('.ui-card.ui-card--strong.ui-card--selected')
    expect(source).not.toMatch(/\.ui-card--selected:not\(\.ui-card--quiet\)/)
    expect(source).toMatch(
      /\.ui-card\.ui-card--quiet\.ui-card--selected[\s\S]*border-color:\s*var\(--primary\)/,
    )
    expect(source).not.toMatch(/--ui-card-bg-selected/)
  })
})
