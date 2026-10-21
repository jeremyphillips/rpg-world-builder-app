import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { cardSurfaceVariants } from './card.variants'
import {
  optionCardEmbeddedSlotClassName,
  UI_OPTION_CARD_BODY_CLASS,
  UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS,
  UI_OPTION_CARD_EMBEDDED_PANEL_CLASS,
  UI_OPTION_CARD_PRIMARY_CLASS,
  UI_SELECTION_OPTION_CARD_ANATOMY_CLASS,
} from './selection-option-card.variants'
import { radioCardVariants } from './radio-card.variants'

const radioCardCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'ui-radio-card.css'),
  'utf8',
)

describe('optionCard selected chrome parity', () => {
  it('uses ui-card strong selected surface on static selection cards', () => {
    expect(cardSurfaceVariants({ tone: 'strong', selected: true })).toContain('ui-card--selected')
    expect(cardSurfaceVariants({ tone: 'strong', selected: true })).toContain('ui-card--strong')
  })

  it('defaults selection shells to raised elevation', () => {
    expect(cardSurfaceVariants({ tone: 'strong', elevation: 'raised', selected: true })).toContain(
      'ui-card--elevation-raised',
    )
    expect(
      cardSurfaceVariants({ tone: 'strong', elevation: 'raised', selected: true }),
    ).not.toContain('ui-card--elevation-subtle')
  })
})

describe('optionCard surface establishment', () => {
  it('does not paint a separate fill on embedded slots', () => {
    for (const tone of ['panel', 'divider'] as const) {
      const classes = optionCardEmbeddedSlotClassName(tone)
      expect(classes).not.toContain('bg-background')
      expect(classes).not.toContain('bg-surface-muted')
    }
    expect(radioCardCss).toContain(`${UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS}`)
    expect(radioCardCss).toContain('border-top: 1px solid var(--border)')
  })

  it('leaves card body padding on ui-card and ui-radio-card', () => {
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).not.toContain('pl-3')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).not.toContain('px-4')
    expect(radioCardCss).toContain('.ui-selection-option-card__body')
    expect(radioCardCss).toContain('padding-inline: var(--ui-card-inset-inline)')
  })

  it('derives in-flow embedded inset from the control size and column gap', () => {
    expect(optionCardEmbeddedSlotClassName('divider')).toBe(UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS)
    expect(optionCardEmbeddedSlotClassName('panel')).toBe(UI_OPTION_CARD_EMBEDDED_PANEL_CLASS)
    expect(radioCardCss).toContain('var(--control-choice-indicator-size-lg) + (var(--spacing) * 4)')
    expect(radioCardCss).toContain('var(--control-choice-indicator-size-sm) + (var(--spacing) * 3)')
    expect(radioCardCss).toContain('padding-inline-start:')
    expect(radioCardCss).not.toContain('pl-[calc')
  })

  it('breaks the panel tone out without the in-flow inset', () => {
    expect(radioCardCss).toMatch(
      /\.ui-option-card__embedded--panel\s*\{[^}]*margin-inline:\s*calc\(var\(--spacing\) \* -5\)/,
    )
    expect(radioCardCss).toMatch(
      /\.ui-card--compact \.ui-option-card__embedded--panel[\s\S]*margin-inline:\s*calc\(var\(--spacing\) \* -4\)/,
    )
    expect(radioCardCss).not.toMatch(
      /\.ui-option-card__embedded--panel\s*\{[^}]*padding-inline-start/,
    )
  })

  it('keeps region spacing in ui-radio-card.css instead of variant CVAs', () => {
    expect(radioCardCss).toContain(`.${UI_OPTION_CARD_BODY_CLASS}`)
    expect(radioCardCss).toContain('--ui-option-card-body-gap')
    expect(radioCardCss).toContain(`.${UI_OPTION_CARD_PRIMARY_CLASS}`)
    expect(radioCardCss).toContain('gap: var(--ui-anatomy-row-gap)')
    expect(radioCardCss).toContain(`.${UI_SELECTION_OPTION_CARD_ANATOMY_CLASS}`)
    expect(radioCardCss).toContain('.ui-option-card__summary-badge-row')
    expect(radioCardCss).toContain('min-height: 22px')
    expect(radioCardCss).toContain('.ui-option-card__secondary--content')
  })

  it('owns radio card body and footer spacing in css', () => {
    expect(radioCardCss).toMatch(
      /\.ui-radio-card--comfortable:not\(\.ui-radio-card--row\) \.ui-radio-card__body[\s\S]*gap: calc\(var\(--spacing\) \* 2\)/,
    )
    expect(radioCardCss).toMatch(
      /\.ui-radio-card--compact:not\(\.ui-radio-card--row\) \.ui-radio-card__body[\s\S]*gap: calc\(var\(--spacing\) \* 1\)/,
    )
    expect(radioCardCss).toContain('.ui-radio-card__footer')
  })
})
