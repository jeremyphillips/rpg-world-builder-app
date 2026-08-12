import { describe, expect, it } from 'vitest'

import { organizationFormValueSyncs } from './organization-form-sync'

describe('organizationFormValueSyncs', () => {
  it('only watches the ephemeral authoring preset', () => {
    expect(organizationFormValueSyncs).toHaveLength(1)
    expect(organizationFormValueSyncs[0]?.dependsOn).toEqual(['authoringPresetId'])
  })
})
