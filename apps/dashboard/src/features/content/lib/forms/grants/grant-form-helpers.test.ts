import { describe, expect, it } from 'vitest'

import { pickClass } from '../../fixtures/pick'
import { formatInnateSpellEntryTitle } from './grant-form-fields'
import { GRANT_ROW_TYPE_LABELS, GRANT_ROW_TYPES } from './grant-form-schema'
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

  it('round-trips equipment grants when the row type list includes equipment', () => {
    const grants = {
      equipment: [
        { kind: 'fixed' as const, equipmentSlug: 'dagger', quantity: 2, equipped: true },
        {
          kind: 'choice' as const,
          choose: 1,
          pool: {
            source: 'filtered' as const,
            equipmentKind: 'tool' as const,
            toolCategory: 'musical_instrument' as const,
          },
        },
      ],
    }

    const rows = grantsToFormRows(grants)
    expect(rows.filter((row) => row.grantType === 'equipment')).toHaveLength(2)
    expect(rows.find((row) => row.itemKind === 'fixed')).toMatchObject({
      grantType: 'equipment',
      equipmentSlug: 'dagger',
      quantity: 2,
      equipped: true,
    })
    expect(rows.find((row) => row.itemKind === 'choice')).toMatchObject({
      grantType: 'equipment',
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategory: 'musical_instrument',
    })

    expect(formRowsToGrants(rows)).toEqual(grants)
  })
})

describe('grant row type exports', () => {
  it('keeps consumer grant pickers unchanged while allowing equipment rows in the schema', () => {
    expect(GRANT_ROW_TYPES).toContain('equipment')
    expect(GRANT_ROW_TYPE_LABELS.equipment).toBe('Equipment')
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
