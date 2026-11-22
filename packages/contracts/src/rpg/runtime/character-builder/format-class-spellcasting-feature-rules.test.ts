import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestConfig } from '../../campaign/rules/spellcasting-progression/fixtures'
import {
  formatCantripAcquisitionCopy,
  formatSpellAcquisitionCopy,
  joinClassSpellcastingFeatureRulesPlainText,
  resolveClassCantripCount,
  resolveClassSpellcasting,
  resolveCompiledChoiceProgressionQuotaAtLevel,
  findCompiledChoiceProgressionBySuffix,
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  spellcastingSchema,
  type CharacterClass,
} from '@rpg/contracts'

const spellcastingGrantFeature = (level: number) => ({
  kind: 'custom' as const,
  id: 'spellcasting',
  name: 'Spellcasting',
  level,
  grantGroups: [{ grants: [{ id: 'spellcasting-1', kind: 'spellcasting' as const }] }],
})

const bardSpellcasting = spellcastingSchema.parse({
  slotProgressionId: 'full-caster',
  ability: 'cha',
  focusKinds: ['holy_symbol'],
  spellSelection: {
    model: 'limitedRepertoire',
    change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
  },
  progression: {
    cantrips: {
      curve: {
        rows: [
          { level: 1, count: 2 },
          { level: 4, count: 3 },
        ],
      },
      extension: 'carryForward',
    },
    repertoire: {
      curve: { rows: [{ level: 1, count: 4 }] },
      extension: 'carryForward',
    },
  },
})

const pactSpellcasting = spellcastingSchema.parse({
  slotProgressionId: 'pact-magic',
  ability: 'cha',
  spellSelection: {
    model: 'limitedRepertoire',
    change: { kind: 'replace', trigger: 'longRest', limit: 1 },
  },
  progression: {
    cantrips: {
      curve: { rows: [{ level: 1, count: 2 }] },
      extension: 'carryForward',
    },
    repertoire: {
      curve: { rows: [{ level: 1, count: 2 }] },
      extension: 'carryForward',
    },
  },
})

function bardClass(): CharacterClass {
  return {
    id: 'test:bard',
    rulesetId: 'srd-cc-5.2.1',
    catalogLayer: 'system',
    status: 'published',
    campaignId: null,
    slug: 'bard',
    name: 'Bard',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    primaryAbilities: ['cha'],
    hitDie: 8,
    proficiencies: {
      savingThrows: ['dex', 'cha'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
      skills: { choose: 2, from: [] },
    },
    features: [spellcastingGrantFeature(1)],
    spellcasting: bardSpellcasting,
  } as CharacterClass
}

describe('formatClassSpellcastingFeatureRules', () => {
  it('matches bard activation quotas and limited repertoire copy', () => {
    const bard = bardClass()
    const resolved = resolveClassSpellcasting(bard, spellcastingProgressionTestConfig)!
    const repertoire = findCompiledChoiceProgressionBySuffix(
      resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
      'capacity',
    )!

    const text = joinClassSpellcastingFeatureRulesPlainText({
      characterClass: bard,
      config: spellcastingProgressionTestConfig,
    })

    expect(text).toContain(
      formatCantripAcquisitionCopy(
        bard.name,
        resolveClassCantripCount({ source: bard, classLevel: 1 }),
        true,
      ).lead,
    )
    expect(text).toContain(
      formatSpellAcquisitionCopy({
        spellSelection: bard.spellcasting?.spellSelection,
        className: bard.name,
        max: resolveCompiledChoiceProgressionQuotaAtLevel(repertoire, 1),
        requiredToComplete: true,
        destination: 'classList',
      }).lead,
    )
    expect(text).toContain('Holy Symbol')
  })

  it('does not emit slot recovery for pact magic', () => {
    const warlock = {
      ...bardClass(),
      name: 'Warlock',
      spellcasting: pactSpellcasting,
    }

    const text = joinClassSpellcastingFeatureRulesPlainText({
      characterClass: warlock,
      config: spellcastingProgressionTestConfig,
    })

    expect(text).toBeTruthy()
    expect(text?.toLowerCase()).not.toContain('regain')
    expect(text?.toLowerCase()).not.toMatch(/finish a (short|long) rest/)
  })
})
