import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cardCssPath = join(dirname(fileURLToPath(import.meta.url)), 'card.css')

describe('card region inset CSS contract', () => {
  const source = readFileSync(cardCssPath, 'utf8')

  it('targets region parts as descendants of the card shell', () => {
    expect(source).toContain('.ui-card .ui-card__header')
    expect(source).toContain('.ui-card .ui-card__content')
    expect(source).toContain('.ui-card .ui-card__footer')
    expect(source).not.toMatch(/&\.ui-card__/)
  })

  it('publishes the shared density ladder on shell modifiers', () => {
    expect(source).toMatch(
      /\.ui-card--compact[\s\S]*--ui-card-inset-block:\s*calc\(var\(--spacing\) \* 2\)/,
    )
    expect(source).toMatch(
      /\.ui-card--compact[\s\S]*--ui-card-inset-inline:\s*calc\(var\(--spacing\) \* 4\)/,
    )
    expect(source).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-card-inset-block:\s*calc\(var\(--spacing\) \* 3\)/,
    )
    expect(source).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-card-inset-inline:\s*calc\(var\(--spacing\) \* 5\)/,
    )
    expect(source).toMatch(
      /\.ui-card--spacious[\s\S]*--ui-card-inset-block:\s*calc\(var\(--spacing\) \* 5\)/,
    )
    expect(source).toMatch(
      /\.ui-card--spacious[\s\S]*--ui-card-inset-inline:\s*calc\(var\(--spacing\) \* 6\)/,
    )
  })

  it('zeros follow-on region block-start when a header or body is present', () => {
    expect(source).toContain('.ui-card:has(.ui-card__header) .ui-card__content')
    expect(source).toContain('.ui-card:has(.ui-card__header) .ui-card__footer')
    expect(source).toContain('.ui-card:has(.ui-card__content) .ui-card__footer')
  })
})
