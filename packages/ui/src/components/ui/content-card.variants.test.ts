import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  contentCardMixedHeadingNameVariants,
  contentCardMixedHeadingRowVariants,
  contentCardMixedHeadingSeparatorVariants,
  contentCardMixedHeadingSuffixVariants,
} from './content-card.variants'

const VARIANTS_PATH = join(__dirname, 'content-card.variants.ts')

const MIXED_HEADING_ANTI_PATTERNS = [
  /\bflex-1\b/,
  /\bmax-w-\[[^\]]+%\]/,
  /\bml-auto\b/,
  /\bjustify-between\b/,
] as const

function assertNoMixedHeadingAntiPatterns(source: string, label: string) {
  for (const pattern of MIXED_HEADING_ANTI_PATTERNS) {
    expect(source, `${label} must not match ${pattern}`).not.toMatch(pattern)
  }
}

describe('contentCardMixedHeading variants', () => {
  it('keeps title shrinkable without flex growth', () => {
    expect(contentCardMixedHeadingNameVariants()).toMatch(/\bmin-w-0\b/)
    expect(contentCardMixedHeadingNameVariants()).toMatch(/\bshrink\b/)
    expect(contentCardMixedHeadingNameVariants()).toMatch(/\btruncate\b/)
    expect(contentCardMixedHeadingNameVariants()).not.toMatch(/\bflex-1\b/)
  })

  it('keeps separator and classification intrinsic', () => {
    expect(contentCardMixedHeadingSeparatorVariants()).toMatch(/\bshrink-0\b/)
    expect(contentCardMixedHeadingSuffixVariants()).toMatch(/\bshrink-0\b/)
    expect(contentCardMixedHeadingSuffixVariants()).not.toMatch(/\bflex-1\b/)
  })

  it('forbids known mixed-heading layout anti-patterns in variant sources', () => {
    const source = readFileSync(VARIANTS_PATH, 'utf8')
    const nameBlock = source.slice(
      source.indexOf('export const contentCardMixedHeadingNameVariants'),
      source.indexOf('export const contentCardMixedHeadingSeparatorVariants'),
    )
    const separatorBlock = source.slice(
      source.indexOf('export const contentCardMixedHeadingSeparatorVariants'),
      source.indexOf('export const contentCardMixedHeadingSuffixVariants'),
    )
    const suffixBlock = source.slice(
      source.indexOf('export const contentCardMixedHeadingSuffixVariants'),
      source.indexOf('/** Layer-2 supporting copy density'),
    )
    const rowBlock = source.slice(
      source.indexOf('export const contentCardMixedHeadingRowVariants'),
      source.indexOf('export const contentCardMixedHeadingNameVariants'),
    )

    assertNoMixedHeadingAntiPatterns(nameBlock, 'mixed heading title')
    assertNoMixedHeadingAntiPatterns(separatorBlock, 'mixed heading separator')
    assertNoMixedHeadingAntiPatterns(suffixBlock, 'mixed heading classification suffix')
    assertNoMixedHeadingAntiPatterns(rowBlock, 'mixed heading row')
  })

  it('exports row layout without justify-between', () => {
    expect(contentCardMixedHeadingRowVariants()).toMatch(/\bflex\b/)
    expect(contentCardMixedHeadingRowVariants()).toMatch(/\bmin-w-0\b/)
    expect(contentCardMixedHeadingRowVariants()).not.toMatch(/\bjustify-between\b/)
  })
})
