import type { NameCollection, NameCollectionProvenance, NamingConvention } from './index'

export const FIXTURE_PROVENANCE: NameCollectionProvenance = {
  sourceName: 'Test fixture',
  license: 'original',
  methodology: 'original-fictional',
}

export const ELVISH_GIVEN_COLLECTION: NameCollection = {
  id: 'elvish-given-pool',
  label: 'Elvish given names',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: ['Aelar', 'Adran', 'Aramil'],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: ['Adrie', 'Althaea', 'Ilyrana'],
      },
    ],
  },
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const ELVISH_FAMILY_COLLECTION: NameCollection = {
  id: 'elvish-family-pool',
  label: 'Elvish family names',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'family',
        role: 'family',
        genderStyle: 'shared',
        values: ['Amastacia', 'Galanodel', 'Holimion'],
      },
    ],
  },
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const ELVISH_PERSONAL_CONVENTION: NamingConvention = {
  id: 'elvish-personal',
  label: 'High Elven personal names',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'elvish', strength: 'primary' },
    { kind: 'culture', cultureId: 'high-elven', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:elf' },
  ],
  structures: [
    {
      id: 'full',
      label: 'Given and family',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'family', role: 'family', required: true },
      ],
      format: '{given} {family}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'elvish-given-pool', sourceKey: 'given-masc' },
    { partKey: 'family', collectionId: 'elvish-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['elvish-given-pool', 'elvish-family-pool'],
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const FACTION_DESCRIPTOR_COLLECTION: NameCollection = {
  id: 'faction-descriptor-pool',
  label: 'Faction descriptors',
  subjectKinds: ['faction'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'descriptor',
        role: 'descriptor',
        values: ['Silent', 'Crimson', 'Iron'],
      },
    ],
  },
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const FACTION_TYPE_COLLECTION: NameCollection = {
  id: 'faction-org-type-pool',
  label: 'Organization types',
  subjectKinds: ['faction'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'organizationType',
        role: 'organizationType',
        values: ['Guild', 'Brotherhood', 'Circle'],
      },
    ],
  },
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const FACTION_CONVENTION: NamingConvention = {
  id: 'faction-general',
  label: 'General faction names',
  subjectKinds: ['faction'],
  associations: [],
  structures: [
    {
      id: 'guild',
      label: 'Guild style',
      parts: [
        { key: 'descriptor', role: 'descriptor', required: true },
        { key: 'organizationType', role: 'organizationType', required: true },
      ],
      format: 'The {descriptor} {organizationType}',
    },
  ],
  partBindings: [
    { partKey: 'descriptor', collectionId: 'faction-descriptor-pool', sourceKey: 'descriptor' },
    {
      partKey: 'organizationType',
      collectionId: 'faction-org-type-pool',
      sourceKey: 'organizationType',
    },
  ],
  collectionIds: ['faction-descriptor-pool', 'faction-org-type-pool'],
  provenance: FIXTURE_PROVENANCE,
  tags: ['guild', 'criminal'],
  version: 1,
}

export const SYLLABLE_COLLECTION: NameCollection = {
  id: 'test-syllable-pool',
  label: 'Syllable test pool',
  subjectKinds: ['person'],
  generator: {
    type: 'syllable',
    patterns: ['{onset}{nucleus}{coda}'],
    pools: {
      onset: ['b', 'k', 'th'],
      nucleus: ['a', 'e', 'i'],
      coda: ['n', 'r', 'l'],
    },
    constraints: { minSyllables: 2, maxSyllables: 2, capitalize: true },
  },
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const COMPOUND_COLLECTION: NameCollection = {
  id: 'test-compound-pool',
  label: 'Compound test pool',
  subjectKinds: ['settlement'],
  generator: {
    type: 'compound',
    parts: [{ pool: 'root', separator: ' ' }, { pool: 'suffix' }],
    pools: {
      root: ['Iron', 'Stone'],
      suffix: ['hold', 'gate', 'heim'],
    },
  },
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

export const COMPOUND_CONVENTION: NamingConvention = {
  id: 'dwarven-settlement',
  label: 'Dwarven settlement',
  subjectKinds: ['settlement'],
  associations: [
    { kind: 'culture', cultureId: 'mountain-dwarf', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:dwarf' },
  ],
  structures: [
    {
      id: 'hold',
      label: 'Hold name',
      parts: [{ key: 'place', role: 'placeRoot', required: true }],
      format: '{place}',
    },
  ],
  partBindings: [{ partKey: 'place', collectionId: 'test-compound-pool' }],
  collectionIds: ['test-compound-pool'],
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}
