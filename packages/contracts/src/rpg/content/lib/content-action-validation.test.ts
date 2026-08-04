import { describe, expect, it } from 'vitest'

import {
  mapContentCampaignAccessUpdateResultToApplyOutcome,
  mapSingleUsageGuardAvailabilityToValidationResult,
  mapUsageGuardAvailabilityBatchToValidationResult,
  mapUsageGuardAvailabilityToActionTarget,
} from './content-action-validation'

describe('content action validation adapters', () => {
  it('maps allowed availability to eligible targets', () => {
    expect(
      mapUsageGuardAvailabilityToActionTarget(
        { targetId: 'feat_1', targetName: 'Alert' },
        { status: 'allowed' },
      ),
    ).toEqual({
      status: 'eligible',
      targetId: 'feat_1',
      targetName: 'Alert',
    })
  })

  it('maps blocked availability to blocked targets with usage blockers', () => {
    const target = mapUsageGuardAvailabilityToActionTarget(
      { targetId: 'feat_1', targetName: 'Alert' },
      {
        status: 'blocked',
        blockers: [
          {
            kind: 'usage',
            usage: {
              kind: 'character',
              id: 'pc_1',
              label: 'Aldric',
              characterType: 'pc',
            },
          },
        ],
      },
    )

    expect(target.status).toBe('blocked')
    if (target.status === 'blocked') {
      expect(target.blockers).toHaveLength(1)
    }
  })

  it('normalizes single availability responses to one-target validation results', () => {
    const result = mapSingleUsageGuardAvailabilityToValidationResult(
      { targetId: 'feat_1', targetName: 'Alert' },
      { status: 'allowed' },
    )

    expect(result.targets).toHaveLength(1)
    expect(result.targets[0]?.status).toBe('eligible')
  })

  it('maps batch availability entries to validation results', () => {
    const result = mapUsageGuardAvailabilityBatchToValidationResult([
      {
        target: { targetId: 'a', targetName: 'Alpha' },
        availability: { status: 'allowed' },
      },
      {
        target: { targetId: 'b', targetName: 'Beta' },
        availability: {
          status: 'blocked',
          blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
        },
      },
    ])

    expect(result.targets.map((target) => target.status)).toEqual(['eligible', 'blocked'])
  })

  it('maps authoritative campaign access update results to apply outcomes', () => {
    expect(
      mapContentCampaignAccessUpdateResultToApplyOutcome('feat_1', {
        status: 'updated',
        campaignAccess: {
          available: false,
          visibilityMode: 'dm_only',
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'none',
        },
      }),
    ).toEqual({ status: 'updated', targetId: 'feat_1' })

    expect(
      mapContentCampaignAccessUpdateResultToApplyOutcome('feat_1', {
        status: 'blocked',
        blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
      }).status,
    ).toBe('blocked')
  })
})
