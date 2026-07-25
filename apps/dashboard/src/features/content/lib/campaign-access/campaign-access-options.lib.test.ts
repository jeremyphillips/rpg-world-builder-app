import { describe, expect, it } from 'vitest'

import {
  buildCampaignAccessAvailabilityOptions,
  buildCampaignAccessVisibilityOptions,
  formatBulkAvailabilityOption,
  formatBulkVisibilityOption,
  parseBulkAvailabilityOption,
  parseBulkVisibilityOption,
} from './campaign-access-options.lib'

describe('buildCampaignAccessAvailabilityOptions', () => {
  it('includes leave unchanged when requested', () => {
    expect(buildCampaignAccessAvailabilityOptions({ includeLeaveUnchanged: true })).toEqual([
      { value: 'unchanged', label: 'Leave unchanged' },
      { value: 'true', label: 'Available' },
      { value: 'false', label: 'Unavailable' },
    ])
  })
})

describe('buildCampaignAccessVisibilityOptions', () => {
  it('gates specific players when disabled', () => {
    const options = buildCampaignAccessVisibilityOptions('classes', {
      includeSpecificPlayers: false,
      includeLeaveUnchanged: true,
    })

    expect(options.map((option) => option.value)).not.toContain('specific_players')
    expect(options[0]).toEqual({ value: 'unchanged', label: 'Leave unchanged' })
  })

  it('includes all capability modes for owned targets', () => {
    const options = buildCampaignAccessVisibilityOptions('classes')
    expect(options.length).toBeGreaterThan(0)
    expect(options.some((option) => option.value === 'all_players')).toBe(true)
  })
})

describe('bulk option parsing', () => {
  it('round-trips availability operations', () => {
    const operation = { kind: 'set' as const, value: false }
    expect(parseBulkAvailabilityOption(formatBulkAvailabilityOption(operation))).toEqual(operation)
  })

  it('round-trips visibility operations', () => {
    const operation = { kind: 'set' as const, value: 'dm_only' as const }
    expect(parseBulkVisibilityOption(formatBulkVisibilityOption(operation))).toEqual(operation)
  })
})
