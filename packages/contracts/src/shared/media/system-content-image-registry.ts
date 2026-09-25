import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentTypeKey } from '../../rpg/primitives/content/content-type-keys'
import type { SourceDimensions } from './geometry'

export const SYSTEM_IMAGE_SET_IDS = ['srd-cc-5.2.1'] as const

export type SystemImageSetId = (typeof SYSTEM_IMAGE_SET_IDS)[number]

export const DEFAULT_SYSTEM_IMAGE_SET_ID: SystemImageSetId = 'srd-cc-5.2.1'

export const SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY = 'primary' as const

export type SystemContentImageAssetRole = typeof SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY

/** Shipped catalog artwork dimensions — 1200×896 JPEGs (four px short of 900). */
const STANDARD_SOURCE_DIMENSIONS: SourceDimensions = {
  width: 1200,
  height: 896,
}

export type SystemContentImageEntry = {
  imageSetId: SystemImageSetId
  contentType: ContentTypeKey
  assetRole: SystemContentImageAssetRole
  slug: string
  path: string
  sourceDimensions: SourceDimensions
}

const CLASS_PRIMARY_SLUGS = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
] as const

const SPECIES_PRIMARY_SLUGS = [
  'dragonborn',
  'dwarf',
  'elf',
  'gnome',
  'goliath',
  'halfling',
  'human',
  'orc',
  'tiefling',
] as const

const SYSTEM_IMAGE_SET_ID_SET = new Set<string>(SYSTEM_IMAGE_SET_IDS)

function buildEntry(contentType: ContentTypeKey, slug: string): SystemContentImageEntry {
  const imageSetId = DEFAULT_SYSTEM_IMAGE_SET_ID
  const assetRole = SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY
  return {
    imageSetId,
    contentType,
    assetRole,
    slug,
    path: buildSystemContentImagePath({ imageSetId, contentType, assetRole, slug }),
    sourceDimensions: STANDARD_SOURCE_DIMENSIONS,
  }
}

const SYSTEM_CONTENT_IMAGE_ENTRIES: SystemContentImageEntry[] = [
  ...CLASS_PRIMARY_SLUGS.map((slug) => buildEntry('classes', slug)),
  ...SPECIES_PRIMARY_SLUGS.map((slug) => buildEntry('species', slug)),
]

const SYSTEM_CONTENT_IMAGE_ENTRY_LOOKUP = new Map<string, SystemContentImageEntry>(
  SYSTEM_CONTENT_IMAGE_ENTRIES.map((entry) => [
    `${entry.imageSetId}:${entry.contentType}:${entry.assetRole}:${entry.slug}`,
    entry,
  ]),
)

export function isRegisteredSystemImageSetId(imageSetId: string): imageSetId is SystemImageSetId {
  return SYSTEM_IMAGE_SET_ID_SET.has(imageSetId)
}

export function buildSystemContentImagePath(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
}): string {
  return `assets/system/${input.imageSetId}/${input.contentType}/${input.assetRole}/${input.slug}.jpeg`
}

function lookupSystemContentImageEntry(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
}): SystemContentImageEntry | undefined {
  if (!isRegisteredSystemImageSetId(input.imageSetId)) return undefined
  return SYSTEM_CONTENT_IMAGE_ENTRY_LOOKUP.get(
    `${input.imageSetId}:${input.contentType}:${input.assetRole}:${input.slug}`,
  )
}

export function resolveContentImageSet(input: {
  campaignImageSetId?: string
  rulesetId?: string
}): SystemImageSetId {
  if (input.campaignImageSetId && isRegisteredSystemImageSetId(input.campaignImageSetId)) {
    return input.campaignImageSetId
  }
  if (input.rulesetId && isRegisteredSystemImageSetId(input.rulesetId)) {
    return input.rulesetId
  }
  return DEFAULT_SYSTEM_IMAGE_SET_ID
}

export function resolveSystemContentImage(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
  contentSource: ContentSource
}): string | undefined {
  if (input.contentSource !== 'system') return undefined
  return lookupSystemContentImageEntry(input)?.path
}

export function deriveSystemContentImage(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
}): Pick<SystemContentImageEntry, 'imageSetId' | 'contentType' | 'assetRole' | 'slug'> | undefined {
  const entry = lookupSystemContentImageEntry(input)
  if (!entry) return undefined
  return {
    imageSetId: entry.imageSetId,
    contentType: entry.contentType,
    assetRole: entry.assetRole,
    slug: entry.slug,
  }
}

export function resolveSystemContentImageSourceDimensions(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
}): SourceDimensions | undefined {
  return lookupSystemContentImageEntry(input)?.sourceDimensions
}

export function resolveSystemContentImageSourceDimensionsFromPath(
  path: string,
): SourceDimensions | undefined {
  return SYSTEM_CONTENT_IMAGE_ENTRIES.find((entry) => entry.path === path)?.sourceDimensions
}
