import { describe, expect, it } from 'vitest'

import { MONSTER_ACTION_KINDS } from '../../vocab/monster-action-kind'
import { monsterActionAuthoring, type MonsterActionAuthoring } from './monster-action-authoring'

const DERIVED_VOCABULARY: MonsterActionAuthoring = {
  name: 'derived',
  description: 'generated',
  source: 'vocabulary',
}

const NO_PRESET_EXPECTED: Record<string, MonsterActionAuthoring> = {
  weapon: { name: 'derived', description: 'generated', source: 'equipment' },
  'natural-weapon': { name: 'authored', description: 'generated', source: 'none' },
  attack: { name: 'authored', description: 'generated', source: 'none' },
  save: { name: 'authored', description: 'generated', source: 'none' },
  multiattack: DERIVED_VOCABULARY,
  'action-reference': { name: 'authored', description: 'generated', source: 'none' },
  parry: { name: 'authored', description: 'generated', source: 'none' },
  leap: { name: 'authored', description: 'generated', source: 'none' },
  teleport: { name: 'authored', description: 'generated', source: 'none' },
  'take-actions': { name: 'authored', description: 'generated', source: 'none' },
  'shape-shift': { name: 'authored', description: 'authored', source: 'none' },
  special: { name: 'authored', description: 'authored', source: 'none' },
  spell: { name: 'authored', description: 'generated', source: 'none' },
}

describe('monsterActionAuthoring', () => {
  it('assigns explicit policy for every MONSTER_ACTION_KIND (no preset)', () => {
    for (const kind of MONSTER_ACTION_KINDS) {
      expect(monsterActionAuthoring({ kind }), `kind ${kind}`).toEqual(NO_PRESET_EXPECTED[kind])
    }
  })

  it('keeps preset-derived vocabulary for natural weapons and saves', () => {
    expect(monsterActionAuthoring({ kind: 'natural-weapon', preset: 'bite' })).toEqual(
      DERIVED_VOCABULARY,
    )
    expect(monsterActionAuthoring({ kind: 'save', preset: 'breath-weapon' })).toEqual(
      DERIVED_VOCABULARY,
    )
  })
})
