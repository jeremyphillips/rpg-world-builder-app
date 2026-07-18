import { describe, expect, it } from 'vitest'

import { namingConventionSchema } from '@rpg/contracts/name-generator'

import { COLLECTION_IMPORT_MAP } from './collections/import-map'
import { COLLECTION_MANIFEST_ENTRIES, COLLECTION_MANIFEST_IDS } from './collections/manifest'
import { STATIC_CONVENTIONS } from './conventions/manifest'

describe('convention manifest', () => {
  it('has unique convention ids', () => {
    const ids = STATIC_CONVENTIONS.map((convention) => convention.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('excludes migrated elf conventions from the static list', () => {
    const ids = STATIC_CONVENTIONS.map((convention) => convention.id)
    expect(ids).not.toContain('elvish-personal')
    expect(ids).not.toContain('elvish-settlement')
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
