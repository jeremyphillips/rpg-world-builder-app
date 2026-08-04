export const USAGE_BLOCKER_SOURCE_KEYS = {
  character_usage: 'character_usage',
  location_parent: 'location_parent',
  campaign_primary_world: 'campaign_primary_world',
  unknown: 'unknown',
} as const

export type UsageBlockerSourceKey =
  (typeof USAGE_BLOCKER_SOURCE_KEYS)[keyof typeof USAGE_BLOCKER_SOURCE_KEYS]

export const USAGE_BLOCKER_SOURCE_KEY_VALUES = [
  USAGE_BLOCKER_SOURCE_KEYS.character_usage,
  USAGE_BLOCKER_SOURCE_KEYS.location_parent,
  USAGE_BLOCKER_SOURCE_KEYS.campaign_primary_world,
  USAGE_BLOCKER_SOURCE_KEYS.unknown,
] as const satisfies readonly UsageBlockerSourceKey[]
