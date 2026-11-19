import { describe, expect, it } from 'vitest'
import { resolveDisplayBlocks } from '@rpg/ui/form'

import { featureToFormRow } from './class-feature-form-fields'
import { createSpellcastingFeature } from './class-spellcasting-features'
import { classSpellcastingFeatureSummaryDisplay } from './class-spellcasting-feature-summary-display.lib'

describe('classSpellcastingFeatureSummaryDisplay', () => {
  it('emits a feature table row when a granting feature exists', () => {
    const features = [
      featureToFormRow(createSpellcastingFeature({ level: 2, usesPactMagic: false })),
    ]
    const blocks = resolveDisplayBlocks(classSpellcastingFeatureSummaryDisplay(), { features })
    expect(blocks[0]).toMatchObject({
      variant: 'featureTableRow',
      title: 'Spellcasting',
      typeLabel: 'Spellcasting feature',
    })
    expect(blocks[0]?.variant === 'featureTableRow' ? blocks[0].metadata : '').toContain('Level 2')
  })

  it('emits supporting copy when no granting feature exists', () => {
    const blocks = resolveDisplayBlocks(classSpellcastingFeatureSummaryDisplay(), { features: [] })
    expect(blocks[0]).toMatchObject({
      variant: 'text',
      role: 'supporting',
    })
  })
})
