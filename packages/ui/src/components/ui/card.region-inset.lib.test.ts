import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cardCssPath = join(dirname(fileURLToPath(import.meta.url)), 'card.css')
const copyScaleCssPath = join(dirname(fileURLToPath(import.meta.url)), 'copy-scale.css')

describe('card region inset CSS contract', () => {
  const cardSource = readFileSync(cardCssPath, 'utf8')
  const copyScaleSource = readFileSync(copyScaleCssPath, 'utf8')

  it('targets region parts as descendants of the card shell', () => {
    expect(cardSource).toContain('.ui-card .ui-card__header')
    expect(cardSource).toContain('.ui-card .ui-card__content')
    expect(cardSource).toContain('.ui-card .ui-card__footer')
    expect(cardSource).not.toMatch(/&\.ui-card__/)
  })

  it('aliases card inset tokens from shared surface inset vars', () => {
    expect(cardSource).toMatch(
      /\.ui-card--compact[\s\S]*--ui-card-inset-block:\s*var\(--ui-surface-inset-block\)/,
    )
    expect(cardSource).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-card-inset-inline:\s*var\(--ui-surface-inset-inline\)/,
    )
  })

  it('publishes the shared density ladder on card and alert shell modifiers', () => {
    expect(copyScaleSource).toMatch(
      /\.ui-card--compact[\s\S]*--ui-surface-inset-block:\s*calc\(var\(--spacing\) \* 2\)/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-alert--compact[\s\S]*--ui-surface-inset-inline:\s*calc\(var\(--spacing\) \* 4\)/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-surface-inset-block:\s*calc\(var\(--spacing\) \* 3\)/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-alert--spacious[\s\S]*--ui-surface-inset-inline:\s*calc\(var\(--spacing\) \* 6\)/,
    )
  })

  it('zeros follow-on region block-start when a header or body is present', () => {
    expect(cardSource).toContain('.ui-card:has(.ui-card__header) .ui-card__content')
    expect(cardSource).toContain('.ui-card:has(.ui-card__header) .ui-card__footer')
    expect(cardSource).toContain('.ui-card:has(.ui-card__content) .ui-card__footer')
  })

  it('uses anatomy title line-height on comfortable and spacious card headers', () => {
    expect(copyScaleSource).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-copy-title-line-height:\s*1\.375rem/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-card--spacious[\s\S]*--ui-copy-title-line-height:\s*1\.625rem/,
    )
    expect(cardSource).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-card-title-line-height:\s*1\.375rem/,
    )
    expect(cardSource).toMatch(/\.ui-card--spacious[\s\S]*--ui-card-title-line-height:\s*1\.625rem/)
  })

  it('uses heading weight for card titles at every density', () => {
    expect(cardSource).toMatch(
      /\.ui-card \.ui-card__title[\s\S]*font-weight:\s*var\(--font-weight-heading\)/,
    )
    expect(cardSource).not.toContain('--ui-card-title-weight')
  })

  it('consumes shared anatomy row gap on the declarative header stack', () => {
    expect(cardSource).toMatch(
      /\.ui-card \.ui-card__header[\s\S]*row-gap:\s*var\(--ui-anatomy-row-gap\)/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-card--compact[\s\S]*--ui-anatomy-row-gap:\s*calc\(var\(--spacing\) \* 0\.5\)/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-anatomy-row-gap:\s*calc\(var\(--spacing\) \* 1\)/,
    )
    expect(copyScaleSource).toMatch(
      /\.ui-card--spacious[\s\S]*--ui-anatomy-row-gap:\s*calc\(var\(--spacing\) \* 1\.5\)/,
    )
  })
})
