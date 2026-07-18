import { describe, expect, it } from 'vitest'

import { deriveContentKey } from '@rpg/contracts'

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
        culture: cultureToFormValues({ naming: { supported: true, subjectKinds: ['settlement'] } }),
      }),
    ).toEqual({
      naming: { supported: true, subjectKinds: ['settlement'] },
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
      }),
    ).toEqual({
      id: 'elven',
      name: 'Elven',
      naming: { supported: true },
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
      },
    )

    expect(persisted).toEqual({
      id: 'elven',
      name: 'Renamed Elven',
      naming: { supported: true },
    })
    expect(deriveContentKey('Renamed Elven')).not.toBe('elven')
  })
})
