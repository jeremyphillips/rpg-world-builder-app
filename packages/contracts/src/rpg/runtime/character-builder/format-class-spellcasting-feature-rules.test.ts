import { describe, expect, it } from 'vitest'

import { spellcastingSchema, type CharacterClass } from '@rpg/contracts'
import { CLASS_PROGRESSION_TABLE_LABEL } from '../../content/classes/class-progression-table'
import { formatRestRecoveryClause } from '../../primitives/rest-recovery'
import { joinStatBlockProseDocument } from '../prose/stat-block-prose'
import { spellcastingProgressionTestConfig } from '../../campaign/rules/spellcasting-progression/fixtures'
import { CLASS_SPELLCASTING_RULES_LEADS } from './spellcasting-rules/class-spellcasting-rules-copy'
import {
  formatClassSpellcastingFeatureRules,
  joinClassSpellcastingFeatureRulesPlainText,
} from './format-class-spellcasting-feature-rules'
import { rangerClass } from './spellcasting-test-fixtures'

const spellcastingGrantFeature = (level: number) => ({
  kind: 'spellcasting' as const,
  id: 'spellcasting',
  name: 'Spellcasting',
  level,
})

const bardSpellcasting = spellcastingSchema.parse({
  slotProgressionId: 'full-caster',
  ability: 'cha',
  focusKinds: ['musical_instrument'],
  cantripSelection: {
    change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
  },
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
  it('emits paragraph leads and Class Progression table references for Bard', () => {
    const text = joinClassSpellcastingFeatureRulesPlainText({
      characterClass: bardClass(),
      config: spellcastingProgressionTestConfig,
    })

    expect(text).toContain(`${CLASS_SPELLCASTING_RULES_LEADS.cantrips}:`)
    expect(text).toContain(`${CLASS_SPELLCASTING_RULES_LEADS.spellSlots}:`)
    expect(text).toContain(`${CLASS_SPELLCASTING_RULES_LEADS.preparedSpells}:`)
    expect(text).toContain(CLASS_PROGRESSION_TABLE_LABEL)
    expect(text).not.toContain('Features table')
    expect(text).toContain(formatRestRecoveryClause({ minimumRest: 'long' }))
    expect(text?.toLowerCase()).toContain('musical instrument')
  })

  it('covers half-caster prepared rules without cantrips', () => {
    const text = joinClassSpellcastingFeatureRulesPlainText({
      characterClass: rangerClass,
      config: spellcastingProgressionTestConfig,
    })

    expect(text).toContain('Prepared Spells of Level 1+')
    expect(text?.toLowerCase()).toContain('druidic focus')
    expect(text).not.toContain('Cantrips:')
  })

  it('renders mechanics without spell names when spellsById is omitted', () => {
    const text = joinClassSpellcastingFeatureRulesPlainText({
      characterClass: bardClass(),
      config: spellcastingProgressionTestConfig,
    })
    expect(text?.toLowerCase()).toContain('you know two bard cantrips')
    expect(text).not.toContain('Dancing Lights')
  })

  it('returns structured prose with paragraph treatment on leads', () => {
    const document = formatClassSpellcastingFeatureRules({
      characterClass: bardClass(),
      config: spellcastingProgressionTestConfig,
    })
    expect(document?.some((paragraph) => paragraph[0]?.kind === 'lead')).toBe(true)
    expect(
      document?.every(
        (paragraph) => paragraph[0]?.kind !== 'lead' || paragraph[0].treatment === 'paragraph',
      ),
    ).toBe(true)
    expect(joinStatBlockProseDocument(document ?? []).toLowerCase()).toContain(
      'you know two bard cantrips',
    )
  })
})
