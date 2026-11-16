import { describe, expect, it } from 'vitest'

import type { CreatureSize } from '../../vocab/creature-size'
import {
  planMonsterDefinedFormRemoval,
  planMonsterFormsRemoval,
  planMonsterTrueFormDesignation,
} from '../../content/monster/forms-plan'
import { formatMonsterForms, formatMonsterShapeShift } from './format-monster-shape-shift'
import { resolveMonsterHitPoints } from './stat-block'

const werebearForms = {
  profileFormId: 'werebear-profile',
  trueForm: { kind: 'defined' as const, formId: 'humanoid' },
  definedForms: [
    { id: 'humanoid', name: 'Humanoid', overrides: {} },
    {
      id: 'hybrid',
      name: 'Bear-humanoid hybrid',
      overrides: { sizes: ['large' as const] },
    },
    {
      id: 'bear',
      name: 'Bear',
      overrides: { sizes: ['large' as const] },
    },
  ],
}

describe('formatMonsterShapeShift', () => {
  it('describes size changes, equipment, and a true-form appearance', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'Werebear',
        baseSizes: ['medium', 'small'],
        forms: werebearForms,
        equipment: 'unchanged',
      }),
    ).toBe(
      "The werebear shape-shifts into a Large bear-humanoid hybrid or a Large bear, or it returns to its true humanoid form. Except for the differences noted, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed.",
    )
  })

  it('uses the prerequisite and notes without implying a speed change', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'Vampire',
        baseSizes: ['medium', 'small'],
        forms: {
          profileFormId: 'vampire-profile',
          trueForm: { kind: 'profile' },
          definedForms: [
            { id: 'bat', name: 'Bat', overrides: { sizes: ['tiny'] } },
            {
              id: 'mist',
              name: 'Cloud of mist',
              overrides: { sizes: ['medium'] },
              notes:
                "the vampire can't take any actions or manipulate objects. It is weightless and can enter an enemy's space and stop there.",
            },
          ],
        },
        equipment: 'worn-transforms',
        prerequisite: "the vampire isn't in sunlight or running water",
      }),
    ).toContain(
      "If the vampire isn't in sunlight or running water, it shape-shifts into a Tiny bat or a Medium cloud of mist, or it returns to its true form.",
    )
    expect(
      formatMonsterShapeShift({
        monsterName: 'Vampire',
        baseSizes: ['medium', 'small'],
        forms: {
          profileFormId: 'vampire-profile',
          trueForm: { kind: 'profile' },
          definedForms: [
            {
              id: 'mist',
              name: 'Mist',
              notes: 'the vampire is weightless.',
            },
          ],
        },
        equipment: 'worn-transforms',
        prerequisite: "the vampire isn't in sunlight or running water",
      }),
    ).toContain('While in mist form, the vampire is weightless.')
  })

  it('uses a profile override and supports Small-or-Medium destinations', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'X',
        baseSizes: ['medium'],
        forms: {
          profileFormId: 'profile',
          trueForm: { kind: 'profile', name: 'Blob' },
          definedForms: [
            { id: 'object', name: 'Object', overrides: { sizes: ['small', 'medium'] } },
          ],
        },
        equipment: 'unchanged',
      }),
    ).toBe(
      "The x shape-shifts into a Small or Medium object, or it returns to its true blob form. Except for the differences noted, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed.",
    )
  })
})

describe('formatMonsterForms', () => {
  it('lists sizes and notes when no Shape-Shift row exists', () => {
    expect(
      formatMonsterForms({
        monsterName: 'Werebear',
        baseSizes: ['medium', 'small'],
        forms: werebearForms,
      }),
    ).toBe(
      'In addition to its true humanoid form, the werebear can take these forms: a Large bear-humanoid hybrid and a Large bear. Except for the differences noted, its game statistics are the same in each form.',
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

  it('cleans profile references and target overrides when designation changes', () => {
    const plan = planMonsterTrueFormDesignation(
      {
        forms: {
          profileFormId: 'profile',
          trueForm: { kind: 'profile', name: 'Blob' },
          definedForms: [
            { id: 'object', name: 'Object', overrides: { sizes: ['small'] } },
            { id: 'mist', name: 'Mist' },
          ],
        },
        actions: [
          { id: 'slam', name: 'Slam', onlyInFormIds: ['profile', 'object'] },
          {
            id: 'multi',
            name: 'Multiattack',
            kind: 'multiattack',
            steps: [{ actionIds: ['slam'] }],
          },
        ],
      },
      { kind: 'defined', formId: 'object' },
    )
    expect(plan.next.forms.trueForm).toEqual({ kind: 'defined', formId: 'object' })
    expect(plan.next.forms.definedForms[0]?.overrides).toEqual({})
    expect(plan.next.actions?.[0]?.onlyInFormIds).toEqual(['object'])
    expect(plan.summary.removedProfileName).toBe(true)
    expect(plan.summary.indirectlyAffectedReferences).toEqual([
      { id: 'multi', name: 'Multiattack' },
    ])
  })

  it('removes a designated form, preserves empty restrictions, and returns to profile', () => {
    const plan = planMonsterDefinedFormRemoval(
      {
        forms: werebearForms,
        actions: [{ id: 'bite', onlyInFormIds: ['humanoid'] }],
      },
      'humanoid',
    )
    expect(plan?.next.forms.trueForm).toEqual({ kind: 'profile' })
    expect(plan?.next.actions?.[0]?.onlyInFormIds).toEqual([])
    expect(plan?.summary.wasTrueForm).toBe(true)
  })
})
