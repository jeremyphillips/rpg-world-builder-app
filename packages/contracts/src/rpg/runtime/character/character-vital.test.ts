import { describe, expect, it } from 'vitest'

import {
  CHARACTER_BULK_ROSTER_FORM_DEFAULT,
  applyBulkRosterStatusOperations,
  countBulkRosterStatusChanges,
  isBulkRosterStatusNoOp,
} from './character-bulk-roster'
import { createDefaultCharacterVitalState, normalizeCharacterVital } from './character-vital'
import {
  applyCharacterVitalTransitionMetadata,
  mergeCharacterVitalPatch,
} from './update-character-vital'
import { createDefaultCampaignRosterState } from '../../campaign/character/participation'
import { applyCampaignRosterTransitionMetadata } from '../../campaign/character/update-roster'

const TIMESTAMP = '2026-03-01T12:00:00.000Z'
const EARLIER_TIMESTAMP = '2026-02-01T12:00:00.000Z'

describe('createDefaultCharacterVitalState', () => {
  it('returns alive vital without notes or changedAt', () => {
    expect(createDefaultCharacterVitalState()).toEqual({ status: 'alive' })
  })
})

describe('normalizeCharacterVital', () => {
  it('defaults missing input to alive', () => {
    expect(normalizeCharacterVital()).toEqual(createDefaultCharacterVitalState())
    expect(normalizeCharacterVital(null)).toEqual(createDefaultCharacterVitalState())
  })

  it('preserves changedAt when present', () => {
    expect(normalizeCharacterVital({ status: 'deceased', changedAt: EARLIER_TIMESTAMP })).toEqual({
      status: 'deceased',
      changedAt: EARLIER_TIMESTAMP,
    })
  })
})

describe('mergeCharacterVitalPatch', () => {
  const current = createDefaultCharacterVitalState()

  it('merges partial vital patch', () => {
    expect(mergeCharacterVitalPatch(current, { status: 'unknown' })).toEqual({
      status: 'unknown',
    })
  })
})

describe('applyCharacterVitalTransitionMetadata', () => {
  const current = createDefaultCharacterVitalState()

  it('assigns changedAt when status changes', () => {
    expect(
      applyCharacterVitalTransitionMetadata({
        current,
        patch: { status: 'deceased' },
        timestamp: TIMESTAMP,
      }),
    ).toEqual({ status: 'deceased', changedAt: TIMESTAMP })
  })

  it('preserves changedAt for note-only patch', () => {
    const withTimestamp = { ...current, changedAt: EARLIER_TIMESTAMP }
    expect(
      applyCharacterVitalTransitionMetadata({
        current: withTimestamp,
        patch: { note: 'Wounded.' },
        timestamp: TIMESTAMP,
      }),
    ).toEqual({ status: 'alive', note: 'Wounded.', changedAt: EARLIER_TIMESTAMP })
  })
})

describe('campaign roster patch', () => {
  const current = createDefaultCampaignRosterState()

  it('assigns changedAt when roster status changes', () => {
    expect(
      applyCampaignRosterTransitionMetadata({
        current,
        patch: { status: 'inactive' },
        timestamp: TIMESTAMP,
      }),
    ).toEqual({ status: 'inactive', changedAt: TIMESTAMP })
  })
})

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
