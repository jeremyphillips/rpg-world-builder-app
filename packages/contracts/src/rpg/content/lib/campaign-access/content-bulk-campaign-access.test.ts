import { describe, expect, it } from 'vitest'

import { ACTION_PLAN_UNCHANGED_REASONS } from '../../../../lib/action-validation'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from './campaign-access'
import {
  applyBulkCampaignAccessOperations,
  BULK_CAMPAIGN_ACCESS_FORM_DEFAULT,
  buildBulkCampaignAccessPlan,
  countBulkCampaignAccessChanges,
  hasBulkCampaignAccessChanges,
  isBulkCampaignAccessNoOp,
  resolveBulkCampaignAccessUnchangedReason,
  type BulkCampaignAccessFormValues,
} from './content-bulk-campaign-access'

const baseAccess = {
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  visibilityMode: 'dm_only' as const,
  effectiveAudience: 'dm_only' as const,
}

describe('applyBulkCampaignAccessOperations', () => {
  it('keeps current values for unchanged operations', () => {
    expect(
      applyBulkCampaignAccessOperations(baseAccess, BULK_CAMPAIGN_ACCESS_FORM_DEFAULT),
    ).toEqual({
      available: true,
      visibilityMode: 'dm_only',
      participantIds: [],
    })
  })

  it('applies set operations', () => {
    const bulk: BulkCampaignAccessFormValues = {
      available: { kind: 'set', value: false },
      visibilityMode: { kind: 'set', value: 'all_players' },
    }

    expect(applyBulkCampaignAccessOperations(baseAccess, bulk)).toEqual({
      available: false,
      visibilityMode: 'all_players',
      participantIds: [],
    })
  })

  it('applies reset operations to defaults', () => {
    const bulk: BulkCampaignAccessFormValues = {
      available: { kind: 'reset' },
      visibilityMode: { kind: 'reset' },
    }

    expect(applyBulkCampaignAccessOperations(baseAccess, bulk)).toEqual({
      available: DEFAULT_CONTENT_CAMPAIGN_ACCESS.available,
      visibilityMode: DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode,
      participantIds: [],
    })
  })

  it('clears participantIds when visibility mode is not specific_players', () => {
    const access = {
      ...baseAccess,
      visibilityMode: 'specific_players' as const,
      participantIds: ['pc-1'],
      effectiveAudience: 'specific_players' as const,
    }

    const bulk: BulkCampaignAccessFormValues = {
      available: { kind: 'unchanged' },
      visibilityMode: { kind: 'set', value: 'all_players' },
    }

    expect(applyBulkCampaignAccessOperations(access, bulk)).toEqual({
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
    })
  })
})

describe('countBulkCampaignAccessChanges', () => {
  it('counts deterministic preview rows', () => {
    const bulk: BulkCampaignAccessFormValues = {
      available: { kind: 'set', value: false },
      visibilityMode: { kind: 'unchanged' },
    }

    expect(
      countBulkCampaignAccessChanges(
        [
          { campaignAccess: baseAccess },
          {
            campaignAccess: {
              ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
              available: false,
              effectiveAudience: 'none',
            },
          },
        ],
        bulk,
      ),
    ).toEqual({ wouldChangeCount: 1, unchangedCount: 1 })
  })
})

describe('bulk campaign access helpers', () => {
  it('detects no-op patches', () => {
    expect(isBulkCampaignAccessNoOp(baseAccess, BULK_CAMPAIGN_ACCESS_FORM_DEFAULT)).toBe(true)
  })

  it('detects when bulk form has changes', () => {
    expect(hasBulkCampaignAccessChanges(BULK_CAMPAIGN_ACCESS_FORM_DEFAULT)).toBe(false)
    expect(
      hasBulkCampaignAccessChanges({
        available: { kind: 'set', value: false },
        visibilityMode: { kind: 'unchanged' },
      }),
    ).toBe(true)
  })

  it('resolves unchanged reasons for availability-only no-ops', () => {
    const bulk: BulkCampaignAccessFormValues = {
      available: { kind: 'set', value: true },
      visibilityMode: { kind: 'unchanged' },
    }

    expect(resolveBulkCampaignAccessUnchangedReason(baseAccess, bulk)).toBe(
      ACTION_PLAN_UNCHANGED_REASONS.already_available,
    )
  })

  it('builds plan targets with structured unchanged reasons', () => {
    const bulk: BulkCampaignAccessFormValues = {
      available: { kind: 'set', value: false },
      visibilityMode: { kind: 'unchanged' },
    }

    const plan = buildBulkCampaignAccessPlan(
      [
        {
          targetId: 'a',
          targetName: 'Alpha',
          campaignAccess: baseAccess,
        },
        {
          targetId: 'b',
          targetName: 'Beta',
          campaignAccess: {
            ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
            available: false,
            effectiveAudience: 'none',
          },
        },
      ],
      bulk,
    )

    expect(plan.targets).toEqual([
      { status: 'wouldChange', targetId: 'a', targetName: 'Alpha' },
      {
        status: 'unchanged',
        targetId: 'b',
        targetName: 'Beta',
        reason: ACTION_PLAN_UNCHANGED_REASONS.already_unavailable,
      },
    ])
  })
})
