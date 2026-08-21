import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApiError, LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES } from '@rpg/contracts'

import { ALDERMERE, DOCK_WARD, GREYSHORE, HARBORFORD, LOCATIONS_LIST } from '../../../fixtures'
import {
  applyBulkChangeParentToTargets,
  isBulkChangeParentNoOp,
  validateBulkChangeParent,
} from './bulk-change-parent-action.lib'

const updateContent = vi.fn()

vi.mock('../../../../lib/list/content-client', () => ({
  updateContent: (...args: unknown[]) => updateContent(...args),
}))

const campaignId = 'story-campaign'

const rows = [
  {
    id: DOCK_WARD.id,
    name: DOCK_WARD.name,
    kind: DOCK_WARD.kind,
    parentLocationId: DOCK_WARD.parentLocationId,
  },
  {
    id: HARBORFORD.id,
    name: HARBORFORD.name,
    kind: HARBORFORD.kind,
    parentLocationId: HARBORFORD.parentLocationId,
  },
]

describe('bulk-change-parent-action.lib', () => {
  beforeEach(() => {
    updateContent.mockReset()
    updateContent.mockResolvedValue({})
  })

  it('treats rows already at the target parent as no-ops', () => {
    expect(isBulkChangeParentNoOp(rows[0]!, { proposedParentId: HARBORFORD.id })).toBe(true)
    expect(isBulkChangeParentNoOp(rows[1]!, { proposedParentId: GREYSHORE.id })).toBe(true)
  })

  it('blocks descendant and self parent assignments during validation', () => {
    const result = validateBulkChangeParent(rows, { proposedParentId: DOCK_WARD.id }, [
      ...LOCATIONS_LIST,
    ])

    const harborford = result.targets.find((target) => target.targetId === HARBORFORD.id)
    expect(harborford?.status).toBe('blocked')
    if (harborford?.status === 'blocked') {
      expect(harborford.blockers[0]?.code).toBe('descendant_parent')
    }

    const dockWard = result.targets.find((target) => target.targetId === DOCK_WARD.id)
    expect(dockWard?.status).toBe('blocked')
    if (dockWard?.status === 'blocked') {
      expect(dockWard.blockers[0]?.code).toBe('self_parent')
    }
  })

  it('applies parent updates only to confirmed applicable rows', async () => {
    const { outcomes, updates } = await applyBulkChangeParentToTargets(
      rows,
      [HARBORFORD.id],
      { proposedParentId: ALDERMERE.id },
      campaignId,
    )

    expect(updateContent).toHaveBeenCalledWith(campaignId, 'locations', HARBORFORD.id, {
      kind: 'settlement',
      parentLocationId: ALDERMERE.id,
    })
    expect(outcomes).toEqual([{ status: 'updated', targetId: HARBORFORD.id }])
    expect(updates).toEqual([{ rowId: HARBORFORD.id, parentLocationId: ALDERMERE.id }])
  })

  it('sends null to clear a parent during apply', async () => {
    await applyBulkChangeParentToTargets(
      [rows[1]!],
      [HARBORFORD.id],
      { proposedParentId: null },
      campaignId,
    )

    expect(updateContent).toHaveBeenCalledWith(campaignId, 'locations', HARBORFORD.id, {
      kind: 'settlement',
      parentLocationId: null,
    })
  })

  it('reads blockerCode from API hierarchy errors', async () => {
    updateContent.mockRejectedValueOnce(
      new ApiError(
        400,
        'invalid_hierarchy',
        'A location cannot be moved under one of its descendants.',
        {
          blockerCode: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent,
        },
      ),
    )

    const { outcomes } = await applyBulkChangeParentToTargets(
      rows,
      [HARBORFORD.id],
      { proposedParentId: ALDERMERE.id },
      campaignId,
    )

    expect(outcomes).toEqual([
      {
        status: 'blocked',
        targetId: HARBORFORD.id,
        blockers: [
          expect.objectContaining({
            code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent,
          }),
        ],
      },
    ])
  })

  it('infers hierarchy codes from messages without defaulting to cycle', async () => {
    updateContent.mockRejectedValueOnce(
      new ApiError(400, 'invalid_hierarchy', 'Something unexpected.'),
    )

    const { outcomes } = await applyBulkChangeParentToTargets(
      rows,
      [HARBORFORD.id],
      { proposedParentId: ALDERMERE.id },
      campaignId,
    )

    expect(outcomes).toEqual([
      {
        status: 'blocked',
        targetId: HARBORFORD.id,
        blockers: [
          expect.objectContaining({
            code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.hierarchy_violation,
          }),
        ],
      },
    ])
  })
})
