import { describe, expect, it } from 'vitest'

import {
  getEffectiveSpeciesLanguageAffinity,
  getHeritageLanguageAffinity,
  getSpeciesCultureDisplayName,
  getSpeciesCulturePrimaryId,
  getSpeciesLanguageAffinity,
  getSpeciesPersonalNameComponents,
  hasSpeciesCultureOverride,
  isSpeciesNamingSupported,
  speciesCultureConfigSchema,
  speciesNamingConfigSchema,
  type SpeciesCultureConfig,
} from './species-culture'

describe('speciesCultureConfigSchema', () => {
  it('accepts naming-only culture when slug is the default id', () => {
    expect(
      speciesCultureConfigSchema.safeParse({
        naming: { supported: false },
      }).success,
    ).toBe(true)
  })

  it('accepts supported naming with personal name components', () => {
    expect(
      speciesCultureConfigSchema.safeParse({
        naming: { supported: true, personalNameComponents: ['clan', 'family'] },
      }).success,
    ).toBe(true)
  })

  it('accepts paired id and name overrides', () => {
    expect(
      speciesCultureConfigSchema.safeParse({
        id: 'elven',
        name: 'Elven',
        naming: { supported: true, personalNameComponents: ['family'] },
      }).success,
    ).toBe(true)
  })

  it('rejects id without name', () => {
    const result = speciesCultureConfigSchema.safeParse({
      id: 'elven',
      naming: { supported: true },
    })
    expect(result.success).toBe(false)
  })

  it('rejects name without id', () => {
    const result = speciesCultureConfigSchema.safeParse({
      name: 'Elven',
      naming: { supported: true },
    })
    expect(result.success).toBe(false)
  })

  it('rejects given in personalNameComponents', () => {
    expect(
      speciesNamingConfigSchema.safeParse({
        supported: true,
        personalNameComponents: ['given'],
      }).success,
    ).toBe(false)
  })

  it('rejects personalNameComponents when naming is unsupported', () => {
    expect(
      speciesNamingConfigSchema.safeParse({
        supported: false,
        personalNameComponents: ['clan'],
      }).success,
    ).toBe(false)
  })
})

describe('species culture helpers', () => {
  it('defaults culture id to species slug', () => {
    expect(getSpeciesCulturePrimaryId({ slug: 'dwarf' })).toBe('dwarf')
    expect(
      getSpeciesCulturePrimaryId({ slug: 'dwarf', culture: { naming: { supported: true } } }),
    ).toBe('dwarf')
  })

  it('uses culture id override when present', () => {
    const culture: SpeciesCultureConfig = {
      id: 'elven',
      name: 'Elven',
      naming: { supported: true },
    }

    expect(getSpeciesCulturePrimaryId({ slug: 'elf', culture })).toBe('elven')
    expect(hasSpeciesCultureOverride({ culture })).toBe(true)
  })

  it('resolves display name from override, registry, or slug fallback', () => {
    expect(
      getSpeciesCultureDisplayName({
        slug: 'elf',
        culture: { id: 'elven', name: 'Elven', naming: { supported: true } },
      }),
    ).toBe('Elven')

    expect(
      getSpeciesCultureDisplayName({
        slug: 'dwarf',
        culture: { naming: { supported: true } },
        cultures: [{ id: 'dwarf', label: 'Dwarf' }],
      }),
    ).toBe('Dwarf')

    expect(
      getSpeciesCultureDisplayName({
        slug: 'custom-folk',
        culture: { naming: { supported: false } },
      }),
    ).toBe('Custom Folk')
  })

  it('keeps cultural affiliation when naming is unsupported', () => {
    const species = {
      culture: {
        naming: { supported: false as const },
      },
    }

    expect(getSpeciesCulturePrimaryId({ slug: 'human', culture: species.culture })).toBe('human')
    expect(isSpeciesNamingSupported(species)).toBe(false)
    expect(getSpeciesPersonalNameComponents(species)).toEqual([])
  })

  it('returns persisted personal name components when naming is supported', () => {
    const species: { culture: SpeciesCultureConfig } = {
      culture: {
        naming: { supported: true, personalNameComponents: ['family', 'clan'] },
      },
    }

    expect(getSpeciesPersonalNameComponents(species)).toEqual(['family', 'clan'])
  })

  it('returns an empty array when supported naming omits personal components', () => {
    const species: { culture: SpeciesCultureConfig } = {
      culture: {
        naming: { supported: true },
      },
    }

    expect(getSpeciesPersonalNameComponents(species)).toEqual([])
  })

  it('reads species language affinity without heritage override', () => {
    const species = { languageAffinities: ['elvish'] as const }
    expect(getSpeciesLanguageAffinity(species)).toEqual(['elvish'])
    expect(getEffectiveSpeciesLanguageAffinity({ species })).toEqual(['elvish'])
  })

  it('prefers heritage language grants over species affinity', () => {
    const species = { languageAffinities: ['elvish'] as const }
    const heritageOption = {
      kind: 'grant' as const,
      id: 'drow-magic',
      grantGroups: [{ grants: [{ kind: 'languages' as const, languageIds: ['undercommon'] }] }],
    }

    expect(getHeritageLanguageAffinity(heritageOption)).toEqual(['undercommon'])
    expect(getEffectiveSpeciesLanguageAffinity({ species, heritageOption })).toEqual([
      'undercommon',
    ])
  })
})
