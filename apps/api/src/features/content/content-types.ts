import {
  API_CONTENT_TYPE_KEYS,
  HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS,
  type ApiContentTypeKey,
  type CatalogOverlayListFailure,
  type HomebrewSummaryContentType,
} from '@rpg/contracts'

import { classRegistration } from './classes/classes.config'
import {
  resolveClassesForCampaign,
  resolveClassesListForCampaign,
} from './classes/derive-classes-catalog'
import { resolveCatalogForCampaign, resolveContentListForCampaign } from './content.service'
import { equipmentRegistration } from './equipment/equipment.config'
import { featRegistration } from './feats/feats.config'
import type { ContentTypeConfig } from './lib/content-type-config'
import type { ContentWriteConfig, WriteEntityBase } from './lib/content-write-config'
import { organizationRegistration } from './organizations/organizations.config'
import { locationRegistration } from './locations/locations.config'
import { skillProficiencyRegistration } from './skill-proficiencies/skill-proficiencies.config'
import { speciesRegistration } from './species/species.config'
import { spellRegistration } from './spells/spells.config'
import { monstersRegistration } from './monsters/monsters.config'

type CampaignListResolution<T extends WriteEntityBase> = {
  items: T[]
  overlayFailures: CatalogOverlayListFailure[]
}

/** Pair custom campaign resolvers — list resolution must surface overlay failures. */
export type CampaignResolverOverrides<T extends WriteEntityBase = WriteEntityBase> = {
  resolveForCampaign: (campaignId: string) => Promise<T[]>
  resolveListForCampaign: (campaignId: string) => Promise<CampaignListResolution<T>>
}

/** Bundled read + write wiring for one content type — the single extension point. */
export type ContentTypeRegistration<T extends WriteEntityBase = WriteEntityBase> = {
  read: ContentTypeConfig<T>
  write: ContentWriteConfig<T>
} & (
  | { resolveForCampaign?: undefined; resolveListForCampaign?: undefined }
  | CampaignResolverOverrides<T>
)

/**
 * The registry of content types. Adding a new type means authoring its
 * `*.config.ts` registration and adding one entry here — the kernel handles the rest.
 */
const CONTENT_TYPES = {
  classes: {
    ...classRegistration,
    resolveForCampaign: resolveClassesForCampaign,
    resolveListForCampaign: resolveClassesListForCampaign,
  },
  equipment: equipmentRegistration,
  organizations: organizationRegistration,
  locations: locationRegistration,
  'skill-proficiencies': skillProficiencyRegistration,
  species: speciesRegistration,
  spells: spellRegistration,
  feats: featRegistration,
  monsters: monstersRegistration,
} as const satisfies Record<ApiContentTypeKey, ContentTypeRegistration>

export type ContentTypeName = keyof typeof CONTENT_TYPES

export function getContentTypeConfig<K extends ContentTypeName>(
  type: K,
): (typeof CONTENT_TYPES)[K]['read'] {
  return CONTENT_TYPES[type].read
}

export function getContentWriteConfig(type: string): ContentWriteConfig<never> | undefined {
  if (!(type in CONTENT_TYPES)) return undefined
  return CONTENT_TYPES[type as ContentTypeName].write as ContentWriteConfig<never>
}

export function isContentWriteType(type: string): type is ContentTypeName {
  return type in CONTENT_TYPES
}

export function isContentTypeName(type: string): type is ContentTypeName {
  return isContentWriteType(type)
}

/** Resolve a campaign catalog for one content type (uses per-type override when set). */
export async function resolveContentForCampaign(
  type: ContentTypeName,
  campaignId: string,
): Promise<WriteEntityBase[]> {
  const reg = CONTENT_TYPES[type] as ContentTypeRegistration
  if (reg.resolveForCampaign) {
    return reg.resolveForCampaign(campaignId)
  }
  return resolveCatalogForCampaign(reg.read, campaignId)
}

/** List route kernel: entities plus overlay failures omitted from `items`. */
export async function resolveContentListForCampaignType(
  type: ContentTypeName,
  campaignId: string,
): Promise<CampaignListResolution<WriteEntityBase>> {
  const reg = CONTENT_TYPES[type] as ContentTypeRegistration
  if (reg.resolveListForCampaign) {
    return reg.resolveListForCampaign(campaignId)
  }
  return resolveContentListForCampaign(reg.read, campaignId)
}

export { API_CONTENT_TYPE_KEYS, HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS }
export type { HomebrewSummaryContentType }
