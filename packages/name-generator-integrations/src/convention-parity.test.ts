import { describe, expect, it } from 'vitest'

import type {
  NamingAssociation,
  NamingConvention,
  NamingConventionDefinition,
  NamingCultureContext,
} from '@rpg/contracts/name-generator'

import { CULTURE_CONVENTION_BINDINGS, STANDALONE_NAMING_CULTURES } from '@rpg/name-generator-data'

import { buildNamingCultureContext } from './build-naming-culture-context'
import {
  resolveCampaignConventions,
  type SpeciesCultureInput,
} from './resolve-campaign-conventions'
import { resolveNamingConvention } from './resolve-naming-convention'
import { resolveStandaloneConventions } from './resolve-standalone-conventions'

function buildLegacyConvention({
  context,
  definition,
  associations,
  subjectKinds,
}: {
  context: NamingCultureContext
  definition: NamingConventionDefinition
  associations: NamingAssociation[]
  subjectKinds?: readonly NamingConvention['subjectKinds'][number][]
}): NamingConvention {
  return {
    id: definition.id ?? `${context.cultureId}-${definition.key}`,
    label: definition.label ?? '',
    description: definition.description ?? '',
    subjectKinds: [...(subjectKinds ?? definition.subjectKinds ?? ['person'])],
    associations,
    structures: [...definition.structures],
    partBindings: [...definition.partBindings],
    collectionIds: [...definition.collectionIds],
    provenance: definition.provenance,
    version: definition.version,
  }
}

const SPECIES_FIXTURES = {
  dwarf: {
    id: 'srd-cc-5.2.1:dwarf',
    slug: 'dwarf',
    name: 'Dwarf',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
    languageAffinities: ['dwarvish'],
  },
  elf: {
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
  },
  halfling: {
    id: 'srd-cc-5.2.1:halfling',
    slug: 'halfling',
    name: 'Halfling',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['family'] } },
    languageAffinities: ['halfling'],
  },
  gnome: {
    id: 'srd-cc-5.2.1:gnome',
    slug: 'gnome',
    name: 'Gnome',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['family'] } },
    languageAffinities: ['gnomish'],
  },
  dragonborn: {
    id: 'srd-cc-5.2.1:dragonborn',
    slug: 'dragonborn',
    name: 'Dragonborn',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
    languageAffinities: ['draconic'],
  },
  goliath: {
    id: 'srd-cc-5.2.1:goliath',
    slug: 'goliath',
    name: 'Goliath',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['epithet', 'clan'] } },
    languageAffinities: ['giant'],
  },
  tiefling: {
    id: 'srd-cc-5.2.1:tiefling',
    slug: 'tiefling',
    name: 'Tiefling',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['virtue'] } },
  },
  orc: {
    id: 'srd-cc-5.2.1:orc',
    slug: 'orc',
    name: 'Orc',
    source: 'system',
    culture: { naming: { supported: true } },
    languageAffinities: ['orc'],
  },
} as const satisfies Record<string, SpeciesCultureInput>

type ParityCase = {
  speciesKey: keyof typeof SPECIES_FIXTURES
  definition: NamingConventionDefinition
  associations: NamingAssociation[]
  subjectKinds?: readonly NamingConvention['subjectKinds'][number][]
}

