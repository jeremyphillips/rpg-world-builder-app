import { describe, expect, it } from 'vitest'
import type { GroupConfig } from '@rpg/ui/form'

import { buildSpellcastingFeatureAvailabilityFormFields } from './class-spellcasting-feature-availability-form-fields'

describe('buildSpellcastingFeatureAvailabilityFormFields', () => {
  it('uses heading label for dialog disclosure legend', () => {
    const [group] = buildSpellcastingFeatureAvailabilityFormFields('feature-1', 'features.0')

    const availabilityGroup = group as GroupConfig
    expect(availabilityGroup.heading?.label).toBe('Campaign availability')
    expect(availabilityGroup.disclosure?.variant).toBe('dialog')
  })
})
