import { describe, expect, it } from 'vitest'

import type { NamingAssociation, NamingConvention } from '@rpg/contracts/name-generator'

import { dedupeAssociations } from './dedupe-associations'
import { getDefaultSubjectKinds } from './default-subject-kinds'
import {
  buildSpeciesNamingOption,
  HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
  NO_PERSONAL_NAMING_CONVENTION_REASON,
  SPECIES_NAMING_UNSUPPORTED_REASON,
} from './build-species-naming-options'
import {
  resolveCampaignConventions,
  type SpeciesCultureInput,
} from './resolve-campaign-conventions'
import { resolveNamingConvention } from './resolve-naming-convention'
import { buildNamingCultureContext } from './build-naming-culture-context'
import { CULTURE_CONVENTION_BINDINGS } from '@rpg/name-generator-data'

const [elvenPersonalDefinition, elvenSettlementDefinition] = CULTURE_CONVENTION_BINDINGS.elven

const LEGACY_ELVISH_PERSONAL = {
  id: 'elvish-personal',
  label: 'Elven personal names',
  description: 'Given and family names for elven characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'culture', cultureId: 'elven', strength: 'primary' },
    { kind: 'language', languageId: 'elvish', strength: 'primary' },
  ],
  structures: [...elvenPersonalDefinition.structures],
  partBindings: [...elvenPersonalDefinition.partBindings],
  collectionIds: [...elvenPersonalDefinition.collectionIds],
  provenance: elvenPersonalDefinition.provenance,
  version: elvenPersonalDefinition.version,
} as NamingConvention

const LEGACY_ELVISH_SETTLEMENT = {
  id: 'elvish-settlement',
  label: 'Elven settlement names',
  description: 'Settlement names sharing elvish linguistic pools with personal conventions.',
  subjectKinds: ['settlement', 'landmark'],
  associations: [
    { kind: 'culture', cultureId: 'elven', strength: 'primary' },
    { kind: 'language', languageId: 'elvish', strength: 'primary' },
  ],
  structures: [...elvenSettlementDefinition.structures],
  partBindings: [...elvenSettlementDefinition.partBindings],
  collectionIds: [...elvenSettlementDefinition.collectionIds],
  provenance: elvenSettlementDefinition.provenance,
  version: elvenSettlementDefinition.version,
} as NamingConvention

const ELF_SPECIES: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  name: 'Elf',
  source: 'system',
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family'] },
  },
  languageAffinities: ['elvish'],
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

describe('resolveNamingConvention', () => {
  it('matches legacy elvish personal convention output', () => {
    const context = buildNamingCultureContext(ELF_SPECIES)
    expect(resolveNamingConvention({ context, definition: elvenPersonalDefinition })).toEqual(
      LEGACY_ELVISH_PERSONAL,
    )
  })

  it('matches legacy elvish settlement convention output', () => {
    const context = buildNamingCultureContext(ELF_SPECIES)
    expect(resolveNamingConvention({ context, definition: elvenSettlementDefinition })).toEqual(
      LEGACY_ELVISH_SETTLEMENT,
    )
  })
})

describe('resolveCampaignConventions', () => {
  it('preserves elf convention ordering and dedupes by resolved id', () => {
    const conventions = resolveCampaignConventions({
      species: [ELF_SPECIES, ELF_SPECIES],
      bindings: CULTURE_CONVENTION_BINDINGS,
    })

    expect(conventions.map((convention) => convention.id)).toEqual([
      'elvish-personal',
      'elvish-settlement',
    ])
  })
})

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
    expect(buildSpeciesNamingOption(HOMEBREW_SPECIES, [LEGACY_ELVISH_PERSONAL])).toEqual({
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

    expect(buildSpeciesNamingOption(supportedWithoutConvention, [LEGACY_ELVISH_PERSONAL])).toEqual({
      speciesId: 'srd-cc-5.2.1:human',
      label: 'Human',
      disabled: true,
      disabledReason: NO_PERSONAL_NAMING_CONVENTION_REASON,
      cultureIds: ['human'],
      subjectKinds: [],
    })
  })
})
