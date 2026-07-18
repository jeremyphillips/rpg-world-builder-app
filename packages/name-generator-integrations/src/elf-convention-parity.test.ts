import { describe, expect, it } from 'vitest'

import type { NamingAssociation } from '@rpg/contracts/name-generator'

import { CULTURE_CONVENTION_BINDINGS } from '@rpg/name-generator-data'

import {
  buildSpeciesNamingOption,
  HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
  NO_PERSONAL_NAMING_CONVENTION_REASON,
  SPECIES_NAMING_UNSUPPORTED_REASON,
} from './build-species-naming-options'
import { dedupeAssociations } from './dedupe-associations'
import { getDefaultSubjectKinds } from './default-subject-kinds'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'

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

describe('dedupeAssociations', () => {
  it('merges duplicate culture and language associations by semantic key', () => {
    const associations: NamingAssociation[] = [
      { kind: 'culture', cultureId: 'elven', strength: 'secondary' },
      { kind: 'culture', cultureId: 'elven', strength: 'primary' },
      { kind: 'language', languageId: 'elvish', strength: 'influenced' },
      { kind: 'language', languageId: 'elvish', strength: 'primary' },
    ]

    expect(dedupeAssociations(associations)).toEqual([
      { kind: 'culture', cultureId: 'elven', strength: 'primary' },
      { kind: 'language', languageId: 'elvish', strength: 'primary' },
    ])
  })
})

describe('getDefaultSubjectKinds', () => {
  it('covers every bound convention key', () => {
    for (const definitions of Object.values(CULTURE_CONVENTION_BINDINGS)) {
      for (const definition of definitions) {
        expect(getDefaultSubjectKinds(definition.key).length).toBeGreaterThan(0)
      }
    }
  })
})

describe('buildSpeciesNamingOption', () => {
  it('marks homebrew species disabled with a dedicated reason', () => {
    expect(
      buildSpeciesNamingOption(HOMEBREW_SPECIES, [
        { id: 'elvish-personal', subjectKinds: ['person'], associations: [] } as never,
      ]),
    ).toEqual({
      speciesId: 'homebrew:custom',
      label: 'Custom Folk',
      disabled: true,
      disabledReason: HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
      cultureIds: [],
      subjectKinds: [],
    })
  })

  it('marks explicitly unsupported species disabled', () => {
    expect(buildSpeciesNamingOption(HUMAN_SPECIES, [])).toEqual({
      speciesId: 'srd-cc-5.2.1:human',
      label: 'Human',
      disabled: true,
      disabledReason: SPECIES_NAMING_UNSUPPORTED_REASON,
      cultureIds: [],
      subjectKinds: [],
    })
  })

  it('marks supported species without a personal convention disabled with an explicit reason', () => {
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
      buildSpeciesNamingOption(supportedWithoutConvention, [
        { id: 'elvish-personal', subjectKinds: ['person'], associations: [] } as never,
      ]),
    ).toEqual({
      speciesId: 'srd-cc-5.2.1:human',
      label: 'Human',
      disabled: true,
      disabledReason: NO_PERSONAL_NAMING_CONVENTION_REASON,
      cultureIds: ['human'],
      subjectKinds: [],
    })
  })
})
