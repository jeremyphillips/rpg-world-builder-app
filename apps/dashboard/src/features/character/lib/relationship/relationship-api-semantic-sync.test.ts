import { describe, expect, it } from 'vitest'

import {
  acknowledgePendingOps,
  areSemanticIdSetsEqual,
  commitRelationshipPendingOps,
  failedSyncFormItems,
  mergeUnconfirmedDesiredItems,
  pendingOpsAfterFailedOp,
  reconcileDesiredChanges,
  relationshipSyncErrorMessage,
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
          serverChanged: true,
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
          serverChanged: true,
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
          serverChanged: true,
        }),
      ).toBe(true)
    })

    it('adopts external server changes when no pending ops remain', () => {
      expect(
        shouldAdoptServerSnapshot({
          confirmedIds: ['org-2'],
          pendingOps: [],
          lastAdoptedConfirmedIds: ['org-1'],
          serverChanged: true,
        }),
      ).toBe(true)
    })

    it('adopts metadata-only server changes when semantic ids are unchanged', () => {
      expect(
        shouldAdoptServerSnapshot({
          confirmedIds: ['org-1'],
          pendingOps: [],
          lastAdoptedConfirmedIds: ['org-1'],
          serverChanged: true,
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

    it('enqueues remove before add when replacing a confirmed id', () => {
      expect(
        reconcileDesiredChanges({
          confirmedIds: ['loc-old'],
          desiredIds: ['loc-new'],
          pendingOps: [],
        }),
      ).toEqual([
        { kind: 'remove', semanticId: 'loc-old' },
        { kind: 'add', semanticId: 'loc-new' },
      ])
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

  describe('mergeUnconfirmedDesiredItems', () => {
    it('keeps optimistic rows that the server has not confirmed', () => {
      expect(
        mergeUnconfirmedDesiredItems(
          [{ organizationId: 'org-1', title: 'Member' }],
          [{ organizationId: 'org-1', title: 'Member' }, { organizationId: 'org-2' }],
          'organizationId',
          ['org-1'],
        ),
      ).toEqual([{ organizationId: 'org-1', title: 'Member' }, { organizationId: 'org-2' }])
    })
  })

  describe('pendingOpsAfterFailedOp', () => {
    it('drops the failed op and acknowledges succeeded siblings', () => {
      expect(
        pendingOpsAfterFailedOp(
          [
            { kind: 'remove', semanticId: 'loc-old' },
            { kind: 'add', semanticId: 'loc-new' },
          ],
          { kind: 'add', semanticId: 'loc-new' },
          [],
        ),
      ).toEqual([])
    })
  })

  describe('commitRelationshipPendingOps', () => {
    it('runs remove before add and returns the failed op', async () => {
      const order: string[] = []
      const result = await commitRelationshipPendingOps(
        [
          { kind: 'remove', semanticId: 'loc-old' },
          { kind: 'add', semanticId: 'loc-new' },
        ],
        async () => {
          order.push('add')
        },
        async () => {
          order.push('remove')
          throw new Error('Could not remove this residence.')
        },
        'Could not remove this residence.',
      )

      expect(order).toEqual(['remove'])
      expect(result.failedOp).toEqual({ kind: 'remove', semanticId: 'loc-old' })
      expect(result.error).toEqual(new Error('Could not remove this residence.'))
    })
  })

  describe('relationshipSyncErrorMessage', () => {
    it('prefers the thrown error message', () => {
      expect(
        relationshipSyncErrorMessage(
          new Error('Could not add this residence.'),
          { kind: 'add', semanticId: 'loc-new' },
          [{ kind: 'add', semanticId: 'loc-new' }],
          'Could not add this residence.',
          'Could not remove this residence.',
        ),
      ).toBe('Could not add this residence.')
    })
  })

  describe('failedSyncFormItems', () => {
    it('drops the failed semantic id and keeps other optimistic rows', () => {
      expect(
        failedSyncFormItems(
          [{ organizationId: 'org-1' }],
          [{ organizationId: 'org-1' }, { organizationId: 'org-2' }, { organizationId: 'org-3' }],
          'organizationId',
          'org-2',
          ['org-1'],
        ),
      ).toEqual([{ organizationId: 'org-1' }, { organizationId: 'org-3' }])
    })
  })

  describe('areSemanticIdSetsEqual', () => {
    it('compares semantic id sets regardless of order', () => {
      expect(areSemanticIdSetsEqual(['a', 'b'], ['b', 'a'])).toBe(true)
      expect(areSemanticIdSetsEqual(['a'], ['b'])).toBe(false)
    })
  })
})
