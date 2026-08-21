import type { OrganizationAuthoringPresetId } from './authoring-preset'

/** Minimal discoverable class row for preset slug → id seeding. */
export type OrganizationPresetMemberClassSeedTarget = {
  readonly id: string
  readonly slug: string
}

/** Ephemeral slug seeds for familiar-type member class affinities — resolved to ids at apply time. */
export const ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES = {
  academy: ['wizard'],
  assassins_order: ['rogue'],
  bounty_hunters: ['ranger', 'rogue'],
  church: ['cleric'],
  city_watch: ['fighter', 'ranger'],
  druid_circle: ['druid'],
  explorers_society: ['ranger'],
  hospital_order: ['cleric', 'paladin'],
  inquisition: ['cleric', 'paladin'],
  intelligence_bureau: ['rogue'],
  knightly_order: ['fighter', 'paladin'],
  mage_college: ['wizard', 'sorcerer'],
  mercenary_company: ['fighter', 'barbarian', 'ranger'],
  missionary_society: ['cleric'],
  pirate_crew: ['fighter', 'rogue'],
  private_security_company: ['fighter'],
  religious_order: ['cleric', 'paladin', 'monk'],
  spy_ring: ['rogue'],
  theater_troupe: ['bard'],
  thieves_guild: ['rogue'],
} as const satisfies Partial<Record<OrganizationAuthoringPresetId, readonly string[]>>

export type OrganizationPresetMemberClassAffinityPresetId =
  keyof typeof ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES

/** Maps preset slug seeds to discoverable class ids; skips slugs with no available row. */
export function resolveOrganizationPresetMemberClassAffinityIds(
  presetId: OrganizationAuthoringPresetId,
  availableClasses: readonly OrganizationPresetMemberClassSeedTarget[],
): string[] {
  const slugs =
    ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES[
      presetId as OrganizationPresetMemberClassAffinityPresetId
    ]
  if (!slugs) return []

  const availableBySlug = new Map(
    availableClasses.map((characterClass) => [characterClass.slug, characterClass]),
  )
  const ids: string[] = []

  for (const slug of slugs) {
    const characterClass = availableBySlug.get(slug)
    if (characterClass) ids.push(characterClass.id)
  }

  return ids
}
