import { describe, expect, it } from 'vitest'

import { createCharacterBuildContext } from './test-fixtures'
import {
  canWriteCharacterRelationships,
  isCharacterConnectionsStepApplicable,
} from './relationship-write'
import type { CampaignNpcBuildContext, CampaignPcBuildContext } from './context'

const TEST_CAMPAIGN_ID = 'camp_1'

function createCampaignNpcContext(): CampaignNpcBuildContext {
  return {
    ...createCharacterBuildContext({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
    }),
    characterKind: 'npc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
    rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
    ownershipTarget: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID },
    acquisition: { kind: 'campaign_npc', campaignId: TEST_CAMPAIGN_ID },
    playActor: { kind: 'npc' },
  } satisfies CampaignNpcBuildContext
}

function createCampaignPcContext(): CampaignPcBuildContext {
  return {
    ...createCharacterBuildContext({
      characterKind: 'pc',
      rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
    }),
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
    rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
    ownershipTarget: { type: 'user', userId: 'user_1' },
    acquisition: { kind: 'campaign_pc_onboarding', campaignId: TEST_CAMPAIGN_ID },
    playActor: { kind: 'new_pc' },
  } satisfies CampaignPcBuildContext
}

describe('character relationship write authorization', () => {
  it('allows campaign NPC authoring only', () => {
    expect(canWriteCharacterRelationships(createCampaignNpcContext())).toBe(true)
    expect(canWriteCharacterRelationships(createCharacterBuildContext())).toBe(false)
    expect(canWriteCharacterRelationships(createCampaignPcContext())).toBe(false)
    expect(isCharacterConnectionsStepApplicable(createCampaignNpcContext())).toBe(true)
    expect(isCharacterConnectionsStepApplicable(createCampaignPcContext())).toBe(false)
  })
})
