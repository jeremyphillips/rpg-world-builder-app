import { describe, expect, it } from 'vitest'

import {
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  type Spellcasting,
} from '../../../../content/classes/spellcasting'
import type { Spell } from '../../../../content/spell'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import { resolveRecommendedSpellIdsForChoiceSet } from './resolve-spell-recommendations'

const CLASS_ID = 'srd-cc-5.2.1:bard'
const RULESET = 'srd-cc-5.2.1'

function makeSpell(slug: string, level: number): Spell {
  return {
    id: `${RULESET}:${slug}`,
    slug,
    name: slug,
    level,
    school: 'evocation',
    description: '<p>Test</p>',
    rulesetId: RULESET,
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    classIds: ['bard'],
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true },
  }
}

function resolveForChoiceSet(args: {
  spellcasting: Spellcasting
  suffix: string
  spells: Spell[]
  classLevel?: number
}) {
  return resolveRecommendedSpellIdsForChoiceSet({
    spellcasting: args.spellcasting,
    choiceSetId: spellcastingChoiceSetId(CLASS_ID, args.suffix),
    classId: CLASS_ID,
    classLevel: args.classLevel ?? 1,
    choiceSetOptionIds: args.spells.map((spell) => spell.id),
    catalogSpellsById: new Map(args.spells.map((spell) => [spell.id, spell])),
  })
}

describe('resolveRecommendedSpellIdsForChoiceSet', () => {
  it('returns an empty set when recommendations are absent', () => {
    const result = resolveRecommendedSpellIdsForChoiceSet({
      spellcasting: {
        slotProgressionId: 'full-caster',
        ability: 'cha',
      },
      choiceSetId: spellcastingChoiceSetId(CLASS_ID, CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips),
      classId: CLASS_ID,
      classLevel: 1,
      choiceSetOptionIds: [`${RULESET}:dancing-lights`],
      catalogSpellsById: new Map([[`${RULESET}:dancing-lights`, makeSpell('dancing-lights', 0)]]),
    })

    expect(result).toEqual(new Set())
  })

  it('resolves cantrip recommendations by slug against full catalog ids', () => {
    const spellcasting: Spellcasting = {
      slotProgressionId: 'full-caster',
      ability: 'cha',
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      recommendations: [{ target: 'cantrips', classLevel: 1, spellIds: ['dancing-lights'] }],
    }

    const result = resolveForChoiceSet({
      spellcasting,
      suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips,
      spells: [makeSpell('dancing-lights', 0), makeSpell('vicious-mockery', 0)],
    })

    expect(result).toEqual(new Set([`${RULESET}:dancing-lights`]))
  })

  it('resolves level 1+ recommendations for the prepared choice set', () => {
    const spellcasting: Spellcasting = {
      slotProgressionId: 'full-caster',
      ability: 'wis',
      spellSelection: {
        model: 'prepareFromClassList',
        change: { kind: 'replace', trigger: 'longRest', limit: 'all' },
      },
      recommendations: [
        {
          target: 'level1Plus',
          classLevel: 1,
          spellLevel: 1,
          spellIds: ['bless'],
        },
      ],
    }

    const bless = makeSpell('bless', 1)
    const cure = makeSpell('cure-wounds', 1)
    const result = resolveRecommendedSpellIdsForChoiceSet({
      spellcasting,
      choiceSetId: spellcastingChoiceSetId(CLASS_ID, CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared),
      classId: CLASS_ID,
      classLevel: 1,
      choiceSetOptionIds: [bless.id, cure.id],
      catalogSpellsById: new Map([
        [bless.id, bless],
        [cure.id, cure],
      ]),
    })

    expect(result).toEqual(new Set([bless.id]))
  })

  it('maps learned-collection classes to the spellbook choice set', () => {
    const spellcasting: Spellcasting = {
      slotProgressionId: 'full-caster',
      ability: 'int',
      spellSelection: {
        model: 'prepareFromLearnedCollection',
        collection: 'spellbook',
        acquisition: { curve: { rows: [{ level: 1, count: 6 }] }, extension: 'zero' },
        change: { kind: 'replace', trigger: 'longRest', limit: 'all' },
      },
      recommendations: [
        {
          target: 'level1Plus',
          classLevel: 1,
          spellLevel: 1,
          spellIds: ['magic-missile'],
        },
      ],
    }

    const magicMissile = makeSpell('magic-missile', 1)
    const result = resolveRecommendedSpellIdsForChoiceSet({
      spellcasting,
      choiceSetId: spellcastingChoiceSetId(CLASS_ID, CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook),
      classId: CLASS_ID,
      classLevel: 1,
      choiceSetOptionIds: [magicMissile.id],
      catalogSpellsById: new Map([[magicMissile.id, magicMissile]]),
    })

    expect(result).toEqual(new Set([magicMissile.id]))
  })

  it('filters recommendations by class and spell level constraints', () => {
    const spellcasting: Spellcasting = {
      slotProgressionId: 'full-caster',
      ability: 'cha',
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      recommendations: [
        {
          target: 'level1Plus',
          classLevel: 3,
          spellLevel: 2,
          spellIds: ['invisibility'],
        },
      ],
    }

    const invisibility = makeSpell('invisibility', 2)
    const result = resolveRecommendedSpellIdsForChoiceSet({
      spellcasting,
      choiceSetId: spellcastingChoiceSetId(CLASS_ID, CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire),
      classId: CLASS_ID,
      classLevel: 1,
      choiceSetOptionIds: [invisibility.id],
      catalogSpellsById: new Map([[invisibility.id, invisibility]]),
    })

    expect(result).toEqual(new Set())

    const atLevel = resolveRecommendedSpellIdsForChoiceSet({
      spellcasting,
      choiceSetId: spellcastingChoiceSetId(CLASS_ID, CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire),
      classId: CLASS_ID,
      classLevel: 3,
      choiceSetOptionIds: [invisibility.id],
      catalogSpellsById: new Map([[invisibility.id, invisibility]]),
    })

    expect(atLevel).toEqual(new Set([invisibility.id]))
  })

  it('ignores recommendations for a different choice set', () => {
    const spellcasting: Spellcasting = {
      slotProgressionId: 'full-caster',
      ability: 'cha',
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      recommendations: [{ target: 'cantrips', classLevel: 1, spellIds: ['dancing-lights'] }],
    }

    const result = resolveForChoiceSet({
      spellcasting,
      suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
      spells: [makeSpell('dancing-lights', 0)],
    })

    expect(result).toEqual(new Set())
  })
})
