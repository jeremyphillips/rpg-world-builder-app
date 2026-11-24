import { describe, expect, it } from 'vitest'

import {
  CLASS_PROGRESSION_TABLE_LABEL,
  formatClassSpellcastingFeatureRules,
  formatRestRecoveryClause,
  joinClassSpellcastingFeatureRulesPlainText,
  joinStatBlockProseDocument,
  resolveClassSpellcasting,
  resolveClassSpellcastingRulesFacts,
  resolveCompiledChoiceProgressionQuotaAtLevel,
  resolveSpellsAvailableFromClass,
  type CharacterClass,
} from '@rpg/contracts'

import { getClassBySlug } from './index'
import { loadSeedSpells } from '../spells'
import { resolveIndexedCampaignSpellcastingProgressionConfig } from '../spellcasting-progressions'

const RULESET = 'srd-cc-5.2.1' as const
const CONFIG = resolveIndexedCampaignSpellcastingProgressionConfig(RULESET, undefined)

const CASTERS = [
  'bard',
  'cleric',
  'druid',
  'paladin',
  'ranger',
  'sorcerer',
  'warlock',
  'wizard',
] as const

type CasterSlug = (typeof CASTERS)[number]

function spellsById() {
  return new Map(loadSeedSpells(RULESET).map((spell) => [spell.id, spell]))
}

function casterClass(slug: CasterSlug): CharacterClass {
  return getClassBySlug(RULESET, slug)
}

function rulesInput(slug: CasterSlug, spellMap = spellsById()) {
  return {
    characterClass: casterClass(slug),
    config: CONFIG,
    spellsById: spellMap,
  }
}

function rulesPlainText(slug: CasterSlug, spellMap = spellsById()) {
  return joinClassSpellcastingFeatureRulesPlainText(rulesInput(slug, spellMap))
}

function leadLabels(slug: CasterSlug) {
  const document = formatClassSpellcastingFeatureRules(rulesInput(slug))
  expect(document).not.toBeNull()
  return (document ?? [])
    .map((paragraph) => paragraph[0])
    .filter((node) => node?.kind === 'lead')
    .map((node) => (node?.kind === 'lead' ? node.label : ''))
}

function assertTextQuality(text: string, slug: string) {
  expect(text, slug).not.toMatch(/features table/i)
  expect(text, slug).not.toMatch(/slot level column/i)
  expect(text, slug).not.toMatch(/\bknown\b/i)
  expect(text, slug).not.toMatch(/\brepertoire\b/i)
  expect(text, slug).not.toMatch(/\byou know \d\b/i)
  expect(text, slug).not.toMatch(/\bchoose \d+ (?!\w*spell)/i)
  expect(text, slug).not.toMatch(/reach \w+ levels? \d+, \d+, \d+/i)
}

