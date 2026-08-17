import { describe, expect, it } from 'vitest'

import { buildOrganizationFormValueSyncs } from '../../lib/forms/organization-form-projection'

describe('organizationFormValueSyncs', () => {
  it('only watches the ephemeral authoring preset', () => {
    const syncs = buildOrganizationFormValueSyncs()
    expect(syncs).toHaveLength(1)
    expect(syncs[0]?.dependsOn).toEqual(['authoringPresetId'])
  })
})
