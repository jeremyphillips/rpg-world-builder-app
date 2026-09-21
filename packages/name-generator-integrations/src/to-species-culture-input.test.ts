import type { Species } from '@rpg/contracts/rpg/content'
import { describe, expect, it } from 'vitest'

import { toSpeciesCultureInput } from './to-species-culture-input'

const elfSpecies = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Elf',
  description: '<p>Graceful and long-lived.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  languageAffinities: ['elvish'],
  traits: [],
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family'] },
  },
} satisfies Species

describe('toSpeciesCultureInput', () => {
  it('preserves language affinities for naming resolution', () => {
    expect(toSpeciesCultureInput(elfSpecies).languageAffinities).toEqual(['elvish'])
  })

  it('maps heritage options without requiring a display name', () => {
    const species = {
      ...elfSpecies,
      heritage: {
        choose: 1,
        id: 'elf-heritage',
        name: 'Elven Lineage',
        options: [
          { kind: 'custom' as const, id: 'high-elf', name: 'High Elf' },
          { kind: 'custom' as const, id: 'wood-elf', name: 'Wood Elf' },
        ],
      },
    } satisfies Species

    expect(toSpeciesCultureInput(species).heritage).toEqual({
      options: [
        { id: 'high-elf', name: 'High Elf' },
        { id: 'wood-elf', name: 'Wood Elf' },
      ],
    })
  })
})
