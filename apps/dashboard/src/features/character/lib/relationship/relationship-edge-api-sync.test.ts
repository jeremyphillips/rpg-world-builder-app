import { ApiError } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  acknowledgePendingEdgeOps,
  adoptCanonicalEdgeAfterConflict,
  areEdgeSnapshotsEqual,
  commitRelationshipEdgePendingOps,
  createLocalRelationshipId,
  mergeEdgeRowsPreservingLocalEdits,
  mergeUnconfirmedDesiredEdgeRows,
  pendingEdgeOpsAfterFailedOp,
  reconcileDesiredEdgeChanges,
  relationshipEdgeSyncErrorMessage,
  remapPendingEdgeOpRelationshipId,
  shouldAdoptEdgeServerSnapshot,
  type RelationshipEdgePendingOp,
} from './relationship-edge-api-sync.lib'

type TestEdgeRow = {
  relationshipId: string
  revision: number
  title?: string
}

describe('relationship-edge-api-sync', () => {
  describe('shouldAdoptEdgeServerSnapshot', () => {
    it('does not adopt a stale snapshot while a pending add is unacknowledged', () => {
      const pendingOps: RelationshipEdgePendingOp[] = [
        { kind: 'add', relationshipId: 'local:edge-1', requestId: 'req-1' },
      ]

      expect(
        shouldAdoptEdgeServerSnapshot({
          serverRows: [],
          pendingOps,
          lastAdoptedServerRows: [],
          serverChanged: true,
        }),
      ).toBe(false)
    })

    it('adopts when a pending add is acknowledged by the server', () => {
      const pendingOps: RelationshipEdgePendingOp[] = [
        {
          kind: 'add',
          relationshipId: 'edge-1',
          requestId: 'req-1',
          serverRelationshipId: 'edge-1',
        },
      ]

      expect(
        shouldAdoptEdgeServerSnapshot({
          serverRows: [{ relationshipId: 'edge-1', revision: 1 }],
          pendingOps,
          lastAdoptedServerRows: [],
          serverChanged: true,
        }),
      ).toBe(true)
    })

    it('adopts when a pending remove is acknowledged by the server', () => {
      const pendingOps: RelationshipEdgePendingOp[] = [
        {
          kind: 'remove',
          relationshipId: 'edge-1',
          requestId: 'req-1',
          expectedRevision: 2,
        },
      ]

      expect(
        shouldAdoptEdgeServerSnapshot({
          serverRows: [],
          pendingOps,
          lastAdoptedServerRows: [{ relationshipId: 'edge-1', revision: 2 }],
          serverChanged: true,
        }),
      ).toBe(true)
    })

    it('adopts metadata-only server changes when edge ids are unchanged', () => {
      expect(
        shouldAdoptEdgeServerSnapshot({
          serverRows: [{ relationshipId: 'edge-1', revision: 2 }],
          pendingOps: [],
          lastAdoptedServerRows: [{ relationshipId: 'edge-1', revision: 1 }],
          serverChanged: true,
        }),
      ).toBe(true)
    })
  })

  describe('acknowledgePendingEdgeOps', () => {
    it('clears acknowledged pending ops', () => {
      const pendingOps: RelationshipEdgePendingOp[] = [
        {
          kind: 'update',
          relationshipId: 'edge-1',
          requestId: 'req-1',
          expectedRevision: 1,
        },
        {
          kind: 'update',
          relationshipId: 'edge-2',
          requestId: 'req-2',
          expectedRevision: 1,
        },
      ]

      expect(
        acknowledgePendingEdgeOps(
          [
            { relationshipId: 'edge-1', revision: 2 },
            { relationshipId: 'edge-2', revision: 1 },
          ],
          pendingOps,
        ),
      ).toEqual([
        {
          kind: 'update',
          relationshipId: 'edge-2',
          requestId: 'req-2',
          expectedRevision: 1,
        },
      ])
    })
  })

  describe('reconcileDesiredEdgeChanges', () => {
    it('enqueues update ops for metadata-only edits', () => {
      const confirmed: TestEdgeRow[] = [{ relationshipId: 'edge-1', revision: 2, title: 'Member' }]
      const desired: TestEdgeRow[] = [{ relationshipId: 'edge-1', revision: 2, title: 'Captain' }]

      expect(
        reconcileDesiredEdgeChanges({
          confirmedRows: confirmed,
          desiredRows: desired,
          pendingOps: [],
          isRowContentEqual: (left, right) => left.title === right.title,
        }),
      ).toEqual([
        {
          kind: 'update',
          relationshipId: 'edge-1',
          requestId: expect.any(String),
          expectedRevision: 2,
        },
      ])
    })

    it('enqueues remove before add when replacing a confirmed edge', () => {
      const localId = createLocalRelationshipId()
      const confirmed: TestEdgeRow[] = [{ relationshipId: 'edge-old', revision: 1 }]
      const desired: TestEdgeRow[] = [{ relationshipId: localId, revision: 0 }]

      const ops = reconcileDesiredEdgeChanges({
        confirmedRows: confirmed,
        desiredRows: desired,
        pendingOps: [],
        isRowContentEqual: (left, right) => left.relationshipId === right.relationshipId,
      })

      expect(ops[0]).toMatchObject({
        kind: 'remove',
        relationshipId: 'edge-old',
        expectedRevision: 1,
      })
      expect(ops[1]).toMatchObject({ kind: 'add', relationshipId: localId })
    })

    it('does not re-enqueue ops already pending', () => {
      const localId = createLocalRelationshipId()
      expect(
        reconcileDesiredEdgeChanges({
          confirmedRows: [],
          desiredRows: [{ relationshipId: localId, revision: 0 }],
          pendingOps: [{ kind: 'add', relationshipId: localId, requestId: 'req-1' }],
          isRowContentEqual: () => true,
        }),
      ).toEqual([])
    })
  })

  describe('mergeEdgeRowsPreservingLocalEdits', () => {
    it('keeps newer local metadata when the server snapshot is stale', () => {
      expect(
        mergeEdgeRowsPreservingLocalEdits({
          serverRows: [{ relationshipId: 'edge-1', revision: 2, title: 'Member' }],
          localRows: [{ relationshipId: 'edge-1', revision: 2, title: 'Captain' }],
          pendingOps: [],
          isRowContentEqual: (left, right) => left.title === right.title,
        }),
      ).toEqual([{ relationshipId: 'edge-1', revision: 2, title: 'Captain' }])
    })
  })

  describe('adoptCanonicalEdgeAfterConflict', () => {
    it('preserves newer local edits while adopting the canonical revision', () => {
      expect(
        adoptCanonicalEdgeAfterConflict(
          { relationshipId: 'edge-1', revision: 2, title: 'Captain' },
          { relationshipId: 'edge-1', revision: 4, title: 'Member' },
          (left, right) => left.title === right.title,
        ),
      ).toEqual({ relationshipId: 'edge-1', revision: 4, title: 'Captain' })
    })
  })

  describe('commitRelationshipEdgePendingOps', () => {
    it('runs remove before add and returns the failed op', async () => {
      const order: string[] = []
      const result = await commitRelationshipEdgePendingOps(
        [
          {
            kind: 'remove',
            relationshipId: 'edge-old',
            requestId: 'req-remove',
            expectedRevision: 1,
          },
          {
            kind: 'add',
            relationshipId: createLocalRelationshipId(),
            requestId: 'req-add',
          },
        ],
        {
          onAdd: async () => {
            order.push('add')
          },
          onUpdate: async () => {
            order.push('update')
          },
          onRemove: async () => {
            order.push('remove')
            throw new Error('Could not remove this relationship.')
          },
        },
      )

      expect(order).toEqual(['remove'])
      expect(result.failedOp).toMatchObject({ kind: 'remove', relationshipId: 'edge-old' })
      expect(result.error).toEqual(new Error('Could not remove this relationship.'))
    })
  })

  describe('pendingEdgeOpsAfterFailedOp', () => {
    it('drops the failed op and acknowledges succeeded siblings', () => {
      expect(
        pendingEdgeOpsAfterFailedOp(
          [
            {
              kind: 'remove',
              relationshipId: 'edge-old',
              requestId: 'req-remove',
              expectedRevision: 1,
            },
            {
              kind: 'add',
              relationshipId: 'edge-new',
              requestId: 'req-add',
            },
          ],
          {
            kind: 'add',
            relationshipId: 'edge-new',
            requestId: 'req-add',
          },
          [],
        ),
      ).toEqual([])
    })
  })

  describe('remapPendingEdgeOpRelationshipId', () => {
    it('maps local ids to persisted edge ids after create', () => {
      const localId = createLocalRelationshipId()
      expect(
        remapPendingEdgeOpRelationshipId(
          [{ kind: 'add', relationshipId: localId, requestId: 'req-1' }],
          localId,
          'edge-1',
        ),
      ).toEqual([
        {
          kind: 'add',
          relationshipId: 'edge-1',
          requestId: 'req-1',
          serverRelationshipId: 'edge-1',
        },
      ])
    })
  })

  describe('mergeUnconfirmedDesiredEdgeRows', () => {
    it('keeps optimistic rows that the server has not confirmed', () => {
      const localId = createLocalRelationshipId()
      expect(
        mergeUnconfirmedDesiredEdgeRows(
          [{ relationshipId: 'edge-1', revision: 1, title: 'Member' }],
          [
            { relationshipId: 'edge-1', revision: 1, title: 'Member' },
            { relationshipId: localId, revision: 0 },
          ],
          [{ relationshipId: 'edge-1', revision: 1 }],
        ),
      ).toEqual([
        { relationshipId: 'edge-1', revision: 1, title: 'Member' },
        { relationshipId: localId, revision: 0 },
      ])
    })
  })

  describe('relationshipEdgeSyncErrorMessage', () => {
    it('prefers the thrown error message', () => {
      expect(
        relationshipEdgeSyncErrorMessage(
          new Error('Could not update this relationship.'),
          { kind: 'update', relationshipId: 'edge-1', requestId: 'req-1', expectedRevision: 1 },
          [{ kind: 'update', relationshipId: 'edge-1', requestId: 'req-1', expectedRevision: 1 }],
          'Could not add this relationship.',
          'Could not update this relationship.',
          'Could not remove this relationship.',
        ),
      ).toBe('Could not update this relationship.')
    })

    it('surfaces duplicate retry conflicts from the API', () => {
      expect(
        relationshipEdgeSyncErrorMessage(
          new ApiError(409, 'idempotency_key_reused', 'Idempotency key was already used.'),
          { kind: 'add', relationshipId: createLocalRelationshipId(), requestId: 'req-1' },
          [],
          'Could not add this relationship.',
          'Could not update this relationship.',
          'Could not remove this relationship.',
        ),
      ).toBe('Idempotency key was already used.')
    })
  })

  describe('areEdgeSnapshotsEqual', () => {
    it('compares edge snapshots by id and revision', () => {
      expect(
        areEdgeSnapshotsEqual(
          [
            { relationshipId: 'a', revision: 1 },
            { relationshipId: 'b', revision: 2 },
          ],
          [
            { relationshipId: 'b', revision: 2 },
            { relationshipId: 'a', revision: 1 },
          ],
        ),
      ).toBe(true)
      expect(
        areEdgeSnapshotsEqual(
          [{ relationshipId: 'a', revision: 1 }],
          [{ relationshipId: 'a', revision: 2 }],
        ),
      ).toBe(false)
    })
  })
})
