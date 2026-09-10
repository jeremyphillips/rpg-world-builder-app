import { describe, expect, it } from 'vitest'

import {
  namingConventionSchema,
  type NamingConventionDefinition,
} from '@rpg/contracts/name-generator'

import { COLLECTION_IMPORT_MAP } from './collections/import-map'
import { COLLECTION_MANIFEST_ENTRIES, COLLECTION_MANIFEST_IDS } from './collections/manifest'
import { CULTURE_CONVENTION_BINDINGS } from './definitions/culture-bindings'
import { HERITAGE_NAMING_CULTURES } from './heritage/heritage-naming-cultures'
import { STATIC_CONVENTIONS } from './conventions/manifest'

const BINDINGS: Record<string, readonly NamingConventionDefinition[]> = CULTURE_CONVENTION_BINDINGS

const BOUND_DEFINITIONS = Object.entries(BINDINGS).flatMap(([cultureId, definitions]) =>
  definitions.map((definition) => ({ cultureId, definition })),
)

describe('convention manifest', () => {
  it('has unique convention ids', () => {
    const ids = STATIC_CONVENTIONS.map((convention) => convention.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('excludes every culture-bound convention from the static list', () => {
    const staticIds = STATIC_CONVENTIONS.map((convention) => convention.id)
    for (const { cultureId, definition } of BOUND_DEFINITIONS) {
      expect(staticIds).not.toContain(definition.id ?? `${cultureId}-${definition.key}`)
    }
  })

  it('keeps only exceptional static conventions', () => {
    expect(STATIC_CONVENTIONS.map((convention) => convention.id)).toEqual([
      'draconic-dragon-personal',
      'faction-general',
    ])
  })

  it('references only known collection ids in part bindings', () => {
    for (const convention of STATIC_CONVENTIONS) {
      for (const binding of convention.partBindings) {
        expect(COLLECTION_MANIFEST_IDS.has(binding.collectionId)).toBe(true)
      }
    }
  })

  it('parses every static convention', () => {
    for (const convention of STATIC_CONVENTIONS) {
      expect(namingConventionSchema.safeParse(convention).success).toBe(true)
    }
  })
})

describe('culture convention bindings', () => {
  it('references only known collection ids in part bindings', () => {
    for (const { definition } of BOUND_DEFINITIONS) {
      for (const binding of definition.partBindings) {
        expect(COLLECTION_MANIFEST_IDS.has(binding.collectionId)).toBe(true)
      }
    }
  })

  it('resolves to unique convention ids across every culture', () => {
    const ids = BOUND_DEFINITIONS.map(
      ({ cultureId, definition }) => definition.id ?? `${cultureId}-${definition.key}`,
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('binds at most one definition per convention key within a culture', () => {
    for (const [cultureId, definitions] of Object.entries(BINDINGS)) {
      const keys = definitions.map((definition) => definition.key)
      expect(new Set(keys).size, `duplicate convention key in ${cultureId}`).toBe(keys.length)
    }
  })
})

describe('heritage naming cultures', () => {
  it('binds conventions for every heritage culture', () => {
    for (const culture of HERITAGE_NAMING_CULTURES) {
      expect(
        Object.keys(CULTURE_CONVENTION_BINDINGS),
        `missing bindings for ${culture.id}`,
      ).toContain(culture.id)
    }
  })

  it('routes each heritage option to a single culture per species', () => {
    const seen = new Set<string>()
    for (const culture of HERITAGE_NAMING_CULTURES) {
      for (const heritageId of culture.heritageIds) {
        const key = `${culture.speciesSlug}:${heritageId}`
        expect(seen.has(key), `duplicate heritage routing for ${key}`).toBe(false)
        seen.add(key)
      }
    }
  })
})

describe('collection manifest', () => {
  it('has import map entries for every manifest id', () => {
    for (const entry of COLLECTION_MANIFEST_ENTRIES) {
      expect(COLLECTION_IMPORT_MAP[entry.id]).toBeDefined()
    }
  })

  it('has a manifest entry for every import map id', () => {
    for (const collectionId of Object.keys(COLLECTION_IMPORT_MAP)) {
      expect(COLLECTION_MANIFEST_IDS.has(collectionId)).toBe(true)
    }
  })

  it('documents generator kinds consistent with manifest metadata', () => {
    for (const entry of COLLECTION_MANIFEST_ENTRIES) {
      expect(entry.generatorKinds.length).toBeGreaterThan(0)
      expect(entry.assetPath).toBe(`collections/${entry.id}.ts`)
    }
  })
})

describe('lazy loading boundary', () => {
  it('uses dynamic import loaders rather than static collection imports', () => {
    for (const loader of Object.values(COLLECTION_IMPORT_MAP)) {
      expect(loader.toString()).toMatch(/dynamic_import|import\(/)
    }
  })
})
