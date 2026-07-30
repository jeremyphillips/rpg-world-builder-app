import { describe, expect, it } from 'vitest'
import type { GroupConfig } from '@rpg/ui/form'

import { buildCampaignAvailabilityFields } from './campaign-availability-form-fields'

describe('buildCampaignAvailabilityFields', () => {
  it('builds vocabulary summary from available field only', () => {
    const [group] = buildCampaignAvailabilityFields({
      groupId: 'test-group',
      pending: false,
      summaryDependsOn: ['available'],
      resolveSummary: (values) =>
        values.available
          ? { status: { label: 'Available', tone: 'success', indicator: 'dot' } }
          : { status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' } },
    })

    const availabilityGroup = group as GroupConfig
    expect(availabilityGroup.kind).toBe('group')
    expect(availabilityGroup.disclosure?.variant).toBe('summary')
    if (availabilityGroup.disclosure?.variant === 'summary') {
      expect(availabilityGroup.disclosure.resolveSummary({ available: false }).status?.label).toBe(
        'Unavailable',
      )
    }
    expect(availabilityGroup.fields).toHaveLength(1)
    expect(availabilityGroup.fields?.[0]).toMatchObject({ name: 'available', type: 'switch' })
  })
})
