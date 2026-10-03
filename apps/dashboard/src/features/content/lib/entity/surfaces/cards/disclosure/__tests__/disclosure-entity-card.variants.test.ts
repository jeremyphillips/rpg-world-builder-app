import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  ENTITY_BODY_INLINE_END_VAR,
  ENTITY_BODY_INLINE_START_VAR,
} from '../../../../anatomy/entity-geometry.tokens'
import { entityCardContentInsetVariants } from '../../content/entity-card-content.variants'
import {
  entityBodyInlineEndClasses,
  entityBodyInlineStartClasses,
} from '../../../entity-surface-inset.variants'

const INSET_VARIANTS_PATH = join(__dirname, '../../../entity-surface-inset.variants.ts')

describe('entity body inline classes', () => {
  it('use fully static Tailwind utility tokens that match the token var names', () => {
    expect(entityBodyInlineStartClasses).toBe(`pl-[var(${ENTITY_BODY_INLINE_START_VAR})]`)
    expect(entityBodyInlineEndClasses).toBe(`pr-[var(${ENTITY_BODY_INLINE_END_VAR})]`)

    const source = readFileSync(INSET_VARIANTS_PATH, 'utf8')
    expect(source).toContain("'pl-[var(--entity-body-inline-start)]'")
    expect(source).toContain("'pr-[var(--entity-body-inline-end)]'")
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
