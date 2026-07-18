import { describe, expect, it } from 'vitest'

import { cultureToFormValues } from './species-culture-form-fields'
import {
  cultureFromFormValues,
  normalizeSpeciesCultureForPersist,
} from './species-culture-form-values'

describe('normalizeSpeciesCultureForPersist', () => {
  it('persists naming-only culture when slug is the default id', () => {
    expect(
      normalizeSpeciesCultureForPersist({
        slug: 'dwarf',
        culture: cultureToFormValues({
          naming: { supported: true, personalNameComponents: ['clan'] },
        }),
        entitySource: 'system',
      }),
    ).toEqual({
      naming: { supported: true, personalNameComponents: ['clan'] },
    })
  })

  it('omits empty personalNameComponents arrays on save', () => {
    expect(
      normalizeSpeciesCultureForPersist({
        slug: 'orc',
        culture: cultureToFormValues({ naming: { supported: true, personalNameComponents: [] } }),
        entitySource: 'system',
      }),
    ).toEqual({
      naming: { supported: true },
    })
  })

  it('forces unsupported naming for homebrew species', () => {
    expect(
      normalizeSpeciesCultureForPersist({
        slug: 'custom-folk',
        culture: cultureToFormValues({
          naming: { supported: true, personalNameComponents: ['family'] },
        }),
        entitySource: 'homebrew',
      }),
    ).toEqual({
      naming: { supported: false },
    })
  })

  it('generates culture id from name on first override create', () => {
    expect(
      normalizeSpeciesCultureForPersist({
        slug: 'elf',
        culture: {
          useOverride: true,
          name: 'Elven',
          naming: { supported: true },
        },
        entitySource: 'homebrew',
      }),
    ).toEqual({
      id: 'elven',
      name: 'Elven',
      naming: { supported: false },
    })
  })

  it('does not re-derive culture id when an existing id is present', () => {
    expect(
      normalizeSpeciesCultureForPersist({
        slug: 'elf',
        culture: {
          useOverride: true,
          id: 'elven',
          name: 'High Elven',
          naming: { supported: true },
        },
        existingCultureId: 'elven',
        entitySource: 'system',
      }),
    ).toEqual({
      id: 'elven',
      name: 'High Elven',
      naming: { supported: true },
    })
  })

  it('strips id and name when derived id matches species slug', () => {
    expect(
      normalizeSpeciesCultureForPersist({
        slug: 'dwarf',
        culture: {
          useOverride: true,
          name: 'Dwarf',
          naming: { supported: true },
        },
        entitySource: 'system',
      }),
    ).toEqual({
      naming: { supported: true },
    })
  })

  it('preserves frozen culture id through cultureFromFormValues', () => {
    const persisted = cultureFromFormValues(
      {
        useOverride: true,
        name: 'Renamed Elven',
        naming: { supported: true },
      },
      {
        slug: 'elf',
        existingCultureId: 'elven',
        entitySource: 'system',
      },
    )

    expect(persisted).toEqual({
      id: 'elven',
      name: 'Renamed Elven',
      naming: { supported: true },
    })
  })
})
