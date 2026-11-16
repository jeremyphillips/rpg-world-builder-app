import { describe, expect, it } from 'vitest'

import type { CreatureSize } from '../../vocab/creature-size'
import { planMonsterFormsRemoval } from '../../content/monster/forms-plan'
import { formatMonsterAlternateForms, formatMonsterShapeShift } from './format-monster-shape-shift'
import { resolveMonsterHitPoints } from './stat-block'

const werebearForms = {
  trueForm: { id: 'humanoid', name: 'Humanoid', appearance: 'humanoid' },
  alternates: [
    {
      id: 'hybrid',
      name: 'Hybrid',
      appearance: 'bear-humanoid hybrid form',
      overrides: { sizes: ['large'] as const },
    },
    {
      id: 'bear',
      name: 'Bear',
      appearance: 'bear',
      overrides: { sizes: ['large'] as const },
    },
  ],
}

describe('formatMonsterShapeShift', () => {
  it('describes size changes, equipment, and a true-form appearance', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'Werebear',
        baseSizes: ['medium', 'small'],
        ...werebearForms,
        equipment: 'unchanged',
      }),
    ).toBe(
      "The werebear shape-shifts into a Large bear-humanoid hybrid form or a Large bear, or it returns to its true humanoid form. Except for the differences noted, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed.",
    )
  })

  it('uses the prerequisite and notes without implying a speed change', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'Vampire',
        baseSizes: ['medium', 'small'],
        trueForm: { id: 'vampire', name: 'Vampire', appearance: 'vampire' },
        alternates: [
          { id: 'bat', name: 'Bat', appearance: 'bat', overrides: { sizes: ['tiny'] } },
          {
            id: 'mist',
            name: 'Mist',
            appearance: 'cloud of mist',
            overrides: { sizes: ['medium'] },
            notes:
              "the vampire can't take any actions or manipulate objects. It is weightless and can enter an enemy's space and stop there.",
          },
        ],
        equipment: 'worn-transforms',
        prerequisite: "the vampire isn't in sunlight or running water",
      }),
    ).toContain(
      "If the vampire isn't in sunlight or running water, it shape-shifts into a Tiny bat or a Medium cloud of mist, or it returns to its true vampire form.",
    )
    expect(
      formatMonsterShapeShift({
        monsterName: 'Vampire',
        baseSizes: ['medium', 'small'],
        trueForm: { id: 'vampire', name: 'Vampire', appearance: 'vampire' },
        alternates: [
          {
            id: 'mist',
            name: 'Mist',
            appearance: 'cloud of mist',
            notes: 'the vampire is weightless.',
          },
        ],
        equipment: 'worn-transforms',
        prerequisite: "the vampire isn't in sunlight or running water",
      }),
    ).toContain('While in mist form, the vampire is weightless.')
  })

  it('states that appearance-only forms share statistics', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'X',
        baseSizes: ['medium'],
        trueForm: { id: 'true', name: 'True' },
        alternates: [{ id: 'y', name: 'Y', appearance: 'Y' }],
        equipment: 'unchanged',
      }),
    ).toBe(
      "The x shape-shifts into a Y, or it returns to its true form. Its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed.",
    )
  })
})

describe('formatMonsterAlternateForms', () => {
  it('lists sizes and notes when no Shape-Shift row exists', () => {
    expect(
      formatMonsterAlternateForms({
        monsterName: 'Werebear',
        baseSizes: ['medium', 'small'],
        ...werebearForms,
      }),
    ).toBe(
      'In addition to its true humanoid form, the werebear can take these forms: a Large bear-humanoid hybrid form and a Large bear. Except for the differences noted, its game statistics are the same in each form.',
    )
  })
})

describe('resolveMonsterHitPoints with alternate sizes', () => {
  it('keeps the Werebear on the Medium hit die', () => {
    const base = {
      sizes: ['medium', 'small'] as CreatureSize[],
      abilityScores: { str: 19, dex: 10, con: 17, int: 11, wis: 12, cha: 12 },
      hitPoints: { kind: 'hit-dice' as const, count: 18 },
    }
    const without = resolveMonsterHitPoints(base)
    const withForms = resolveMonsterHitPoints(base)
    expect(withForms).toEqual(without)
    expect(withForms.status === 'resolved' ? withForms.value.formula : '').toContain('d8')
  })
})

describe('planMonsterFormsRemoval', () => {
  it('deletes Shape-Shift and lists stripped references', () => {
    const plan = planMonsterFormsRemoval({
      forms: werebearForms,
      actions: [
        { id: 'shift', kind: 'shape-shift', prerequisite: 'night', description: '<p>More.</p>' },
        { id: 'bite', kind: 'attack', onlyInFormIds: ['bear'] },
        {
          id: 'multi',
          kind: 'multiattack',
          steps: [{ actionIds: ['shift', 'bite'] }],
        },
      ],
      bonusActions: [],
      reactions: [],
    })
    expect(plan.next.forms).toBeUndefined()
    expect(plan.next.actions.map((row) => row.id)).toEqual(['bite', 'multi'])
    expect(plan.summary.deletedShapeShifts).toEqual([
      expect.objectContaining({ id: 'shift', section: 'actions', hadPrerequisite: true }),
    ])
    expect(plan.summary.strippedReferences.map((row) => row.id)).toEqual(['multi'])
    expect(plan.summary.indirectlyAffectedReferences.map((row) => row.id)).toEqual(['multi'])
    expect(plan.next.actions[1]).toMatchObject({
      steps: [{ actionIds: ['bite'] }],
    })
  })
})
