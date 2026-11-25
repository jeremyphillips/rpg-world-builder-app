import { describe, expect, it } from 'vitest'

import type { CreatureFormsDraft } from '../../content/creature/forms'
import type { CreatureSize } from '../../vocab/creature-size'
import {
  planMonsterDefinedFormRemoval,
  planMonsterFormsRemoval,
  planMonsterTrueFormDesignation,
} from '../../content/monster/forms-plan'
import { analyzeCreatureFormDifferences } from '../creature/form-differences'
import { formatMonsterFormQualifier } from './format-monster-form-qualifier'
import { formatMonsterForms, formatMonsterShapeShift } from './format-monster-shape-shift'
import { formatMonsterQualifiedHeading } from './spell-entry-presentation'
import { RECHARGE_ACTIONS } from '../../content/monster/test-fixtures'
import { formatMonsterSpeedStatRow } from './format-monster-speed-stat-row'
import { formatFormSpeechQualifier } from './format-form-speech'
import { formatCreatureCommunication } from '../creature/communication'
import { resolveMonsterHitPoints } from './stat-block'

const werebearForms: CreatureFormsDraft = {
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
      overrides: {
        sizes: ['large' as const],
        movement: { speeds: { walk: 40, climb: 30 } },
        canSpeak: false as const,
      },
    },
  ],
}

const werebearBase = {
  monsterName: 'Werebear',
  baseSizes: ['medium', 'small'] as CreatureSize[],
  sizes: ['medium', 'small'] as CreatureSize[],
  baseMovement: { walk: 30 },
}

describe('formatMonsterShapeShift', () => {
  it('describes size changes, equipment, and a true-form appearance', () => {
    expect(
      formatMonsterShapeShift({
        ...werebearBase,
        forms: werebearForms,
        equipment: 'unchanged',
        hasShapeShift: true,
      }),
    ).toBe(
      "The werebear shape-shifts into a Large bear-humanoid hybrid or a Large bear, or it returns to its true humanoid form. Except for the differences noted, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed.",
    )
  })

  it('uses the prerequisite, description-mode speech, and notes', () => {
    const text = formatMonsterShapeShift({
      monsterName: 'Vampire',
      baseSizes: ['medium', 'small'],
      baseMovement: { walk: 40, climb: 40 },
      forms: {
        profileFormId: 'vampire-profile',
        trueForm: { kind: 'profile' },
        differencesPresentation: 'transformation-description',
        definedForms: [
          {
            id: 'bat',
            name: 'Bat',
            overrides: {
              sizes: ['tiny'],
              movement: { speeds: { walk: 5, fly: 30 } },
              canSpeak: false as const,
            },
          },
          {
            id: 'mist',
            name: 'Cloud of mist',
            overrides: {
              sizes: ['medium'],
              movement: { speeds: { walk: 5, fly: 20 }, hover: true },
              canSpeak: false as const,
            },
            notes:
              "the vampire can't take any actions or manipulate objects. It is weightless and can enter an enemy's space and stop there.",
          },
        ],
      },
      equipment: 'worn-transforms',
      prerequisite: "the vampire isn't in sunlight or running water",
      hasShapeShift: true,
    })
    expect(text).toContain(
      "If the vampire isn't in sunlight or running water, it shape-shifts into a Tiny bat (Walk 5 ft., Fly 30 ft.) or a Medium cloud of mist (Walk 5 ft., Fly 20 ft. [hover])",
    )
    expect(text).toContain("While in bat or cloud of mist form, the vampire can't speak.")
    expect(text).toContain('Anything it is wearing transforms with it.')
    expect(text).toContain('While in cloud of mist form, the vampire')
  })

  it('uses a profile override and supports Small-or-Medium destinations', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'X',
        baseSizes: ['medium'],
        baseMovement: { walk: 20 },
        forms: {
          profileFormId: 'profile',
          trueForm: { kind: 'profile', name: 'Blob' },
          definedForms: [
            { id: 'object', name: 'Object', overrides: { sizes: ['small', 'medium'] } },
          ],
        },
        equipment: 'unchanged',
        hasShapeShift: true,
      }),
    ).toBe(
      "The x shape-shifts into a Small or Medium object, or it returns to its true blob form. Except for the differences noted, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed.",
    )
  })

  it('notes differences when the only change is a form restriction', () => {
    expect(
      formatMonsterShapeShift({
        monsterName: 'X',
        baseSizes: ['medium'],
        baseMovement: { walk: 30 },
        forms: {
          profileFormId: 'profile',
          trueForm: { kind: 'profile' },
          definedForms: [{ id: 'twin', name: 'Twin' }],
        },
        equipment: 'unchanged',
        hasShapeShift: true,
        hasFormRestrictions: true,
      }),
    ).toContain('Except for the differences noted, its game statistics are the same in each form.')
  })

  it('prints the succubus fly-only-true-form sentence in description mode', () => {
    const text = formatMonsterShapeShift({
      monsterName: 'Succubus',
      baseSizes: ['medium'],
      baseMovement: { walk: 30, fly: 60 },
      forms: {
        profileFormId: 'succubus-profile',
        trueForm: { kind: 'profile' },
        differencesPresentation: 'transformation-description',
        definedForms: [
          {
            id: 'humanoid',
            name: 'Humanoid',
            overrides: { sizes: ['medium', 'small'], movement: { speeds: { walk: 30 } } },
          },
        ],
      },
      equipment: 'unchanged',
      hasShapeShift: true,
    })
    expect(text).toContain('Its Fly Speed is available only in its true form.')
  })
})

