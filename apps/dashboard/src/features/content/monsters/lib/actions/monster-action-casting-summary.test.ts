import { describe, expect, it } from 'vitest'

import type { MonsterActionDraftRow } from './monster-action-presets'
import { sharedCastingOptions } from './monster-action-casting-summary'

function spell(row: MonsterActionDraftRow): MonsterActionDraftRow {
  return row
}

describe('monster action casting summary', () => {
  const sections = {
    actions: [
      spell({
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [],
      }),
      spell({
        id: 'other',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'wis' },
        spells: [],
      }),
    ],
    bonusActions: [
      spell({
        id: 'misty',
        kind: 'spell',
        name: 'Misty Step',
        castingAbility: { kind: 'shared', entryId: 'spellcasting' },
        spells: [],
      }),
    ],
    reactions: [
      spell({
        id: 'burst',
        kind: 'attack',
        name: 'Arcane Burst',
        bonusSource: {
          kind: 'spell',
          castingAbility: { kind: 'shared', entryId: 'missing' },
        },
      } as MonsterActionDraftRow),
    ],
  }

  it('disambiguates duplicate source names by section', () => {
    expect(sharedCastingOptions(sections, 'misty').map((option) => option.label)).toEqual([
      'Spellcasting (Intelligence) · Actions',
      'Spellcasting (Wisdom) · Actions',
    ])
  })

  it('follows an ability change on the source without copying it onto the dependent', () => {
    const changed = {
      ...sections,
      actions: [
        {
          ...sections.actions[0]!,
          castingAbility: { kind: 'ability' as const, ability: 'wis' as const },
        },
        sections.actions[1]!,
      ],
    }
    expect(sharedCastingOptions(changed, 'misty').map((option) => option.label)).toContain(
      'Spellcasting (Wisdom) · Actions',
    )
    const bonusSpell = changed.bonusActions?.[0]
    expect(bonusSpell?.kind === 'spell' ? bonusSpell.castingAbility : undefined).toEqual({
      kind: 'shared',
      entryId: 'spellcasting',
    })
  })
})
