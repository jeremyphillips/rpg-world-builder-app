import { describe, expect, it } from 'vitest'

import { pickClass } from './fixtures/pick'
import { formatInnateSpellEntryTitle } from './grant-form-fields'
import { formRowsToGrants, grantsToFormRows } from './grant-form-values'

describe('grantsToFormRows / formRowsToGrants', () => {
  it('round-trips proficiency tool and weapon slug arrays', () => {
    const rows = grantsToFormRows({
      proficiencies: {
        tools: ['thieves-tools'],
        weapons: ['dagger', 'rapier'],
      },
    })
    const profGrant = rows.find((row) => row.grantType === 'proficiencies')

    expect(profGrant?.proficiencyTools).toEqual(['thieves-tools'])
    expect(profGrant?.proficiencyWeapons).toEqual(['dagger', 'rapier'])

    const restored = formRowsToGrants(rows)
    expect(restored?.proficiencies).toEqual({
      tools: ['thieves-tools'],
      weapons: ['dagger', 'rapier'],
    })
  })

  it('round-trips innate spell slug arrays', () => {
    const bard = pickClass('bard')
    const wordsOfCreation = bard.features.find((feature) => feature.id === 'words-of-creation')
    const rows = grantsToFormRows(wordsOfCreation?.grants)
    const innateRow = rows.find((row) => row.grantType === 'innateSpells')

    expect(innateRow?.innateSpellEntries?.[0]?.spellIds).toEqual([
      'power-word-heal',
      'power-word-kill',
    ])

    const restored = formRowsToGrants(rows)
    expect(restored?.innateSpells?.entries[0]?.spellIds).toEqual([
      'power-word-heal',
      'power-word-kill',
    ])
  })

  it('round-trips recommended feat ids on feat choice grants', () => {
    const fighter = pickClass('fighter')
    const fightingStyle = fighter.features.find((feature) => feature.id === 'fighting-style')
    const rows = grantsToFormRows(fightingStyle?.grants)
    const featRow = rows.find((row) => row.grantType === 'featChoice')

    expect(featRow?.featRecommendedIds).toEqual(['defense'])

    const restored = formRowsToGrants(rows)
    expect(restored?.featChoice).toEqual({
      category: 'fighting-style',
      choose: 1,
      replaceable: true,
      recommendedFeatIds: ['defense'],
    })
  })

  it('round-trips feat choice grants', () => {
    const fighter = pickClass('fighter')
    const fightingStyle = fighter.features.find((feature) => feature.id === 'fighting-style')
    const rows = grantsToFormRows(fightingStyle?.grants)
    const featRow = rows.find((row) => row.grantType === 'featChoice')

    expect(featRow?.featCategory).toBe('fighting-style')
    expect(featRow?.featChoose).toBe(1)
    expect(featRow?.featReplaceable).toBe(true)

    const restored = formRowsToGrants(rows)
    expect(restored?.featChoice).toEqual({
      category: 'fighting-style',
      choose: 1,
      replaceable: true,
      recommendedFeatIds: ['defense'],
    })
  })
})

describe('formatInnateSpellEntryTitle', () => {
  it('shows spell labels when one or two spells are selected', () => {
    expect(
      formatInnateSpellEntryTitle(
        ['power-word-heal', 'power-word-kill'],
        [
          { value: 'power-word-heal', label: 'Power Word Heal' },
          { value: 'power-word-kill', label: 'Power Word Kill' },
        ],
        0,
      ),
    ).toBe('Power Word Heal, Power Word Kill')
  })

  it('shows a count when more than two spells are selected', () => {
    expect(formatInnateSpellEntryTitle(['a', 'b', 'c'], [], 2)).toBe('3 spells')
  })
})
