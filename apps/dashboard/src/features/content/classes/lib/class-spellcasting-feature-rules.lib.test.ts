import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'

import { classFormDef, type ClassFormValues } from './class-form-def'
import { spellcastingFromFormValues } from './class-form-values'
import { resolveSpellcastingGrantingFeatureRulesDocument } from './class-spellcasting-feature-rules.lib'
import { srdSpellcastingProgressionFixture } from './fixtures/spellcasting-progression-fixture'

const PROGRESSION = srdSpellcastingProgressionFixture()
const RULESET = 'srd-cc-5.2.1' as const

describe('resolveSpellcastingGrantingFeatureRulesDocument', () => {
  it('respects granting feature level changes', () => {
    const bard = loadSeedClasses(RULESET).find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const featureRow = formValues.features.find((feature) => feature.id === 'spellcasting')
    if (!featureRow) throw new Error('missing spellcasting feature row')

    const atLevel1 = resolveSpellcastingGrantingFeatureRulesDocument({
      className: bard.name,
      rulesetId: RULESET,
      spellcasting: spellcastingFromFormValues(formValues),
      featureRow: { ...featureRow, level: 1 },
      spellcastingProgression: PROGRESSION,
    })

    const atLevel10 = resolveSpellcastingGrantingFeatureRulesDocument({
      className: bard.name,
      rulesetId: RULESET,
      spellcasting: spellcastingFromFormValues(formValues),
      featureRow: { ...featureRow, level: 10 },
      spellcastingProgression: PROGRESSION,
    })

    expect(atLevel1).toBeTruthy()
    expect(atLevel10).toBeTruthy()
    expect(atLevel1).not.toEqual(atLevel10)
  })
})
