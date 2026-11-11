import { describe, expect, it } from 'vitest'

import type { MonsterActionDraftRow } from './monster-action-presets'
import {
  formatSpellcastingActionOptionLabel,
  legendarySpellcastingActionOptions,
  sharedCastingOptions,
} from './monster-action-casting-summary'

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

describe('legendary spellcasting action profile', () => {
  it('names the action and summarizes its spells and ability', () => {
    const sections = {
      actions: [
        {
          id: 'spellcasting',
          kind: 'spell' as const,
          name: 'Spellcasting',
          castingAbility: { kind: 'ability' as const, ability: 'int' as const },
          spells: [{ spellId: 'srd:fireball', castAtLevel: 5 }, { spellId: 'srd:mage-hand' }],
        },
        {
          id: 'other',
          kind: 'spell' as const,
          name: 'Spellcasting',
          castingAbility: { kind: 'ability' as const, ability: 'wis' as const },
          spells: [{ spellId: 'srd:command' }],
        },
      ],
    }
    expect(legendarySpellcastingActionOptions(sections)).toEqual([
      { value: 'spellcasting', label: 'Spellcasting · 2 spells · Intelligence · Actions' },
      { value: 'other', label: 'Spellcasting · 1 spell · Wisdom · Actions' },
    ])
    expect(
      formatSpellcastingActionOptionLabel(
        { id: 'only', section: 'actions', ability: 'cha', name: 'Hellfire' },
        [{ id: 'only', section: 'actions', ability: 'cha', name: 'Hellfire' }],
        15,
      ),
    ).toBe('Hellfire · 15 spells · Charisma')
  })
})
