import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'
import { resolveDisplayBlocks } from '@rpg/ui/form'

import { featureFromFormRow, featureToFormRow } from './class-feature-form-fields'
import { classFormDef, type ClassFormValues } from './class-form-def'
import {
  CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS,
  spellcastingFromFormValues,
} from './class-form-values'
import {
  classSpellcastingGrantingFeatureRulesDisplay,
  resolveSpellcastingGrantingFeatureFacing,
  resolveSpellcastingGrantingFeatureRulesDocument,
} from './class-spellcasting-feature-rules.lib'
import { buildClassDetailViewModel } from './class-display'
import { srdSpellcastingProgressionFixture } from './fixtures/spellcasting-progression-fixture'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

const PROGRESSION = srdSpellcastingProgressionFixture()
const RULESET = 'srd-cc-5.2.1' as const

const vocabulary = {
  resolveToolLabel: (slug: string) => slug,
}

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
      intro: featureRow.intro ?? '',
      grants: featureRow.grants,
    }

    const blocks = resolveDisplayBlocks(
      classSpellcastingGrantingFeatureRulesDisplay(previewCtx()),
      watched,
    )
    const preview = blocks[0]
    expect(preview?.variant).toBe('rulesPreview')
    if (preview?.variant !== 'rulesPreview') return
    expect(preview.preview.content.kind).toBe('introAndRules')
    if (preview.preview.content.kind !== 'introAndRules') return
    expect(preview.preview.content.rulesDocument?.length).toBeGreaterThan(0)
    expect(preview.preview.content.introHtml?.trim().length).toBeGreaterThan(0)
  })

  it('keeps authored introduction when rules resolution is unavailable', () => {
    const bard = loadSeedClasses(RULESET).find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const featureRow = bardGrantingFeatureRow(formValues)

    const watched = {
      ...parentWatchFromFormValues({
        ...formValues,
        spellSelectionModel: undefined,
      } as ClassFormValues),
      level: featureRow.level,
      name: featureRow.name,
      intro: featureRow.intro ?? '',
      grants: featureRow.grants,
      '../../name': formValues.name,
    }

    const blocks = resolveDisplayBlocks(
      classSpellcastingGrantingFeatureRulesDisplay(previewCtx()),
      watched,
    )
    const preview = blocks[0]
    if (preview?.variant !== 'rulesPreview') throw new Error('missing preview')
    const content = preview.preview.content
    expect(content.kind).toBe('introAndRules')
    if (content.kind !== 'introAndRules') return
    expect(content.introHtml?.trim().length).toBeGreaterThan(0)
    expect(content.rulesDocument).toBeUndefined()
    expect(content.guidance).toBeTruthy()
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
      intro:
        featureToFormRow(
          loadSeedClasses(RULESET)
            .find((c) => c.slug === 'bard')!
            .features.find((f) => f.id === 'spellcasting')!,
        ).intro ?? '',
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
    expect(preview.preview.content).toMatchObject({
      kind: 'introAndRules',
      guidance: expect.stringContaining('Spellcasting is inactive'),
    })
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

describe('resolveSpellcastingGrantingFeatureFacing parity', () => {
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

    const fromPreview = resolveSpellcastingGrantingFeatureFacing({
      className: characterClass.name,
      rulesetId: RULESET,
      spellcasting,
      featureRow,
      spellcastingProgression: PROGRESSION,
    })

    const detail = buildClassDetailViewModel(characterClass, vocabulary, {
      spellcastingProgression: PROGRESSION,
      characterClass,
    })
    const featuresSection = detail.sections.find((section) => section.id === 'features')
    if (!featuresSection || featuresSection.id !== 'features') throw new Error('missing features')
    const detailItem = featuresSection?.items.find((item) => item.id === featureId)

    expect(fromPreview.introHtml).toBe(detailItem?.introHtml)
    expect(fromPreview.rulesDocument).toEqual(detailItem?.rulesDocument)
    expect(fromPreview.rulesDocument).toBeTruthy()
  })
})
