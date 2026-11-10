import { describe, expect, it } from 'vitest'

import {
  CREATURE_TRAIT_VOCABULARY_ENTRIES,
  CREATURE_TRAIT_VOCABULARY_IDS,
  getCreatureTraitSearchTerms,
} from '@rpg/contracts'

import {
  MONSTER_TRAIT_ACQUISITION_GROUPS,
  MONSTER_TRAIT_CUSTOM_DESCRIPTION,
  monsterTraitAcquisitionItems,
  parseMonsterTraitAcquisitionId,
} from './monster-trait-acquisition'
import { MONSTER_ACTION_ALREADY_ADDED_NOTE } from './monster-action-acquisition'

describe('monsterTraitAcquisitionItems', () => {
  const items = monsterTraitAcquisitionItems({ traits: [] })

  it('lists every preset under its vocabulary group, then custom', () => {
    const groupOrder = MONSTER_TRAIT_ACQUISITION_GROUPS.map((group) => group.id)
    expect(groupOrder).toEqual(['environment', 'movement', 'combat', 'form', 'general'])
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
      metadata: MONSTER_TRAIT_CUSTOM_DESCRIPTION,
    })
    const labels = items.filter((item) => item.groupId === 'movement').map((item) => item.label)
    expect(labels).toEqual([...labels].sort((left, right) => left.localeCompare(right)))
  })

  it('focuses a preset that is already on the monster', () => {
    const taken = monsterTraitAcquisitionItems({
      traits: [{ id: 'pack-1', preset: 'pack-tactics' }],
    })
    expect(taken.find((item) => item.label === 'Pack Tactics')).toMatchObject({
      id: 'focus:pack-1',
      note: MONSTER_ACTION_ALREADY_ADDED_NOTE,
      metadata: CREATURE_TRAIT_VOCABULARY_ENTRIES['pack-tactics'].description,
    })
    expect(parseMonsterTraitAcquisitionId('focus:pack-1')).toEqual({
      type: 'focus',
      traitId: 'pack-1',
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
      searchMetadata: false,
      searchTerms: expect.arrayContaining([
        expect.objectContaining({ text: 'flying', role: 'keyword' }),
      ]),
    })
    const freeze = items.find((item) => item.id === 'preset:freeze')
    expect(freeze?.searchTerms).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: 'cold', role: 'keyword' })]),
    )
    expect(getCreatureTraitSearchTerms('flyby')).toContain('flying')
  })
})