const EXPECTED_LEAD_ORDER: Record<CasterSlug, string[]> = {
  bard: [
    'Cantrips',
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  cleric: [
    'Cantrips',
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  druid: [
    'Cantrips',
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  sorcerer: [
    'Cantrips',
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  warlock: [
    'Cantrips',
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  wizard: [
    'Cantrips',
    'Spellbook',
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  ranger: [
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
  paladin: [
    'Spell Slots',
    'Prepared Spells of Level 1+',
    'Changing Your Prepared Spells',
    'Spellcasting Ability',
    'Spellcasting Focus',
  ],
}

describe('SRD spellcasting rules fidelity', () => {
  it.each(CASTERS)('%s emits paragraph leads in canonical order', (slug) => {
    expect(leadLabels(slug)).toEqual(EXPECTED_LEAD_ORDER[slug])
    const document = formatClassSpellcastingFeatureRules(rulesInput(slug))
    expect(
      document?.every(
        (paragraph) => paragraph[0]?.kind !== 'lead' || paragraph[0].treatment === 'paragraph',
      ),
    ).toBe(true)
  })

  it.each(CASTERS)('%s passes generated text quality guards', (slug) => {
    const text = rulesPlainText(slug)
    expect(text).toBeTruthy()
    assertTextQuality(text!, slug)
    expect(text).toContain(CLASS_PROGRESSION_TABLE_LABEL)
    expect(text).toContain('always have prepared')
  })

  it.each(CASTERS)('%s matches slot recovery from progression config', (slug) => {
    const text = rulesPlainText(slug)!
    const resolved = resolveClassSpellcasting(casterClass(slug), CONFIG)
    expect(resolved).toBeTruthy()
    expect(text).toContain(formatRestRecoveryClause(resolved!.slotProgression.recovery))
  })

  it('cleric and wizard use long rest prepared change policies in text', () => {
    expect(rulesPlainText('cleric')).toContain('finish a Long Rest')
    expect(rulesPlainText('cleric')).toContain('change your list of prepared spells')
    expect(rulesPlainText('wizard')).toContain('finish a Long Rest')
    expect(rulesPlainText('wizard')).toContain('spells from your spellbook')
  })

  it('bard and warlock use level gain prepared and cantrip change copy', () => {
    expect(rulesPlainText('bard')).toMatch(/gain a Bard level.*replace one spell/)
    expect(rulesPlainText('bard')).toMatch(/gain a Bard level.*replace one of your cantrips/)
    expect(rulesPlainText('warlock')).toMatch(/gain a Warlock level.*replace one spell/)
  })

  it('focus noun phrases reflect authored focusKinds', () => {
    expect(rulesPlainText('bard')?.toLowerCase()).toContain('musical instrument')
    expect(rulesPlainText('ranger')?.toLowerCase()).toContain('druidic focus')
    expect(rulesPlainText('wizard')?.toLowerCase()).toContain('your spellbook')
    expect(rulesPlainText('cleric')?.toLowerCase()).toContain('holy symbol')
  })

  it('recommendation spell names match catalog names when ids resolve', () => {
    const spellMap = spellsById()
    const bard = casterClass('bard')
    const facts = resolveClassSpellcastingRulesFacts({
      characterClass: bard,
      config: CONFIG,
      spellsById: spellMap,
    })
    const cantripIds = facts?.cantrips?.recommendationSpellIds ?? []
    expect(cantripIds.length).toBeGreaterThan(0)
    const text = joinStatBlockProseDocument(
      formatClassSpellcastingFeatureRules(rulesInput('bard')) ?? [],
    )
    for (const id of cantripIds) {
      const name = spellMap.get(id)?.name
      expect(name).toBeTruthy()
      expect(text).toContain(name)
    }
  })

  it('omits recommendation names when spell ids are missing but keeps mechanics', () => {
    const text = rulesPlainText('bard', new Map())!
    expect(text.toLowerCase()).toContain('you know two bard cantrips')
    expect(text).not.toContain('Dancing Lights')
  })

  it('ranger prepared quota matches spells available at level 1 and 5', () => {
    const ranger = casterClass('ranger')
    const resolved = resolveClassSpellcasting(ranger, CONFIG)
    expect(resolved).toBeTruthy()
    const prepared = resolved!.choiceProgressions.find((p) => p.destination === 'prepared')
    expect(prepared).toBeTruthy()
    expect(resolveCompiledChoiceProgressionQuotaAtLevel(prepared!, 1)).toBe(2)
    expect(resolveCompiledChoiceProgressionQuotaAtLevel(prepared!, 5)).toBe(6)
    expect(resolveSpellsAvailableFromClass(resolved!, 1)).toBe(2)
    expect(resolveSpellsAvailableFromClass(resolved!, 5)).toBe(6)
  })

  it('wizard generated rules omit spellbook acquisition sidebar (deferred gap)', () => {
    const text = rulesPlainText('wizard')!
    expect(text).not.toContain('50 GP')
    expect(text).not.toContain('Expanding and Replacing')
    expect(text).not.toContain('Tiny object')
  })

  it.each(CASTERS)('%s plain-text rules snapshot', (slug) => {
    expect(rulesPlainText(slug)).toMatchSnapshot()
  })
})
