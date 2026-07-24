import type { CampaignListItem } from '@rpg/contracts'

export function makeCampaignListItem(overrides: Partial<CampaignListItem> = {}): CampaignListItem {
  return {
    id: 'c1',
    identity: { name: 'Test Campaign' },
    configuration: {},
    status: 'active',
    visibility: 'private',
    rulesetId: 'srd-cc-5.2.1',
    createdBy: 'u1',
    campaignRole: 'owner',
    characterIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
