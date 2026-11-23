import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'
import {
  formatClassSpellcastingFeatureRules,
  isClassSpellcastingGrantingFeature,
} from '@rpg/contracts'
import { resolveDisplayBlocks } from '@rpg/ui/form'

import { featureFromFormRow, featureToFormRow } from './class-feature-form-fields'
import { classFormDef, type ClassFormValues } from './class-form-def'
import {
  CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS,
  spellcastingFromFormValues,
} from './class-form-values'
import {
  classSpellcastingGrantingFeatureRulesDisplay,
  resolveSpellcastingGrantingFeatureRulesDocument,
} from './class-spellcasting-feature-rules.lib'
import { srdSpellcastingProgressionFixture } from './fixtures/spellcasting-progression-fixture'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

const PROGRESSION = srdSpellcastingProgressionFixture()
const RULESET = 'srd-cc-5.2.1' as const

function previewCtx(): ContentFormCtx {
  return {
    rulesetId: RULESET,
    spellcastingProgression: PROGRESSION,
  } as ContentFormCtx
}

function parentWatchFromFormValues(formValues: ClassFormValues): Record<string, unknown> {
  const watched: Record<string, unknown> = {}
  for (const key of CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS) {
    watched[`../../${key}`] = formValues[key]
  }
  watched['../../name'] = formValues.name
  return watched
}

function bardGrantingFeatureRow(formValues: ClassFormValues) {
  const row = formValues.features.find((feature) => feature.id === 'spellcasting')
  if (!row) throw new Error('missing spellcasting feature row')
  return row
}

describe('classSpellcastingGrantingFeatureRulesDisplay', () => {
  it('emits a rules document when root selection fields and nested progression are present', () => {
    const bard = loadSeedClasses(RULESET).find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const featureRow = bardGrantingFeatureRow(formValues)

    const watched = {
      ...parentWatchFromFormValues(formValues),
      level: featureRow.level,
      name: featureRow.name,
      grants: featureRow.grants,
    }

    const blocks = resolveDisplayBlocks(
      classSpellcastingGrantingFeatureRulesDisplay(previewCtx()),
      watched,
    )
    const preview = blocks[0]
    expect(preview?.variant).toBe('rulesPreview')
    if (preview?.variant !== 'rulesPreview') return
    expect(preview.preview.content.kind).toBe('rules')
    if (preview.preview.content.kind !== 'rules') return
    expect(preview.preview.content.document.length).toBeGreaterThan(0)
  })

  it('respects granting feature level changes', () => {
    const bard = loadSeedClasses(RULESET).find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const featureRow = bardGrantingFeatureRow(formValues)

    const atLevel1 = resolveSpellcastingGrantingFeatureRulesDocument({
      className: bard.name,
      rulesetId: RULESET,
      spellcasting: spellcastingFromFormValues(formValues),
      featureRow: { ...featureRow, level: 1 },
      spellcastingProgression: PROGRESSION,
    })
    const atLevel3 = resolveSpellcastingGrantingFeatureRulesDocument({
      className: bard.name,
      rulesetId: RULESET,
      spellcasting: spellcastingFromFormValues(formValues),
      featureRow: { ...featureRow, level: 3 },
      spellcastingProgression: PROGRESSION,
    })

    expect(atLevel1).not.toBeNull()
    expect(atLevel3).not.toBeNull()
    expect(atLevel1).not.toEqual(atLevel3)
  })

  it('shows guidance when spell selection model is absent', () => {
    const watched = {
      ...parentWatchFromFormValues({
        hasSpellcasting: true,
        grantsCantrips: true,
        spellcasting: {
          slotProgressionId: 'full-caster',
          ability: 'cha',
          progression: {
            repertoire: { curve: { rows: [{ level: 1, value: 2 }] }, extension: 'zero' },
          },
        },
        spellSelectionModel: undefined,
      } as ClassFormValues),
      level: 1,
      name: 'Spellcasting',
      grants: featureToFormRow(
        loadSeedClasses(RULESET)
          .find((c) => c.slug === 'bard')!
          .features.find((f) => f.id === 'spellcasting')!,
      ).grants,
      '../../name': 'Bard',
    }

    const blocks = resolveDisplayBlocks(
      classSpellcastingGrantingFeatureRulesDisplay(previewCtx()),
      watched,
    )
    const preview = blocks[0]
    expect(preview?.variant).toBe('rulesPreview')
    if (preview?.variant !== 'rulesPreview') return
    expect(preview.preview.content).toMatchObject({ kind: 'guidance' })
  })
})

const SRD_CASTERS = [
  'bard',
  'cleric',
  'druid',
  'paladin',
  'ranger',
  'sorcerer',
  'warlock',
  'wizard',
] as const

describe('resolveSpellcastingGrantingFeatureRulesDocument parity', () => {
  it.each(SRD_CASTERS)('matches published detail formatter output for %s', (slug) => {
    const characterClass = loadSeedClasses(RULESET).find((c) => c.slug === slug)
    if (!characterClass) throw new Error(`missing ${slug} seed`)
    const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
    const featureId = slug === 'warlock' ? 'pact-magic' : 'spellcasting'
    const featureRow = formValues.features.find((row) => row.id === featureId)
    if (!featureRow) throw new Error(`missing ${featureId} feature row`)
    const spellcasting = spellcastingFromFormValues(formValues)
    expect(spellcasting).toBeDefined()

    const feature = featureFromFormRow({ ...featureRow, id: featureRow.id! })

    const fromPreview = resolveSpellcastingGrantingFeatureRulesDocument({
      className: characterClass.name,
      rulesetId: RULESET,
      spellcasting,
      featureRow,
      spellcastingProgression: PROGRESSION,
    })

    const fromDetail =
      characterClass.spellcasting &&
      isClassSpellcastingGrantingFeature(feature) &&
      formatClassSpellcastingFeatureRules({
        characterClass: { ...characterClass, features: [feature] },
        config: PROGRESSION,
      })

    expect(fromPreview).toEqual(fromDetail)
  })
})
