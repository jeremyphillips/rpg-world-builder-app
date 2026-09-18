import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { entityCardContentInsetVariants } from '../../content/entity-card-content.variants'
import { disclosureEntityCardBodyInlineStartClasses } from '../disclosure-entity-card.variants'

const VARIANTS_PATH = join(__dirname, '../disclosure-entity-card.variants.ts')

describe('disclosureEntityCardBodyInlineStartClasses', () => {
  it('uses a fully static Tailwind utility token', () => {
    expect(disclosureEntityCardBodyInlineStartClasses).toBe('pl-[var(--entity-body-inline-start)]')

    const source = readFileSync(VARIANTS_PATH, 'utf8')
    expect(source).toContain("'pl-[var(--entity-body-inline-start)]'")
    expect(source).not.toMatch(/`\$\{/)
  })
})

describe('entityCardContentInsetVariants', () => {
  it('fills the available header region for full-width entity anatomy', () => {
    expect(entityCardContentInsetVariants({ density: 'compact' })).toContain('w-full')
    expect(entityCardContentInsetVariants({ density: 'compact' })).toContain('min-w-0')
    expect(entityCardContentInsetVariants({ density: 'compact' })).toContain('py-2')
  })
})
