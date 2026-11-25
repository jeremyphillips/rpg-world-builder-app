import { describe, expect, it } from 'vitest'

import {
  assertSystemOverlayWriteReady,
  assertSystemOverlayWriteSnapshotMatchesEntity,
  evaluateSystemOverlayWriteReadiness,
  SystemOverlayWriteNotReadyError,
} from './system-overlay-write-readiness.lib'

const readyInput = {
  operation: 'update' as const,
  catalogLayer: 'system' as const,
  participantId: 'monsters' as const,
  entityId: 'srd:owlbear',
  rulesetId: 'srd-cc-5.2.1' as const,
  hasNormalizer: true,
  catalogSeed: { name: 'Owlbear' },
  overlayBaseline: { name: 'Owlbear' },
  expectedOverlayRevision: 0,
  seedRowIdsByPath: {},
}

describe('evaluateSystemOverlayWriteReadiness', () => {
  it('is ready when every dependency is present', () => {
    const result = evaluateSystemOverlayWriteReadiness(readyInput)
    expect(result.ready).toBe(true)
    if (result.ready) {
      expect(result.snapshot.entityId).toBe('srd:owlbear')
      expect(result.snapshot.expectedOverlayRevision).toBe(0)
    }
  })

  it('treats omitted overlay revision as zero', () => {
    const { expectedOverlayRevision: _revision, ...rest } = readyInput
    const result = evaluateSystemOverlayWriteReadiness(rest)
    expect(result).toMatchObject({
      ready: true,
      snapshot: { expectedOverlayRevision: 0 },
    })
  })

  it('accepts an empty seedRowIdsByPath object', () => {
    const result = evaluateSystemOverlayWriteReadiness({
      ...readyInput,
      seedRowIdsByPath: {},
    })
    expect(result.ready).toBe(true)
  })

  it.each([
    ['unregistered_participant', { participantId: undefined }],
    ['loading', { rulesetId: undefined }],
    ['missing_normalizer', { hasNormalizer: false }],
    ['missing_catalog_seed', { catalogSeed: undefined }],
    ['missing_baseline', { overlayBaseline: undefined }],
    ['missing_provenance', { seedRowIdsByPath: undefined }],
  ] as const)('reports %s', (reason, patch) => {
    const result = evaluateSystemOverlayWriteReadiness({ ...readyInput, ...patch })
    expect(result.ready).toBe(false)
    if (!result.ready) {
      expect(result.reason).toBe(reason)
    }
  })
})

describe('assertSystemOverlayWriteReady', () => {
  it('throws when not ready', () => {
    expect(() =>
      assertSystemOverlayWriteReady({ ...readyInput, overlayBaseline: undefined }),
    ).toThrow(SystemOverlayWriteNotReadyError)
  })
})

describe('assertSystemOverlayWriteSnapshotMatchesEntity', () => {
  it('throws when entity id or revision drifted', () => {
    expect(() =>
      assertSystemOverlayWriteSnapshotMatchesEntity({
        snapshotEntityId: 'a',
        snapshotRevision: 1,
        entityId: 'b',
        entityRevision: 1,
      }),
    ).toThrow(SystemOverlayWriteNotReadyError)

    expect(() =>
      assertSystemOverlayWriteSnapshotMatchesEntity({
        snapshotEntityId: 'a',
        snapshotRevision: 0,
        entityId: 'a',
        entityRevision: 2,
      }),
    ).toThrow(SystemOverlayWriteNotReadyError)
  })
})
