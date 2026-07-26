import { describe, expect, it } from 'vitest'

import {
  CHARACTER_BULK_ROSTER_FORM_DEFAULT,
  applyBulkRosterStatusOperations,
  countBulkRosterStatusChanges,
  isBulkRosterStatusNoOp,
} from './character-bulk-lifecycle'
import { createDefaultCharacterLifecycle, normalizeCharacterLifecycle } from './lifecycle'
import {
  applyLifecycleTransitionMetadata,
  mergeCharacterLifecyclePatch,
} from './update-character-lifecycle'

const TIMESTAMP = '2026-03-01T12:00:00.000Z'
const EARLIER_TIMESTAMP = '2026-02-01T12:00:00.000Z'

describe('createDefaultCharacterLifecycle', () => {
  it('returns active roster and alive vital without notes or changedAt', () => {
    expect(createDefaultCharacterLifecycle()).toEqual({
      roster: { status: 'active' },
      vital: { status: 'alive' },
    })
  })
})

describe('normalizeCharacterLifecycle', () => {
  it('defaults missing input to active and alive', () => {
    expect(normalizeCharacterLifecycle()).toEqual(createDefaultCharacterLifecycle())
    expect(normalizeCharacterLifecycle(null)).toEqual(createDefaultCharacterLifecycle())
  })

  it('fills partial roster and vital dimensions', () => {
    expect(
      normalizeCharacterLifecycle({
        roster: { status: 'retired', note: 'Left the party.' },
      }),
    ).toEqual({
      roster: { status: 'retired', note: 'Left the party.' },
      vital: { status: 'alive' },
    })
  })

  it('preserves changedAt when present', () => {
    expect(
      normalizeCharacterLifecycle({
        vital: { status: 'deceased', changedAt: EARLIER_TIMESTAMP },
      }),
    ).toEqual({
      roster: { status: 'active' },
      vital: { status: 'deceased', changedAt: EARLIER_TIMESTAMP },
    })
  })
})

describe('mergeCharacterLifecyclePatch', () => {
  const current = createDefaultCharacterLifecycle()

  it('merges partial roster while preserving vital', () => {
    expect(mergeCharacterLifecyclePatch(current, { roster: { status: 'inactive' } })).toEqual({
      roster: { status: 'inactive' },
      vital: { status: 'alive' },
    })
  })

  it('merges partial vital while preserving roster', () => {
    expect(mergeCharacterLifecyclePatch(current, { vital: { status: 'unknown' } })).toEqual({
      roster: { status: 'active' },
      vital: { status: 'unknown' },
    })
  })

  it('accepts optional changedAt and note for import paths', () => {
    expect(
      mergeCharacterLifecyclePatch(current, {
        roster: { status: 'retired', note: 'Import note', changedAt: EARLIER_TIMESTAMP },
      }),
    ).toEqual({
      roster: { status: 'retired', note: 'Import note', changedAt: EARLIER_TIMESTAMP },
      vital: { status: 'alive' },
    })
  })
})

describe('applyLifecycleTransitionMetadata', () => {
  it('assigns changedAt when roster status changes', () => {
    const current = createDefaultCharacterLifecycle()
    const next = applyLifecycleTransitionMetadata({
      current,
      patch: { roster: { status: 'inactive' } },
      timestamp: TIMESTAMP,
    })

    expect(next.roster).toEqual({ status: 'inactive', changedAt: TIMESTAMP })
    expect(next.vital).toEqual({ status: 'alive' })
  })

  it('preserves changedAt for same-status submissions', () => {
    const current = {
      roster: { status: 'active' as const, changedAt: EARLIER_TIMESTAMP },
      vital: { status: 'alive' as const },
    }

    const next = applyLifecycleTransitionMetadata({
      current,
      patch: { roster: { status: 'active' } },
      timestamp: TIMESTAMP,
    })

    expect(next.roster.changedAt).toBe(EARLIER_TIMESTAMP)
  })

  it('preserves changedAt for note-only updates', () => {
    const current = {
      roster: { status: 'active' as const, changedAt: EARLIER_TIMESTAMP },
      vital: { status: 'alive' as const },
    }

    const next = applyLifecycleTransitionMetadata({
      current,
      patch: { roster: { note: 'On leave.' } },
      timestamp: TIMESTAMP,
    })

    expect(next.roster).toEqual({
      status: 'active',
      note: 'On leave.',
      changedAt: EARLIER_TIMESTAMP,
    })
  })

  it('assigns vital changedAt independently of roster', () => {
    const current = createDefaultCharacterLifecycle()
    const next = applyLifecycleTransitionMetadata({
      current,
      patch: { vital: { status: 'deceased', note: 'Fell in battle.' } },
      timestamp: TIMESTAMP,
    })

    expect(next.vital).toEqual({
      status: 'deceased',
      note: 'Fell in battle.',
      changedAt: TIMESTAMP,
    })
  })
})

describe('character bulk roster', () => {
  const current = createDefaultCharacterLifecycle()

  it('detects no-op when unchanged', () => {
    expect(isBulkRosterStatusNoOp(current, CHARACTER_BULK_ROSTER_FORM_DEFAULT)).toBe(true)
  })

  it('builds roster status patch for set operations', () => {
    expect(
      applyBulkRosterStatusOperations(current, {
        rosterStatus: { kind: 'set', value: 'retired' },
      }),
    ).toEqual({ roster: { status: 'retired' } })
  })

  it('counts would-change and unchanged rows', () => {
    const retired = mergeCharacterLifecyclePatch(current, { roster: { status: 'retired' } })

    expect(
      countBulkRosterStatusChanges([{ lifecycle: current }, { lifecycle: retired }], {
        rosterStatus: { kind: 'set', value: 'inactive' },
      }),
    ).toEqual({ wouldChangeCount: 2, unchangedCount: 0 })
  })
})
