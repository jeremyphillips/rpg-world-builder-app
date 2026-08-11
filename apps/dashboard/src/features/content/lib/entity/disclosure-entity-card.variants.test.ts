import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  disclosureEntityCardBodyInlineStartClasses,
  disclosureEntityCardHeaderPaddingVariants,
} from './disclosure-entity-card.variants'

const VARIANTS_PATH = join(__dirname, 'disclosure-entity-card.variants.ts')

describe('disclosureEntityCardBodyInlineStartClasses', () => {
  it('uses a fully static Tailwind utility token', () => {
    expect(disclosureEntityCardBodyInlineStartClasses).toBe('pl-[var(--entity-body-inline-start)]')

    const source = readFileSync(VARIANTS_PATH, 'utf8')
    expect(source).toContain("'pl-[var(--entity-body-inline-start)]'")
    expect(source).not.toMatch(/`\$\{/)
  })
})

describe('disclosureEntityCardHeaderPaddingVariants', () => {
  it('fills the available header region for full-width entity anatomy', () => {
    expect(disclosureEntityCardHeaderPaddingVariants()).toContain('w-full')
    expect(disclosureEntityCardHeaderPaddingVariants()).toContain('min-w-0')
  })
})
