import { describe, expect, it } from 'vitest'

import {
  MONSTER_FIXTURE_SPELLS,
  PROTECTIVE_MAGIC_REACTION,
  SHIELD_CONDITION_REACTION,
  monsterFixtureSpellLookup,
} from '../../content/monster/test-fixtures'
import { resolveMonsterReactionTrigger } from './reaction-trigger'

const spellsById = monsterFixtureSpellLookup()

describe('resolveMonsterReactionTrigger', () => {
  it('inherits each spell trigger for Protective Magic and does not add a condition', () => {
    const resolved = resolveMonsterReactionTrigger({
      action: PROTECTIVE_MAGIC_REACTION,
      spellsById,
      catalogStatus: 'ready',
    })
    expect(resolved).toEqual({
      kind: 'spell-choices',
      spells: [
        {
          spellId: MONSTER_FIXTURE_SPELLS.counterspell.id,
          status: 'inherited',
          trigger: MONSTER_FIXTURE_SPELLS.counterspell.castingTime.normal.trigger?.text,
        },
        {
          spellId: MONSTER_FIXTURE_SPELLS.shield.id,
          status: 'inherited',
          trigger: MONSTER_FIXTURE_SPELLS.shield.castingTime.normal.trigger?.text,
        },
      ],
    })
  })

  it('keeps the spell trigger and adds the authored condition', () => {
    const resolved = resolveMonsterReactionTrigger({
      action: SHIELD_CONDITION_REACTION,
      spellsById,
      catalogStatus: 'ready',
    })
    expect(resolved.kind).toBe('spell-choices')
    if (resolved.kind !== 'spell-choices') return
    expect(resolved.additionalCondition).toEqual({ text: 'The archmage can see the attacker.' })
    expect(resolved.spells[0]).toMatchObject({
      status: 'inherited',
      trigger: MONSTER_FIXTURE_SPELLS.shield.castingTime.normal.trigger?.text,
    })
    expect(resolved.spells[0]).not.toMatchObject({
      trigger: 'The archmage can see the attacker.',
    })
  })

  it('marks a non-reaction choice unresolved and keeps the reaction spell', () => {
    const resolved = resolveMonsterReactionTrigger({
      action: {
        kind: 'spell',
        spells: [
          { spellId: MONSTER_FIXTURE_SPELLS.shield.id },
          { spellId: MONSTER_FIXTURE_SPELLS.fireball.id },
        ],
      },
      spellsById,
      catalogStatus: 'ready',
    })
    expect(resolved).toMatchObject({
      kind: 'spell-choices',
      spells: [
        { spellId: MONSTER_FIXTURE_SPELLS.shield.id, status: 'inherited' },
        {
          spellId: MONSTER_FIXTURE_SPELLS.fireball.id,
          status: 'unresolved',
          reason: 'not-reaction',
        },
      ],
    })
  })

  it('reports unknown spells and an unavailable catalog', () => {
    expect(
      resolveMonsterReactionTrigger({
        action: { kind: 'spell', spells: [{ spellId: 'missing' }] },
        spellsById,
        catalogStatus: 'ready',
      }),
    ).toMatchObject({ spells: [{ reason: 'unknown-spell' }] })
    expect(
      resolveMonsterReactionTrigger({
        action: { kind: 'spell', spells: [{ spellId: MONSTER_FIXTURE_SPELLS.shield.id }] },
        spellsById,
        catalogStatus: 'unavailable',
      }),
    ).toMatchObject({ spells: [{ reason: 'catalog-unavailable' }] })
  })

  it('treats a non-spell reaction trigger as authored or unspecified', () => {
    expect(
      resolveMonsterReactionTrigger({
        action: { kind: 'special', trigger: { text: 'When hit' } },
        catalogStatus: 'ready',
      }),
    ).toEqual({ kind: 'authored', text: 'When hit' })
    expect(
      resolveMonsterReactionTrigger({ action: { kind: 'special' }, catalogStatus: 'ready' }),
    ).toEqual({ kind: 'unspecified' })
  })
})
