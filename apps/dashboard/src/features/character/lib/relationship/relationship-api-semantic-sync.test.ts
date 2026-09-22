import { describe, expect, it } from 'vitest'

import {
  acknowledgePendingOps,
  areSemanticIdSetsEqual,
  reconcileDesiredChanges,
  rollbackFailedAdd,
  shouldAdoptServerSnapshot,
  type RelationshipPendingOp,
} from './relationship-api-semantic-sync.lib'

describe('relationship-api-semantic-sync', () => {
  describe('shouldAdoptServerSnapshot', () => {
    it('does not adopt a stale snapshot while a pending add is unacknowledged', () => {
      const pendingOps: RelationshipPendingOp[] = [{ kind: 'add', semanticId: 'org-1' }]

      expect(
        shouldAdoptServerSnapshot({
          confirmedIds: [],
          pendingOps,
          lastAdoptedConfirmedIds: [],
        }),
      ).toBe(false)
    })

    it('adopts when a pending add is acknowledged by the server', () => {
      const pendingOps: RelationshipPendingOp[] = [{ kind: 'add', semanticId: 'org-1' }]

      expect(
        shouldAdoptServerSnapshot({
          confirmedIds: ['org-1'],
          pendingOps,
          lastAdoptedConfirmedIds: [],
        }),
      ).toBe(true)
    })

    it('adopts when a pending remove is acknowledged by the server', () => {
      const pendingOps: RelationshipPendingOp[] = [{ kind: 'remove', semanticId: 'org-1' }]

      expect(
        shouldAdoptServerSnapshot({
          confirmedIds: [],
          pendingOps,
          lastAdoptedConfirmedIds: ['org-1'],
        }),
      ).toBe(true)
    })

    it('adopts external server changes when no pending ops remain', () => {
      expect(
        shouldAdoptServerSnapshot({
          confirmedIds: ['org-2'],
          pendingOps: [],
          lastAdoptedConfirmedIds: ['org-1'],
        }),
      ).toBe(true)
    })
  })

  describe('acknowledgePendingOps', () => {
    it('clears acknowledged pending ops', () => {
      const pendingOps: RelationshipPendingOp[] = [
        { kind: 'add', semanticId: 'org-1' },
        { kind: 'add', semanticId: 'org-3' },
      ]

      expect(acknowledgePendingOps(['org-1'], pendingOps)).toEqual([
        { kind: 'add', semanticId: 'org-3' },
      ])
    })
  })

  describe('reconcileDesiredChanges', () => {
    it('enqueues add ops for desired ids missing from confirmed', () => {
      expect(
        reconcileDesiredChanges({
          confirmedIds: [],
          desiredIds: ['org-1'],
          pendingOps: [],
        }),
      ).toEqual([{ kind: 'add', semanticId: 'org-1' }])
    })

    it('does not re-enqueue ops already pending', () => {
      expect(
        reconcileDesiredChanges({
          confirmedIds: [],
          desiredIds: ['org-1'],
          pendingOps: [{ kind: 'add', semanticId: 'org-1' }],
        }),
      ).toEqual([])
    })
  })

  describe('rollbackFailedAdd', () => {
    it('removes only the failed semantic id', () => {
      const items = [{ organizationId: 'org-1' }, { organizationId: 'org-2' }]

      expect(rollbackFailedAdd(items, 'organizationId', 'org-2')).toEqual([
        { organizationId: 'org-1' },
      ])
    })
  })

  describe('areSemanticIdSetsEqual', () => {
    it('compares semantic id sets regardless of order', () => {
      expect(areSemanticIdSetsEqual(['a', 'b'], ['b', 'a'])).toBe(true)
      expect(areSemanticIdSetsEqual(['a'], ['b'])).toBe(false)
    })
  })
})
