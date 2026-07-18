import { describe, expect, it } from 'vitest'

import type { NamingCulture } from '@rpg/contracts/name-generator'
import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'

import {
  deriveSpeciesNamingCultureIds,
  getNamingRelevantHeritages,
  HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
  resolveSpeciesNamingOption,
  resolveSpeciesNamingOptions,
  SPECIES_NAMING_UNSUPPORTED_REASON,
  type SpeciesCultureInput,
} from './resolve-species-naming-options'

const ELF_SPECIES: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  name: 'Elf',
  source: 'system',
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, subjectKinds: ['settlement'] },
  },
  heritage: {
    options: [
      { id: 'high-elf', name: 'High Elf' },
      { id: 'drow', name: 'Drow' },
    ],
  },
}

const HUMAN_SPECIES: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:human',
  slug: 'human',
  name: 'Human',
  source: 'system',
  culture: {
    naming: { supported: false },
  },
}

const HOMEBREW_SPECIES: SpeciesCultureInput = {
  id: 'homebrew:custom',
  slug: 'custom',
  name: 'Custom Folk',
  source: 'homebrew',
  culture: {
    naming: { supported: true },
  },
}

const CULTURES = [
  {
    id: 'elven',
    label: 'Elven',
    origin: 'fictional',
  },
  {
    id: 'drow',
    label: 'Drow',
    origin: 'fictional',
    speciesIds: ['srd-cc-5.2.1:elf'],
    heritageIds: ['drow'],
    resolvesToCultureId: 'elven',
  },
  {
    id: 'human',
    label: 'Human',
    origin: 'fictional',
  },
] as const satisfies readonly NamingCulture[]

describe('deriveSpeciesNamingCultureIds', () => {
  it('returns primary culture when naming is supported', () => {
    expect(
      deriveSpeciesNamingCultureIds({
        species: ELF_SPECIES,
        cultures: CULTURES,
      }),
    ).toEqual(['elven'])
  })

  it('defaults to species slug when no culture id override is persisted', () => {
    expect(
      deriveSpeciesNamingCultureIds({
        species: {
          ...ELF_SPECIES,
          culture: { naming: { supported: true } },
        },
        cultures: CULTURES,
      }),
    ).toEqual(['elf'])
  })

  it('returns empty culture ids when naming is unsupported despite affiliation', () => {
    expect(
      deriveSpeciesNamingCultureIds({
        species: HUMAN_SPECIES,
        cultures: CULTURES,
      }),
    ).toEqual([])
  })

  it('prefers heritage-specific culture overrides when present', () => {
    expect(
      deriveSpeciesNamingCultureIds({
        species: ELF_SPECIES,
        heritageOptionId: 'drow',
        cultures: CULTURES,
      }),
    ).toEqual(['drow'])
  })
})

describe('getNamingRelevantHeritages', () => {
  it('hides heritages that resolve to the same naming result', () => {
    expect(
      getNamingRelevantHeritages({
        species: ELF_SPECIES,
        cultures: [{ id: 'elven', label: 'Elven', origin: 'fictional' }],
        conventions: [ELVISH_PERSONAL_CONVENTION],
      }),
    ).toEqual([])
  })

  it('includes heritages that change the resolved culture', () => {
    expect(
      getNamingRelevantHeritages({
        species: ELF_SPECIES,
        cultures: CULTURES,
        conventions: [ELVISH_PERSONAL_CONVENTION],
      }),
    ).toEqual([{ id: 'drow', label: 'Drow' }])
  })
})

describe('resolveSpeciesNamingOptions', () => {
  it('marks homebrew species disabled with a dedicated reason', () => {
    expect(
      resolveSpeciesNamingOption(HOMEBREW_SPECIES, CULTURES, [ELVISH_PERSONAL_CONVENTION]),
    ).toEqual({
      speciesId: 'homebrew:custom',
      label: 'Custom Folk',
      disabled: true,
      disabledReason: HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
      cultureIds: [],
      subjectKinds: [],
    })
  })

  it('marks explicitly unsupported species disabled while keeping affiliation separate', () => {
    expect(resolveSpeciesNamingOption(HUMAN_SPECIES, CULTURES, [])).toEqual({
      speciesId: 'srd-cc-5.2.1:human',
      label: 'Human',
      disabled: true,
      disabledReason: SPECIES_NAMING_UNSUPPORTED_REASON,
      cultureIds: [],
      subjectKinds: [],
    })
  })

  it('omits supported species without a personal convention', () => {
    const supportedWithoutConvention: SpeciesCultureInput = {
      id: 'srd-cc-5.2.1:human',
      slug: 'human',
      name: 'Human',
      source: 'system',
      culture: {
        naming: { supported: true },
      },
    }

    expect(
      resolveSpeciesNamingOption(supportedWithoutConvention, CULTURES, [
        ELVISH_PERSONAL_CONVENTION,
      ]),
    ).toBe(undefined)
  })

  it('returns enabled options for supported species with conventions', () => {
    expect(
      resolveSpeciesNamingOptions({
        speciesList: [ELF_SPECIES, HUMAN_SPECIES],
        cultures: CULTURES,
        conventions: [ELVISH_PERSONAL_CONVENTION],
      }),
    ).toEqual([
      {
        speciesId: 'srd-cc-5.2.1:elf',
        label: 'Elf',
        disabled: false,
        cultureIds: ['elven'],
        subjectKinds: ['person', 'settlement'],
        heritageOptions: [{ id: 'drow', label: 'Drow' }],
      },
      {
        speciesId: 'srd-cc-5.2.1:human',
        label: 'Human',
        disabled: true,
        disabledReason: SPECIES_NAMING_UNSUPPORTED_REASON,
        cultureIds: [],
        subjectKinds: [],
      },
    ])
  })
})
