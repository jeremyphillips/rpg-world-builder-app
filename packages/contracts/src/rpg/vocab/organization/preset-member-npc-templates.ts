import type { NpcTemplateId } from '../npc/npc-template'
import type { OrganizationAuthoringPresetId } from './authoring-preset'

/**
 * Default NPC role seeded onto an organization when a familiar starting point is applied.
 * Titles with their own recommendation still win. Presets omitted here have no default role.
 */
export const ORGANIZATION_PRESET_MEMBER_NPC_TEMPLATES = {
  academy: 'scholar',
  adventurers_guild: 'guard',
  army: 'guard',
  assassins_order: 'criminal',
  bank: 'merchant',
  bounty_hunters: 'guard',
  brewery: 'artisan',
  caravan_company: 'merchant',
  charitable_foundation: 'commoner',
  church: 'priest',
  city_council: 'commoner',
  city_watch: 'guard',
  counterfeiting_ring: 'criminal',
  craft_guild: 'artisan',
  cult: 'priest',
  druid_circle: 'scout',
  explorers_society: 'scout',
  farming_cooperative: 'commoner',
  fencing_network: 'criminal',
  fraternal_lodge: 'commoner',
  gang: 'criminal',
  government_ministry: 'commoner',
  hospital_order: 'priest',
  inquisition: 'priest',
  intelligence_bureau: 'criminal',
  knightly_order: 'guard',
  labor_union: 'commoner',
  logging_company: 'commoner',
  mage_college: 'scholar',
  mercenary_company: 'guard',
  merchant_house: 'merchant',
  militia: 'guard',
  mining_company: 'commoner',
  missionary_society: 'priest',
  mutual_aid_society: 'commoner',
  navy: 'guard',
  pirate_crew: 'criminal',
  political_party: 'commoner',
  private_security_company: 'guard',
  protection_racket: 'criminal',
  religious_order: 'priest',
  scholarly_society: 'scholar',
  shipping_company: 'merchant',
  shipyard: 'artisan',
  smuggling_ring: 'criminal',
  spy_ring: 'criminal',
  theater_troupe: 'commoner',
  thieves_guild: 'criminal',
  trading_company: 'merchant',
  university: 'scholar',
} as const satisfies Partial<Record<OrganizationAuthoringPresetId, NpcTemplateId>>

export type OrganizationPresetMemberNpcTemplatePresetId =
  keyof typeof ORGANIZATION_PRESET_MEMBER_NPC_TEMPLATES

export function resolveOrganizationPresetMemberNpcTemplateId(
  presetId: OrganizationAuthoringPresetId,
): NpcTemplateId | undefined {
  return ORGANIZATION_PRESET_MEMBER_NPC_TEMPLATES[
    presetId as OrganizationPresetMemberNpcTemplatePresetId
  ]
}
