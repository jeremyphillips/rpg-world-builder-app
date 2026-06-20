/**
 * Content form registry drift guard.
 *
 * This suite iterates every `ContentFormDef` in `contentFormRegistry` and
 * verifies:
 *
 * 1. **Registration contract** — the entry exposes all required functions and
 *    the schema.
 * 2. **Round-trip fixtures** — added per type in their own test file (see
 *    `species/species-form-registry.test.ts` etc.) so they can import catalog
 *    fixtures without a cross-feature dependency.
 * 3. **Structural coverage** — for entries with `coverage: 'structural'`, a
 *    separate structural check is wired in the per-type test.
 *
 * **Why an empty loop is intentional:** The suite runs over whatever is
 * registered at import time. Phase 2 registers no types. When Phase 3 adds
 * `species`, the registration contract check below will run automatically.
 */
import { describe, expect, it } from 'vitest'
import { flattenFields } from '@rpg/ui/form'

import { contentFormRegistry, type ContentFormDef } from './content-form-registry'
// Populate the registry — each import registers its def as a side effect.
import '../species/lib/species-form-def'
import '../classes/lib/class-form-def'
import '../armor/lib/armor-form-def'
import '../weapons/lib/weapon-form-def'
import '../skillProficiencies/lib/skill-proficiency-form-def'
import '../equipment/lib/equipment-form-def'

type AnyDef = ContentFormDef<{ id: string; name: string }, Record<string, unknown>, unknown>

const entries = Object.entries(contentFormRegistry) as [string, AnyDef][]

describe('contentFormRegistry', () => {
  it('is an object', () => {
    expect(contentFormRegistry).toBeTypeOf('object')
  })

  it('has no duplicate routeKeys', () => {
    const keys = entries.map(([, def]) => def.routeKey)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe.each(entries)('ContentFormDef[%s] — registration contract', (_key, def) => {
  it('has a routeKey string', () => {
    expect(def.routeKey).toBeTypeOf('string')
    expect(def.routeKey.length).toBeGreaterThan(0)
  })

  it('has a Zod schema with a parse method', () => {
    expect(def.schema).toBeDefined()
    expect(def.schema.parse).toBeTypeOf('function')
  })

  it('buildFields({}) returns a non-empty FormItem array', () => {
    const fields = def.buildFields({})
    expect(Array.isArray(fields)).toBe(true)
    expect(fields.length).toBeGreaterThan(0)
  })

  it('flattenFields(buildFields({})) contains at least one leaf field', () => {
    const fields = def.buildFields({})
    const leaves = flattenFields(fields)
    expect(leaves.length).toBeGreaterThan(0)
  })

  it('toFormValues is a function', () => {
    expect(def.toFormValues).toBeTypeOf('function')
  })

  it('toInput is a function', () => {
    expect(def.toInput).toBeTypeOf('function')
  })

  it('useListQuery is a function', () => {
    expect(def.useListQuery).toBeTypeOf('function')
  })

  it('queryKey(campaignId) returns a non-empty array', () => {
    const key = def.queryKey('test-campaign-id')
    expect(Array.isArray(key)).toBe(true)
    expect(key.length).toBeGreaterThan(0)
  })
})
