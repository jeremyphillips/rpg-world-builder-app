import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  acquisitionStateForItem,
  collectRepeatabilityViolations,
  MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE,
  MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
  MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
  monsterSingletonKindMessage,
} from '../monster/action'
import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import {
  MONSTER_SPELLCASTING_ACTION_NAME,
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
  PRIMARY_SPELLCASTING_PROFILE,
} from './spell-casting-source'
import { BITE_ACTION, MONSTER_TEST_INPUT } from './test-fixtures'

const seedMonsters = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../../catalog/src/monsters/data/srd-cc-5.2.1/monsters.json',
    ),
    'utf8',
  ),
) as unknown[]

describe('monster action repeatability', () => {
  it('rejects duplicate singleton kinds and unique-by-source rows on publish', () => {
    const violations = collectRepeatabilityViolations({
      actions: [
        { id: 'ma', kind: 'multiattack' },
        { id: 'ma2', kind: 'multiattack' },
        { id: 'w1', kind: 'weapon', equipmentEntryId: 'sword' },
        { id: 'w2', kind: 'weapon', equipmentEntryId: 'sword' },
        { id: 'n1', kind: 'natural-weapon', form: 'bite' },
        { id: 'n2', kind: 'natural-weapon', form: 'bite' },
        { id: 'c1', kind: 'save', preset: 'constrict' },
        { id: 'c2', kind: 'save', preset: 'constrict' },
      ],
      bonusActions: [
        { id: 'l1', kind: 'leap' },
        { id: 'l2', kind: 'leap' },
      ],
      reactions: [
        { id: 'p1', kind: 'parry' },
        { id: 'p2', kind: 'parry' },
      ],
    })
    expect(violations.map((v) => v.message)).toEqual(
      expect.arrayContaining([
        monsterSingletonKindMessage('multiattack'),
        monsterSingletonKindMessage('leap'),
        monsterSingletonKindMessage('parry'),
        MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE,
        MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
        MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
      ]),
    )
  })

  it('does not flag repeatable attack rows or duplicate natural weapons without form', () => {
    const clawAttack = {
      id: 'claw',
      kind: 'attack',
      modes: ['melee'],
      reach: 5,
      damage: { dice: { count: 1, faces: 6 } },
      damageType: 'slashing',
      bonusSource: { kind: 'ability', ability: 'str', proficient: true },
    }
    const hookWeapon = {
      id: 'claw2',
      kind: 'natural-weapon',
      mode: 'melee',
      damage: { dice: { count: 1, faces: 6 } },
      damageType: 'piercing',
    }
    const violations = collectRepeatabilityViolations({
      actions: [
        BITE_ACTION,
        clawAttack,
        hookWeapon,
        { id: 'br1', kind: 'save', preset: 'breath-weapon' },
        { id: 'br2', kind: 'save', preset: 'breath-weapon' },
      ],
    })
    expect(violations).toEqual([])
  })

  it('reports acquisition parity for spellcasting, multiattack, and natural form', () => {
    const sections = {
      actions: [
        {
          id: 'spell',
          kind: 'spell',
          profile: PRIMARY_SPELLCASTING_PROFILE,
          name: MONSTER_SPELLCASTING_ACTION_NAME,
          castingAbility: { kind: 'ability', ability: 'int' },
          spells: [{ spellId: 'srd:fire-bolt' }],
        },
        { id: 'ma', kind: 'multiattack' },
        { id: 'bite', kind: 'natural-weapon', form: 'bite' },
      ],
      bonusActions: [{ id: 'leap', kind: 'leap' }],
      reactions: [{ id: 'parry', kind: 'parry' }],
      legendaryActions: { actions: [] },
    }
    expect(acquisitionStateForItem('create:spell', sections)).toEqual({
      disabled: true,
      note: PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
    })
    expect(acquisitionStateForItem('preset:multiattack', sections).disabled).toBe(true)
    expect(
      acquisitionStateForItem('create:leap', sections, { section: 'bonusActions' }).disabled,
    ).toBe(true)
    expect(
      acquisitionStateForItem('create:teleport', sections, { section: 'actions' }).disabled,
    ).toBe(undefined)
    expect(acquisitionStateForItem('reaction:parry', sections).disabled).toBe(true)
    expect(acquisitionStateForItem('natural:bite', sections)).toEqual({
      disabled: true,
      note: MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
    })
  })

  it('skips repeatability violations in draft schema', () => {
    const draft = createMonsterDraftInputSchema.safeParse({
      ...MONSTER_TEST_INPUT,
      actions: [
        { id: 'ma', kind: 'multiattack' },
        { id: 'ma2', kind: 'multiattack' },
      ],
    })
    expect(draft.success).toBe(true)
  })

  it('validates seeded SRD monsters on publish', () => {
    for (const monster of seedMonsters) {
      const parsed = createMonsterInputSchema.safeParse(monster)
      expect(parsed.success).toBe(true)
    }
  })
})
