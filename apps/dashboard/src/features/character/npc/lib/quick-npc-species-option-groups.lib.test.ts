import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { pickSpecies } from '@/test/fixtures/pick'

import {
  buildQuickNpcSpeciesRadioCardPresentation,
  QUICK_NPC_SPECIES_ALL_GROUP_EYEBROW,
} from './quick-npc-species-option-groups.lib'
import { QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW } from './quick-npc-affinity-option-groups.lib'

describe('buildQuickNpcSpeciesRadioCardPresentation', () => {
  const human = pickSpecies('human')
  const elf = pickSpecies('elf')
  const dwarf = pickSpecies('dwarf')
  const playableSpecies = [human, elf, dwarf]
  const speciesOptions = playableSpecies.map((species) => ({
    value: species.id,
    label: species.name,
  }))

  it('returns a flat picker when no affinity survivors exist', () => {
    const availableSpeciesOptions = speciesOptions.filter((option) => option.value !== elf.id)

    expect(
      buildQuickNpcSpeciesRadioCardPresentation({
        speciesOptions: availableSpeciesOptions,
        speciesAffinityIds: [elf.id],
        playableSpecies: [human, dwarf],
      }),
    ).toEqual({
      options: [
        { value: human.id, label: 'Human' },
        { value: dwarf.id, label: 'Dwarf' },
      ],
    })
  })

  it('groups recommended species ahead of all species when survivors exist', () => {
    expect(
      buildQuickNpcSpeciesRadioCardPresentation({
        speciesOptions,
        speciesAffinityIds: [elf.id, dwarf.id],
        playableSpecies,
      }),
    ).toEqual({
      options: speciesOptions.map((option) => ({ value: option.value, label: option.label })),
      optionGroups: [
        {
          id: 'recommended',
          eyebrow: QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW,
          options: [
            { value: elf.id, label: 'Elf' },
            { value: dwarf.id, label: 'Dwarf' },
          ],
        },
        {
          id: 'all-species',
          eyebrow: QUICK_NPC_SPECIES_ALL_GROUP_EYEBROW,
          options: [{ value: human.id, label: 'Human' }],
        },
      ],
    })
  })

  it('does not recommend unavailable species affinity rows', () => {
    const unavailableElf = {
      ...elf,
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    }

    expect(
      buildQuickNpcSpeciesRadioCardPresentation({
        speciesOptions: [{ value: human.id, label: human.name }],
        speciesAffinityIds: [unavailableElf.id],
        playableSpecies: [human],
      }),
    ).toEqual({
      options: [{ value: human.id, label: 'Human' }],
    })
  })

  it('omits the all-species group when every available species is recommended', () => {
    expect(
      buildQuickNpcSpeciesRadioCardPresentation({
        speciesOptions: speciesOptions.filter((option) => option.value !== elf.id),
        speciesAffinityIds: [human.id, dwarf.id],
        playableSpecies: [human, dwarf],
      }).optionGroups,
    ).toEqual([
      {
        id: 'recommended',
        eyebrow: QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW,
        options: [
          { value: human.id, label: 'Human' },
          { value: dwarf.id, label: 'Dwarf' },
        ],
      },
    ])
  })
})
