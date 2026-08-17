import type { Campaign, CampaignListItem, CampaignViewerState } from '@rpg/contracts'

import { CONTENT_TIMESTAMP, STORY_RULESET_ID } from '../../constants'

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

/** Canonical campaign entity — single owner of Campaign field defaults. */
export function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  const id = overrides.id ?? 'c1'

  return {
    id,
    identity: { name: 'Test Campaign', ...overrides.identity },
    configuration: overrides.configuration ?? {},
    status: overrides.status ?? 'active',
    visibility: overrides.visibility ?? 'private',
    rulesetId: overrides.rulesetId ?? STORY_RULESET_ID,
    createdBy: overrides.createdBy ?? 'u1',
    createdAt: overrides.createdAt ?? CONTENT_TIMESTAMP,
    updatedAt: overrides.updatedAt ?? CONTENT_TIMESTAMP,
    ...overrides,
  }
}

/** List projection — composes from makeCampaign + list-specific fields. */
export function makeCampaignListItem(overrides: Partial<CampaignListItem> = {}): CampaignListItem {
  const base = makeCampaign(overrides)

  return {
    ...base,
    campaignRole: overrides.campaignRole ?? 'owner',
    controlledCharacterIds: overrides.controlledCharacterIds ?? [],
    openControlledCharacterIds: overrides.openControlledCharacterIds ?? [],
    viewerState: overrides.viewerState ?? VIEWER_STATE.ready,
    ...overrides,
  }
}
