import type { CampaignListItem, CampaignViewerState } from '@rpg/contracts'

export const VIEWER_STATE = {
  ready: { kind: 'ready' } satisfies CampaignViewerState,
  onboardingIncomplete: { kind: 'onboarding_incomplete' } satisfies CampaignViewerState,
  controlStale: (characterId = 'char_1'): CampaignViewerState => ({
    kind: 'control_stale',
    characterId,
  }),
  participationMissing: (characterId = 'char_1'): CampaignViewerState => ({
    kind: 'participation_missing',
    characterId,
  }),
  membershipInvalid: { kind: 'membership_invalid' } satisfies CampaignViewerState,
} as const

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
    controlledCharacterIds: [],
    openControlledCharacterIds: [],
    viewerState: VIEWER_STATE.ready,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
