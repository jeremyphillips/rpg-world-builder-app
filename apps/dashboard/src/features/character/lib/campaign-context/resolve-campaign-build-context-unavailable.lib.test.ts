import { describe, expect, it } from 'vitest'

import type { CampaignBuildContext } from '@rpg/contracts'

import { resolveCampaignBuildContextUnavailable } from './resolve-campaign-build-context-unavailable.lib'

const readyContext = { characterKind: 'npc' } as CampaignBuildContext

describe('resolveCampaignBuildContextUnavailable', () => {
  it('returns null when context is ready', () => {
    expect(
      resolveCampaignBuildContextUnavailable({
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
        isPending: false,
        hasPatch: true,
        hasCatalog: true,
        characterKind: 'npc',
        ownershipTarget: { type: 'campaign', campaignId: 'camp-1' },
        acquisition: { kind: 'campaign_npc', campaignId: 'camp-1' },
        context: readyContext,
      }),
    ).toBeNull()
  })

  it('reports loading while dependencies are pending', () => {
    expect(
      resolveCampaignBuildContextUnavailable({
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
        isPending: true,
        hasPatch: false,
        hasCatalog: false,
        characterKind: 'npc',
        ownershipTarget: { type: 'campaign', campaignId: 'camp-1' },
        acquisition: { kind: 'campaign_npc', campaignId: 'camp-1' },
        context: null,
      })?.kind,
    ).toBe('loading')
  })

  it('reports missing ids and invalid acquisition combos', () => {
    expect(
      resolveCampaignBuildContextUnavailable({
        campaignId: undefined,
        rulesetId: undefined,
        isPending: false,
        hasPatch: false,
        hasCatalog: false,
        characterKind: 'npc',
        ownershipTarget: { type: 'campaign', campaignId: 'camp-1' },
        acquisition: { kind: 'campaign_npc', campaignId: 'camp-1' },
        context: null,
      }),
    ).toEqual({ kind: 'missing_campaign_id' })

    expect(
      resolveCampaignBuildContextUnavailable({
        campaignId: 'camp-1',
        rulesetId: undefined,
        isPending: false,
        hasPatch: true,
        hasCatalog: true,
        characterKind: 'npc',
        ownershipTarget: { type: 'campaign', campaignId: 'camp-1' },
        acquisition: { kind: 'campaign_npc', campaignId: 'camp-1' },
        context: null,
      }),
    ).toEqual({ kind: 'missing_ruleset' })

    expect(
      resolveCampaignBuildContextUnavailable({
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
        isPending: false,
        hasPatch: true,
        hasCatalog: true,
        characterKind: 'pc',
        ownershipTarget: { type: 'user' },
        acquisition: { kind: 'campaign_pc_onboarding', campaignId: 'camp-1' },
        context: null,
      }),
    ).toEqual({ kind: 'missing_session_user' })

    expect(
      resolveCampaignBuildContextUnavailable({
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
        isPending: false,
        hasPatch: true,
        hasCatalog: true,
        characterKind: 'pc',
        ownershipTarget: { type: 'user', userId: 'user-1' },
        acquisition: { kind: 'campaign_npc', campaignId: 'camp-1' },
        context: null,
      }),
    ).toEqual({
      kind: 'invalid_acquisition_combo',
      characterKind: 'pc',
      acquisitionKind: 'campaign_npc',
    })
  })
})
