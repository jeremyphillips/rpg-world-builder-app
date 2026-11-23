import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'

import { classFormDef, type ClassFormValues } from '../classes/lib/class-form-def'
import { featureFromFormRow } from '../classes/lib/class-feature-form-fields'
import { buildClassDetailViewModel } from '../classes/lib/class-display'
import { spellcastingFromFormValues } from '../classes/lib/class-form-values'
import { srdSpellcastingProgressionFixture } from '../classes/lib/fixtures/spellcasting-progression-fixture'
import { adaptClassFeatureDraftRow } from './adapters/class-feature-draft.adapter'
import { resolveFacing } from './resolve-facing'
import type { ContentFormCtx } from '../lib/forms/registry/content-form-registry'

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

describe('class feature spellcasting facing', () => {
  it('emits intro and rules blocks when spellcasting config is complete', () => {
    const bard = loadSeedClasses(RULESET).find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const featureRow = formValues.features.find((feature) => feature.id === 'spellcasting')
    if (!featureRow?.id) throw new Error('missing spellcasting feature row')

    const adapted = adaptClassFeatureDraftRow(featureRow)
    expect(adapted.status).toBe('ok')
    if (adapted.status !== 'ok') return

    const facing = resolveFacing({
      domain: 'classFeature',
      source: 'draft',
      row: featureRow,
      host: {
        className: bard.name,
        rulesetId: RULESET,
        spellcasting: spellcastingFromFormValues(formValues),
        spellcastingProgression: PROGRESSION,
      },
    })

    expect(facing.status).toBe('ready')
    if (facing.status !== 'ready') return
    expect(facing.document.blocks.some((block) => block.kind === 'richText')).toBe(true)
    expect(facing.document.blocks.some((block) => block.kind === 'rules')).toBe(true)
  })

  it('returns invalid when kind is missing on a draft row', () => {
    const facing = resolveFacing({
      domain: 'classFeature',
      source: 'draft',
      row: { id: 'preview', name: 'Spellcasting', level: 1 },
      host: {
        className: 'Wizard',
        rulesetId: RULESET,
        spellcastingProgression: PROGRESSION,
      },
    })
    expect(facing).toEqual({ status: 'invalid', code: 'missing-kind' })
  })

  it('keeps introduction when spellcasting config is incomplete', () => {
    const bard = loadSeedClasses(RULESET).find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const featureRow = formValues.features.find((feature) => feature.id === 'spellcasting')
    if (!featureRow) throw new Error('missing spellcasting feature row')

    const facing = resolveFacing({
      domain: 'classFeature',
      source: 'draft',
      row: featureRow,
      host: {
        className: bard.name,
        rulesetId: RULESET,
        spellcasting: undefined,
        spellcastingProgression: PROGRESSION,
      },
    })

    expect(facing.status).toBe('incomplete')
    if (facing.status !== 'incomplete') return
    expect(facing.document?.blocks.some((block) => block.kind === 'richText')).toBe(true)
    expect(facing.guidance).toBeTruthy()
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

describe('class spellcasting facing parity', () => {
  it.each(SRD_CASTERS)('matches published detail facing for %s', (slug) => {
    const characterClass = loadSeedClasses(RULESET).find((c) => c.slug === slug)
    if (!characterClass) throw new Error(`missing ${slug} seed`)
    const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
    const featureId = slug === 'warlock' ? 'pact-magic' : 'spellcasting'
    const featureRow = formValues.features.find((row) => row.id === featureId)
    if (!featureRow) throw new Error(`missing ${featureId} feature row`)
    const spellcasting = spellcastingFromFormValues(formValues)
    expect(spellcasting).toBeDefined()

    const feature = featureFromFormRow({ ...featureRow, id: featureRow.id! })

    const fromDraft = resolveFacing({
      domain: 'classFeature',
      source: 'draft',
      row: featureRow,
      host: {
        className: characterClass.name,
        rulesetId: RULESET,
        spellcasting,
        spellcastingProgression: PROGRESSION,
      },
    })

    const detail = buildClassDetailViewModel(characterClass, vocabulary, {
      spellcastingProgression: PROGRESSION,
      characterClass,
    })
    const featuresSection = detail.sections.find((section) => section.id === 'features')
    if (!featuresSection || featuresSection.id !== 'features') throw new Error('missing features')
    const detailItem = featuresSection.items.find((item) => item.id === featureId)

    const fromPersisted = resolveFacing({
      domain: 'classFeature',
      source: 'persisted',
      feature,
      host: {
        className: characterClass.name,
        rulesetId: RULESET,
        spellcasting,
        spellcastingProgression: PROGRESSION,
      },
    })

    expect(fromDraft).toEqual(fromPersisted)
    expect(detailItem?.facing).toEqual(fromPersisted)
    if (fromPersisted.status === 'ready') {
      expect(fromPersisted.document.blocks.some((block) => block.kind === 'rules')).toBe(true)
    }
  })
})