const CAMPAIGN_PARITY_CASES: ParityCase[] = [
  {
    speciesKey: 'elf',
    definition: CULTURE_CONVENTION_BINDINGS.elven[0],
    associations: [
      { kind: 'culture', cultureId: 'elven', strength: 'primary' },
      { kind: 'language', languageId: 'elvish', strength: 'primary' },
    ],
  },
  {
    speciesKey: 'elf',
    definition: CULTURE_CONVENTION_BINDINGS.elven[1],
    associations: [
      { kind: 'culture', cultureId: 'elven', strength: 'primary' },
      { kind: 'language', languageId: 'elvish', strength: 'primary' },
    ],
    subjectKinds: ['settlement', 'landmark'],
  },
  {
    speciesKey: 'dwarf',
    definition: CULTURE_CONVENTION_BINDINGS.dwarf[0],
    associations: [
      { kind: 'culture', cultureId: 'dwarf', strength: 'primary' },
      { kind: 'language', languageId: 'dwarvish', strength: 'primary' },
    ],
  },
  {
    speciesKey: 'dwarf',
    definition: CULTURE_CONVENTION_BINDINGS.dwarf[1],
    associations: [
      { kind: 'culture', cultureId: 'dwarf', strength: 'primary' },
      { kind: 'language', languageId: 'dwarvish', strength: 'primary' },
    ],
    subjectKinds: ['settlement'],
  },
  {
    speciesKey: 'halfling',
    definition: CULTURE_CONVENTION_BINDINGS.halfling[0],
    associations: [
      { kind: 'culture', cultureId: 'halfling', strength: 'primary' },
      { kind: 'language', languageId: 'halfling', strength: 'primary' },
    ],
  },
  {
    speciesKey: 'halfling',
    definition: CULTURE_CONVENTION_BINDINGS.halfling[1],
    associations: [
      { kind: 'culture', cultureId: 'halfling', strength: 'primary' },
      { kind: 'language', languageId: 'halfling', strength: 'primary' },
    ],
    subjectKinds: ['settlement', 'landmark'],
  },
  {
    speciesKey: 'gnome',
    definition: CULTURE_CONVENTION_BINDINGS.gnome[0],
    associations: [
      { kind: 'culture', cultureId: 'gnome', strength: 'primary' },
      { kind: 'language', languageId: 'gnomish', strength: 'primary' },
    ],
  },
  {
    speciesKey: 'gnome',
    definition: CULTURE_CONVENTION_BINDINGS.gnome[1],
    associations: [
      { kind: 'culture', cultureId: 'gnome', strength: 'primary' },
      { kind: 'language', languageId: 'gnomish', strength: 'primary' },
    ],
    subjectKinds: ['settlement', 'landmark'],
  },
  {
    speciesKey: 'dragonborn',
    definition: CULTURE_CONVENTION_BINDINGS.dragonborn[0],
    associations: [
      { kind: 'culture', cultureId: 'dragonborn', strength: 'primary' },
      { kind: 'language', languageId: 'draconic', strength: 'primary' },
    ],
  },
  {
    speciesKey: 'dragonborn',
    definition: CULTURE_CONVENTION_BINDINGS.dragonborn[1],
    associations: [
      { kind: 'culture', cultureId: 'dragonborn', strength: 'primary' },
      { kind: 'language', languageId: 'draconic', strength: 'primary' },
    ],
    subjectKinds: ['clan', 'family'],
  },
  {
    speciesKey: 'goliath',
    definition: CULTURE_CONVENTION_BINDINGS.goliath[0],
    associations: [
      { kind: 'culture', cultureId: 'goliath', strength: 'primary' },
      { kind: 'language', languageId: 'giant', strength: 'primary' },
    ],
  },
  {
    speciesKey: 'tiefling',
    definition: CULTURE_CONVENTION_BINDINGS.tiefling[0],
    associations: [
      { kind: 'culture', cultureId: 'tiefling', strength: 'primary' },
      { kind: 'language', languageId: 'infernal', strength: 'influenced' },
    ],
  },
  {
    speciesKey: 'orc',
    definition: CULTURE_CONVENTION_BINDINGS.orc[0],
    associations: [
      { kind: 'culture', cultureId: 'orc', strength: 'primary' },
      { kind: 'language', languageId: 'orc', strength: 'primary' },
    ],
  },
]

describe('resolveNamingConvention parity', () => {
  it.each(CAMPAIGN_PARITY_CASES)(
    'matches legacy output for $definition.id',
    ({ speciesKey, definition, associations, subjectKinds }) => {
      const species = SPECIES_FIXTURES[speciesKey]
      const context = buildNamingCultureContext(species)
      const legacy = buildLegacyConvention({ context, definition, associations, subjectKinds })

      expect(resolveNamingConvention({ context, definition })).toEqual(legacy)
    },
  )

  it('matches legacy akan personal convention output', () => {
    const definition = CULTURE_CONVENTION_BINDINGS.akan[0]
    const context = {
      cultureId: 'akan',
      cultureLabel: 'Akan',
      languageIds: [],
    }
    const legacy = buildLegacyConvention({
      context,
      definition,
      associations: [
        { kind: 'culture', cultureId: 'akan', strength: 'primary' },
        { kind: 'region', regionId: 'west-africa' },
      ],
    })

    expect(resolveNamingConvention({ context, definition })).toEqual(legacy)
  })
})

describe('resolveCampaignConventions ordering', () => {
  it('preserves binding order within each culture', () => {
    const conventions = resolveCampaignConventions({
      species: Object.values(SPECIES_FIXTURES),
      bindings: CULTURE_CONVENTION_BINDINGS,
    })

    expect(conventions.map((convention) => convention.id)).toEqual([
      'dwarven-personal',
      'dwarven-settlement',
      'elvish-personal',
      'elvish-settlement',
      'halfling-personal',
      'halfling-settlement',
      'gnomish-personal',
      'gnomish-settlement',
      'draconic-dragonborn-personal',
      'draconic-dragonborn-clan',
      'goliath-personal',
      'infernal-tiefling-personal',
      'orc-personal',
    ])
  })
})

describe('resolveStandaloneConventions', () => {
  it('resolves akan personal convention from standalone culture metadata', () => {
    const [convention] = resolveStandaloneConventions({
      cultures: STANDALONE_NAMING_CULTURES,
      bindings: CULTURE_CONVENTION_BINDINGS,
    })

    expect(convention?.id).toBe('akan-personal')
    expect(convention?.associations).toEqual([
      { kind: 'culture', cultureId: 'akan', strength: 'primary' },
      { kind: 'region', regionId: 'west-africa' },
    ])
  })
})
