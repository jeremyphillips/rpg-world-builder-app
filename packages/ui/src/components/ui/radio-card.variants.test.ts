import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  radioCardControlVariants,
  radioCardGroupGapVariants,
  radioCardVariants,
} from './radio-card.variants'

const radioCardCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'ui-radio-card.css'),
  'utf8',
)

describe('radioCard surface establishment', () => {
  it('does not establish a plane on row variant', () => {
    expect(radioCardVariants({ variant: 'row' })).not.toContain('[--surface-current:')
  })

  it('uses comfortable density card content gap from ui-radio-card.css', () => {
    expect(radioCardVariants({ variant: 'card', density: 'comfortable' })).not.toContain('gap-2')
    expect(radioCardCss).toMatch(
      /\.ui-radio-card--comfortable:not\(\.ui-radio-card--row\) \.ui-radio-card__body[\s\S]*gap: calc\(var\(--spacing\) \* 2\)/,
    )
    expect(radioCardCss).toMatch(
      /\.ui-radio-card--compact:not\(\.ui-radio-card--row\) \.ui-radio-card__body[\s\S]*gap: calc\(var\(--spacing\) \* 1\)/,
    )
    expect(radioCardVariants({ variant: 'card', density: 'comfortable' })).not.toContain('px-4')
  })

  it('uses compact horizontal rhythm with semantic indicator-sm decoration', () => {
    expect(radioCardControlVariants({ variant: 'card', density: 'compact' })).toContain(
      'ui-choice-control--indicator-sm',
    )
  })
})

describe('radioCard group layout', () => {
  it('stretches card groups to the full field width', () => {
    expect(radioCardGroupGapVariants({ variant: 'card' })).toContain('w-full')
    expect(radioCardGroupGapVariants({ variant: 'card' })).toContain('min-w-0')
  })

  it('uses 8px gap between compact card options', () => {
    expect(radioCardGroupGapVariants({ variant: 'card', density: 'compact' })).toContain('gap-2')
    expect(radioCardGroupGapVariants({ variant: 'card', density: 'comfortable' })).toContain(
      'gap-3',
    )
  })

  it('uses a responsive two-column grid when columns is two', () => {
    expect(radioCardGroupGapVariants({ columns: 'two' })).toContain('grid-cols-1')
    expect(radioCardGroupGapVariants({ columns: 'two' })).toContain('@min-[32rem]:grid-cols-2')
    expect(radioCardGroupGapVariants({ columns: 'one' })).toContain('grid-cols-1')
    expect(radioCardGroupGapVariants({ columns: 'one' })).not.toContain('@min-[32rem]:grid-cols-2')
  })

  it('uses a responsive three-column grid when columns is three', () => {
    expect(radioCardGroupGapVariants({ columns: 'three' })).toContain('grid-cols-1')
    expect(radioCardGroupGapVariants({ columns: 'three' })).toContain('@min-[32rem]:grid-cols-2')
    expect(radioCardGroupGapVariants({ columns: 'three' })).toContain('@min-[48rem]:grid-cols-3')
  })
})