describe('qualified stat rows', () => {
  it('formats Werebear speed and language qualifiers', () => {
    expect(
      formatMonsterSpeedStatRow({
        monsterName: werebearBase.monsterName,
        sizes: werebearBase.sizes,
        movement: werebearBase.baseMovement,
        forms: werebearForms,
        hasShapeShift: true,
      }),
    ).toBe('Walk 30 ft., 40 ft. (bear form only), Climb 30 ft. (bear form only)')
    expect(
      formatFormSpeechQualifier(
        analyzeSilentForms(werebearForms, werebearBase.monsterName, werebearBase.baseSizes, {
          walk: 30,
        }),
      ),
    ).toBe("(can't speak in bear form)")
  })

  it('leaves Wererat speed unqualified when movement is shared', () => {
    const forms: CreatureFormsDraft = {
      profileFormId: 'profile',
      trueForm: { kind: 'defined', formId: 'humanoid' },
      definedForms: [
        { id: 'humanoid', name: 'Humanoid' },
        {
          id: 'rat',
          name: 'Rat',
          overrides: { sizes: ['small'], canSpeak: false },
        },
      ],
    }
    expect(
      formatMonsterSpeedStatRow({
        monsterName: 'Wererat',
        sizes: ['medium', 'small'],
        movement: { walk: 30, climb: 30 },
        forms,
        hasShapeShift: true,
      }),
    ).toBe('Walk 30 ft., Climb 30 ft.')
  })

  it('prints an unresolved movement alternative on the speed row', () => {
    expect(
      formatMonsterSpeedStatRow({
        monsterName: 'Swarm of Insects',
        sizes: ['medium'],
        movement: { walk: 20 },
        movementAlternative: { modes: ['climb', 'fly'], feet: 20 },
        forms: {
          profileFormId: 'profile',
          trueForm: { kind: 'profile' },
          definedForms: [],
        },
        hasShapeShift: false,
      }),
    ).toBe("20 ft., Fly or Climb 20 ft. (GM's choice)")
  })

  it('falls back to stat rows when Shape-Shift is missing', () => {
    expect(
      formatMonsterSpeedStatRow({
        monsterName: werebearBase.monsterName,
        sizes: werebearBase.sizes,
        movement: werebearBase.baseMovement,
        forms: werebearForms,
        hasShapeShift: false,
      }),
    ).toBe('Walk 30 ft., 40 ft. (bear form only), Climb 30 ft. (bear form only)')
  })
})

function analyzeSilentForms(
  forms: CreatureFormsDraft,
  monsterName: string,
  sizes: CreatureSize[],
  movement: Record<string, number>,
): readonly string[] {
  return (
    analyzeCreatureFormDifferences({
      forms,
      monsterName,
      sizes,
      movement,
    })?.silentFormNames ?? []
  )
}

describe('formatCreatureCommunication speech qualifier', () => {
  it('appends a speech qualifier after spoken languages', () => {
    expect(
      formatCreatureCommunication(
        {
          languages: [{ language: 'common' }],
          speechQualifier: "(can't speak in bear form)",
        },
        { formatLanguageLabel: (id) => (id === 'common' ? 'Common' : id) },
      ),
    ).toBe("Common (can't speak in bear form)")
  })
})

describe('formatMonsterForms', () => {
  it('lists sizes and notes when no Shape-Shift row exists', () => {
    expect(
      formatMonsterForms({
        ...werebearBase,
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

  it('strips one form without broadening the row and lists indirect references', () => {
    const plan = planMonsterDefinedFormRemoval(
      {
        forms: werebearForms,
        actions: [
          { id: 'rend', name: 'Rend', onlyInFormIds: ['bear', 'hybrid'] },
          { id: 'bite', name: 'Bite', onlyInFormIds: ['bear'] },
          {
            id: 'multi',
            name: 'Multiattack',
            kind: 'multiattack',
            steps: [{ actionIds: ['bite'] }],
          },
        ],
      },
      'bear',
    )
    expect(plan?.next.actions?.[0]?.onlyInFormIds).toEqual(['hybrid'])
    expect(plan?.next.actions?.[1]?.onlyInFormIds).toEqual([])
    expect(plan?.summary.rowsLosingForm).toEqual([
      { id: 'rend', name: 'Rend', remainingFormNames: ['Bear-humanoid hybrid'] },
      { id: 'bite', name: 'Bite', remainingFormNames: [] },
    ])
    expect(plan?.summary.indirectlyAffectedReferences).toEqual([
      { id: 'multi', name: 'Multiattack' },
    ])
  })
})

describe('formatMonsterFormQualifier', () => {
  it('keeps stored name order and composes with limited use', () => {
    expect(formatMonsterFormQualifier(['Bear', 'Bear-humanoid hybrid'])).toBe(
      'Bear or Bear-humanoid hybrid Form Only',
    )
    expect(formatMonsterFormQualifier(['Object'])).toBe('Object Form Only')
    expect(formatMonsterFormQualifier([])).toBeUndefined()
    expect(
      formatMonsterQualifiedHeading('Multiattack', {
        limitedUse: RECHARGE_ACTIONS[1]?.limitedUse,
        formQualifier: 'Vampire Form Only',
      }),
    ).toBe('Multiattack (Recharge 5–6; Vampire Form Only)')
    expect(
      formatMonsterQualifiedHeading('Bite', { formQualifier: 'Bat or Vampire Form Only' }),
    ).toBe('Bite (Bat or Vampire Form Only)')
  })
})
