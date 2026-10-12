import { describe, expect, it } from 'vitest'

import {
  LegacyMonsterDocumentConflictError,
  normalizeLegacyMonsterDocument,
} from './normalize-legacy-document'

describe('normalizeLegacyMonsterDocument', () => {
  it('lifts legacy communication languages and grant-set weapons', () => {
    const result = normalizeLegacyMonsterDocument({
      communication: {
        languages: {
          entries: [{ language: 'common' }, { language: 'draconic', speaks: false }],
        },
        telepathy: 60,
      },
      proficiencies: {
        weapons: { categories: ['simple'], items: ['srd-cc-5.2.1:dagger'] },
      },
    })

    expect(result.proficiencies).toEqual({
      weapons: [{ weaponCategory: 'simple' }, { weaponId: 'srd-cc-5.2.1:dagger' }],
      languages: [{ language: 'common' }, { language: 'draconic', speaks: false }],
    })
    expect(result.communication).toEqual({ telepathy: 60 })
    expect(result.languages).toBeUndefined()
  })

  it('is idempotent on canonical documents', () => {
    const canonical = {
      proficiencies: {
        languages: [{ language: 'common' }],
        weapons: [{ weaponId: 'srd-cc-5.2.1:dagger' }],
      },
      communication: { telepathy: 60 },
    }
    expect(normalizeLegacyMonsterDocument(canonical)).toEqual(canonical)
  })

  it('throws when canonical and legacy language lists disagree', () => {
    expect(() =>
      normalizeLegacyMonsterDocument({
        proficiencies: { languages: [] },
        communication: { languages: { entries: [{ language: 'common' }] } },
      }),
    ).toThrow(LegacyMonsterDocumentConflictError)
  })

  it('drops speaks: true from lifted rows', () => {
    const result = normalizeLegacyMonsterDocument({
      communication: { languages: { entries: [{ language: 'common', speaks: true }] } },
    })
    expect(result.proficiencies).toEqual({ languages: [{ language: 'common' }] })
  })
})
