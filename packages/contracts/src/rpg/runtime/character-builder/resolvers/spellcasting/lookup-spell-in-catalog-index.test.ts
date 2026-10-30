import { describe, expect, it } from 'vitest'

import type { Spell } from '../../../../content/spell'
import { lookupSpellInCatalogIndex } from './lookup-spell-in-catalog-index'

const prestidigitation: Spell = {
  id: 'srd-cc-5.2.1:prestidigitation',
  slug: 'prestidigitation',
  rulesetId: 'srd-cc-5.2.1',
  catalogLayer: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Prestidigitation',
  description: '<p>Test spell.</p>',
  school: 'transmutation',
  level: 0,
  classIds: ['wizard'],
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'self' },
  duration: { kind: 'instantaneous' },
  components: { verbal: true },
}

describe('lookupSpellInCatalogIndex', () => {
  const catalogIndex = {
    spells: new Map([[prestidigitation.id, prestidigitation]]),
  }

  it('resolves full catalog ids', () => {
    expect(lookupSpellInCatalogIndex(prestidigitation.id, catalogIndex as never)).toBe(
      prestidigitation,
    )
  })

  it('does not resolve a slug or a suffix of another id', () => {
    expect(lookupSpellInCatalogIndex('prestidigitation', catalogIndex as never)).toBeUndefined()
    expect(
      lookupSpellInCatalogIndex('srd-cc-5.2.1:other:prestidigitation', catalogIndex as never),
    ).toBeUndefined()
  })
})
