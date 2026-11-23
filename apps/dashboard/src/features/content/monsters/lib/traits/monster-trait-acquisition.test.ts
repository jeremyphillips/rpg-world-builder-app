import { describe, expect, it } from 'vitest'

import {
  CREATURE_TRAIT_VOCABULARY_ENTRIES,
  CREATURE_TRAIT_VOCABULARY_IDS,
  getCreatureTraitSearchTerms,
} from '@rpg/contracts'

import {
  monsterTraitAcquisitionDropdownItems,
  parseMonsterTraitAcquisitionId,
} from './monster-trait-acquisition'
import { CREATURE_TRAIT_CUSTOM_DESCRIPTION } from '../../../lib/creature-traits/creature-trait-custom-description'

describe('monsterTraitAcquisitionDropdownItems', () => {
  const items = monsterTraitAcquisitionDropdownItems({ traits: [], templateIds: [] })

  it('lists every preset under its vocabulary group, then custom', () => {
    for (const presetId of CREATURE_TRAIT_VOCABULARY_IDS) {
      const entry = CREATURE_TRAIT_VOCABULARY_ENTRIES[presetId]
      expect(items.find((item) => item.id === `preset:${presetId}`)).toMatchObject({
        label: entry.label,
        metadata: entry.description,
        groupId: entry.group,
      })
    }
    expect(items.at(-1)).toMatchObject({
      id: 'custom',
      label: 'Custom trait',
      groupId: 'general',
      metadata: CREATURE_TRAIT_CUSTOM_DESCRIPTION,
    })
    const labels = items.filter((item) => item.groupId === 'movement').map((item) => item.label)
    expect(labels).toEqual([...labels].sort((left, right) => left.localeCompare(right)))
  })

  it('disables a preset that is already on the monster', () => {
    const taken = monsterTraitAcquisitionDropdownItems({
      traits: [{ id: 'pack-1', preset: 'pack-tactics' }],
      templateIds: [],
    })
    expect(taken.find((item) => item.label === 'Pack Tactics')).toMatchObject({
      id: 'preset:pack-tactics',
      disabled: true,
      disabledReason: 'Only one Pack Tactics is allowed.',
      metadata: CREATURE_TRAIT_VOCABULARY_ENTRIES['pack-tactics'].description,
    })
    expect(parseMonsterTraitAcquisitionId('preset:flyby')).toEqual({
      type: 'preset',
      presetId: 'flyby',
    })
    expect(parseMonsterTraitAcquisitionId('custom')).toEqual({ type: 'custom' })
  })

  it('indexes curated search terms instead of add-menu descriptions', () => {
    const flyby = items.find((item) => item.id === 'preset:flyby')
    expect(flyby).toMatchObject({
      search: { includeSupporting: false },
      searchTerms: expect.arrayContaining(['flying']),
    })
    const freeze = items.find((item) => item.id === 'preset:freeze')
    expect(freeze?.searchTerms).toEqual(expect.arrayContaining(['cold']))
    expect(getCreatureTraitSearchTerms('flyby')).toContain('flying')
  })
})
