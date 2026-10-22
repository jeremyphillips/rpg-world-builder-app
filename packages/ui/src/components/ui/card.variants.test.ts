import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { cardSurfaceVariants } from './card.variants'

const cardCssPath = join(dirname(fileURLToPath(import.meta.url)), 'card.css')

describe('cardSurfaceVariants', () => {
  it('emits the card block for the default surface', () => {
    const defaults = cardSurfaceVariants()
    expect(defaults).toContain('ui-card')
    expect(defaults).toContain('ui-card--strong')
    expect(defaults).toContain('ui-card--comfortable')
    expect(defaults).toContain('ui-card--static')
    expect(defaults).toContain('ui-border--default')
    expect(defaults).not.toContain('ui-card--interactive')
    expect(defaults).not.toContain('ui-card--elevation-subtle')
    expect(defaults).not.toContain('ui-card--elevation-raised')
  })

  it('emits elevation modifiers when requested', () => {
    expect(cardSurfaceVariants({ elevation: 'subtle' })).toContain('ui-card--elevation-subtle')
    expect(cardSurfaceVariants({ elevation: 'raised' })).toContain('ui-card--elevation-raised')
  })

  it('emits transparent and subtle tone modifiers', () => {
    expect(cardSurfaceVariants({ tone: 'transparent' })).toContain('ui-card--transparent')
    expect(cardSurfaceVariants({ tone: 'subtle' })).toContain('ui-card--subtle')
  })

  it('emits density modifiers independent of tone', () => {
    expect(cardSurfaceVariants({ density: 'compact', tone: 'strong' })).toContain(
      'ui-card--compact',
    )
    expect(cardSurfaceVariants({ density: 'compact', tone: 'quiet' })).toContain('ui-card--compact')
    expect(cardSurfaceVariants({ density: 'spacious' })).toContain('ui-card--spacious')
  })

  it('emits an interactive modifier for navigation cards', () => {
    expect(cardSurfaceVariants({ interactive: true })).toContain('ui-card--interactive')
    expect(cardSurfaceVariants({ interactive: true })).not.toContain('ui-card--static')
  })

  it('emits selected whenever the interaction owner marks selected', () => {
    expect(cardSurfaceVariants({ selected: true })).toContain('ui-card--selected')
    expect(cardSurfaceVariants({ tone: 'quiet', selected: true })).toContain('ui-card--selected')
  })
})

describe('card.css interactive cursor contract', () => {
  it('assigns pointer cursor to actionable interactive shells excluding disabled', () => {
    const css = readFileSync(cardCssPath, 'utf8')
    expect(css).toContain('.ui-card--interactive:not(.ui-card--disabled)')
    expect(css).toMatch(
      /\.ui-card--interactive:not\(\.ui-card--disabled\)\s*\{[^}]*cursor:\s*pointer/s,
    )
  })
})
