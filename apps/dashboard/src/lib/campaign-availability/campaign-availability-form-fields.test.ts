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
    expect(availabilityGroup.disclosure?.variant).toBe('inline')
    if (availabilityGroup.disclosure?.variant === 'inline') {
      expect(availabilityGroup.disclosure.resolveSummary({ available: false }).status?.label).toBe(
        'Unavailable',
      )
    }
    expect(availabilityGroup.fields).toHaveLength(1)
    expect(availabilityGroup.fields?.[0]).toMatchObject({ name: 'available', type: 'switch' })
  })

  it('maps dialog presentation to the dialog disclosure variant and hint', () => {
    const [group] = buildCampaignAvailabilityFields({
      groupId: 'test-group',
      pending: false,
      presentation: 'dialog',
      summaryDependsOn: ['available'],
      resolveSummary: () => ({ status: { label: 'Available', tone: 'success', indicator: 'dot' } }),
    })

    const availabilityGroup = group as GroupConfig
    expect(availabilityGroup.disclosure?.variant).toBe('dialog')
    if (availabilityGroup.disclosure?.variant === 'dialog') {
      expect(availabilityGroup.disclosure.hint).toBe(
        'Controls where this content can be discovered and used.',
      )
      expect(availabilityGroup.disclosure.dialogHeadline).toBe('Campaign availability')
      expect(availabilityGroup.disclosure.closeLabel).toBe('Done')
    }
  })
})
