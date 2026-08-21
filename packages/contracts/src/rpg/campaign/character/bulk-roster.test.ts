import { describe, expect, it } from 'vitest'

import {
  CHARACTER_BULK_ROSTER_FORM_DEFAULT,
  applyBulkRosterStatusOperations,
  countBulkRosterStatusChanges,
  isBulkRosterStatusNoOp,
} from './bulk-roster'
import { createDefaultCampaignRosterState } from './participation'

describe('bulk roster operations', () => {
  const roster = createDefaultCampaignRosterState()

  it('returns empty patch when unchanged', () => {
    expect(applyBulkRosterStatusOperations(roster, CHARACTER_BULK_ROSTER_FORM_DEFAULT)).toEqual({})
  })

  it('counts roster changes', () => {
    const result = countBulkRosterStatusChanges([{ roster }, { roster: { status: 'inactive' } }], {
      rosterStatus: { kind: 'set', value: 'retired' },
    })
    expect(result.wouldChangeCount).toBe(2)
    expect(result.unchangedCount).toBe(0)
  })

  it('detects no-op bulk roster apply', () => {
    expect(
      isBulkRosterStatusNoOp(roster, {
        rosterStatus: { kind: 'set', value: 'active' },
      }),
    ).toBe(true)
  })
})
