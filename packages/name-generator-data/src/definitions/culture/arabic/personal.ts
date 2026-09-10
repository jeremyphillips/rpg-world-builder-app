import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const arabicPersonalDefinition = {
  key: 'personal',
  id: 'arabic-personal',
  label: 'Arabic personal names',
  description: 'Classical Arabic personal naming with ism, ibn/bint nasab, and nisba.',
  structures: [
    {
      id: 'nasab',
      label: 'Ism and nasab',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'nasab', role: 'patronym', required: true },
        { key: 'fatherIsm', role: 'given', required: true },
      ],
      format: '{given} {nasab} {fatherIsm}',
    },
    {
      id: 'nasab-nisba',
      label: 'Ism, nasab, and nisba',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'nasab', role: 'patronym', required: true },
        { key: 'fatherIsm', role: 'given', required: true },
        { key: 'nisba', role: 'epithet', required: true },
      ],
      format: '{given} {nasab} {fatherIsm} {nisba}',
    },
    {
      id: 'nisba',
      label: 'Ism and nisba',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'nisba', role: 'epithet', required: true },
      ],
      format: '{given} {nisba}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'arabic-given-pool' },
    { partKey: 'nasab', collectionId: 'arabic-nasab-particle-pool' },
    { partKey: 'fatherIsm', collectionId: 'arabic-given-pool', sourceKey: 'given-masc' },
    { partKey: 'nisba', collectionId: 'arabic-nisba-pool', sourceKey: 'epithet' },
  ],
  collectionIds: ['arabic-given-pool', 'arabic-nasab-particle-pool', 'arabic-nisba-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
