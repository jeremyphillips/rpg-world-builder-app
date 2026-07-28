import { describe, expect, it } from 'vitest'
import { contentTypeKeysWithCatalogPackage } from '@rpg/content-types'

const CATALOG_EXPORTS = [
  './classes',
  './equipment',
  './feats',
  './skill-proficiencies',
  './species',
  './spells',
] as const

describe('catalog integration manifest (catalog layer)', () => {
  it('exports every manifest catalog package subpath', () => {
    for (const { key, packageName } of contentTypeKeysWithCatalogPackage()) {
      const subpath = `./${packageName.replace('@rpg/catalog/', '')}`
      expect(CATALOG_EXPORTS as readonly string[], `${key} missing export ${subpath}`).toContain(
        subpath,
      )
    }
  })
})
