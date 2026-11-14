import { describe, expect, it } from 'vitest'

import {
  findSpellCastingSource,
  listDirectSpellCastingSources,
  MONSTER_SPELLCASTING_ACTION_NAME,
} from './spell-casting-source'

describe('findSpellCastingSource', () => {
  const sections = {
    actions: [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: MONSTER_SPELLCASTING_ACTION_NAME,
        castingAbility: { kind: 'ability', ability: 'int' },
      },
      {
        id: 'unfinished',
        kind: 'spell',
        name: 'Spellcasting',
      },
      {
        id: 'shared',
        kind: 'spell',
        name: 'Misty Step',
        castingAbility: { kind: 'shared', entryId: 'spellcasting' },
      },
    ],
    bonusActions: [
      {
        id: 'charm',
        kind: 'spell',
        name: 'Charm',
        castingAbility: { kind: 'ability', ability: 'cha' },
      },
    ],
    reactions: [],
  }

  it('returns a spell row that defines an ability and ignores shares', () => {
    expect(findSpellCastingSource(sections, 'spellcasting')).toMatchObject({
      id: 'spellcasting',
      section: 'actions',
      ability: 'int',
    })
    expect(findSpellCastingSource(sections, 'charm')?.ability).toBe('cha')
    expect(findSpellCastingSource(sections, 'shared')).toBeUndefined()
    expect(findSpellCastingSource(sections, 'unfinished')).toBeUndefined()
    expect(findSpellCastingSource(sections, 'missing')).toBeUndefined()
  })

  it('lists only direct spell sources across sections', () => {
    expect(listDirectSpellCastingSources(sections).map((source) => source.id)).toEqual([
      'spellcasting',
      'charm',
    ])
    expect(
      listDirectSpellCastingSources({
        ...sections,
        legendaryActions: [
          {
            id: 'beguile',
            kind: 'spell',
            name: 'Beguile',
            castingAbility: { kind: 'ability', ability: 'cha' },
          },
        ],
      }).map((source) => source.id),
    ).toEqual(['spellcasting', 'charm'])
  })
})
