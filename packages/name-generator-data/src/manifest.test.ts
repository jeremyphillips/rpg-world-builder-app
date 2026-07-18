import { describe, expect, it } from 'vitest'

import { namingConventionSchema } from '@rpg/contracts/name-generator'

import { COLLECTION_IMPORT_MAP } from './collections/import-map'
import { COLLECTION_MANIFEST_ENTRIES, COLLECTION_MANIFEST_IDS } from './collections/manifest'
import { CULTURE_CONVENTION_BINDINGS } from './definitions/culture-bindings'
import { STATIC_CONVENTIONS } from './conventions/manifest'

const MIGRATED_CONVENTION_IDS = [
  'elvish-personal',
  'elvish-settlement',
  'dwarven-personal',
  'dwarven-settlement',
  'halfling-personal',
  'halfling-settlement',
  'gnomish-personal',
  'gnomish-settlement',
  'draconic-dragonborn-personal',
  'draconic-dragonborn-clan',
  'goliath-personal',
  'infernal-tiefling-personal',
  'orc-personal',
  'akan-personal',
] as const

describe('convention manifest', () => {
  it('has unique convention ids', () => {
    const ids = STATIC_CONVENTIONS.map((convention) => convention.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('excludes migrated conventions from the static list', () => {
    const ids = STATIC_CONVENTIONS.map((convention) => convention.id)
    for (const conventionId of MIGRATED_CONVENTION_IDS) {
      expect(ids).not.toContain(conventionId)
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
    for (const definitions of Object.values(CULTURE_CONVENTION_BINDINGS)) {
      for (const definition of definitions) {
        for (const binding of definition.partBindings) {
          expect(COLLECTION_MANIFEST_IDS.has(binding.collectionId)).toBe(true)
        }
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

  it('documents generator kinds consistent with manifest metadata', () => {
    for (const entry of COLLECTION_MANIFEST_ENTRIES) {
      expect(entry.generatorKinds.length).toBeGreaterThan(0)
      expect(entry.assetPath.startsWith('collections/')).toBe(true)
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
