import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cardCssPath = join(dirname(fileURLToPath(import.meta.url)), 'card.css')

describe('card header typography CSS contract', () => {
  const source = readFileSync(cardCssPath, 'utf8')

  it('publishes title and description size tokens on density modifiers', () => {
    expect(source).toMatch(/\.ui-card--compact[\s\S]*--ui-card-title-size:\s*var\(--text-sm\)/)
    expect(source).toMatch(
      /\.ui-card--compact[\s\S]*--ui-card-description-size:\s*var\(--text-xs\)/,
    )
    expect(source).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-card-title-size:\s*var\(--text-base\)/,
    )
    expect(source).toMatch(
      /\.ui-card--comfortable[\s\S]*--ui-card-description-size:\s*var\(--text-sm\)/,
    )
    expect(source).toMatch(
      /\.ui-card--spacious[\s\S]*--ui-card-title-size:\s*var\(--text-heading-card\)/,
    )
    expect(source).toMatch(
      /\.ui-card--spacious[\s\S]*--ui-card-description-size:\s*var\(--text-sm\)/,
    )
  })

  it('consumes shell typography vars on title and description regions', () => {
    expect(source).toMatch(
      /\.ui-card \.ui-card__title[\s\S]*font-size:\s*var\(--ui-card-title-size\)/,
    )
    expect(source).toMatch(
      /\.ui-card \.ui-card__description[\s\S]*font-size:\s*var\(--ui-card-description-size\)/,
    )
  })
})
