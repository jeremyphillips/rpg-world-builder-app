import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentTypeKey } from '../../rpg/primitives/content/content-type-keys'
import type { SourceDimensions } from './geometry'

export const SYSTEM_IMAGE_SET_IDS = ['srd-cc-5.2.1'] as const

export type SystemImageSetId = (typeof SYSTEM_IMAGE_SET_IDS)[number]

export const DEFAULT_SYSTEM_IMAGE_SET_ID: SystemImageSetId = 'srd-cc-5.2.1'

export const SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY = 'primary' as const

export type SystemContentImageAssetRole = typeof SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY

export const SYSTEM_CLASS_PRIMARY_SLUGS = [
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

export type SystemClassPrimarySlug = (typeof SYSTEM_CLASS_PRIMARY_SLUGS)[number]

/** Shipped catalog artwork dimensions — 1200×896 JPEGs (four px short of 900). */
export const SYSTEM_CLASS_PRIMARY_SOURCE_DIMENSIONS: SourceDimensions = {
  width: 1200,
  height: 896,
}

const SYSTEM_CLASS_PRIMARY_SLUG_SET = new Set<string>(SYSTEM_CLASS_PRIMARY_SLUGS)

const SYSTEM_IMAGE_SET_ID_SET = new Set<string>(SYSTEM_IMAGE_SET_IDS)

export function isRegisteredSystemImageSetId(imageSetId: string): imageSetId is SystemImageSetId {
  return SYSTEM_IMAGE_SET_ID_SET.has(imageSetId)
}

export function isRegisteredSystemClassPrimarySlug(slug: string): slug is SystemClassPrimarySlug {
  return SYSTEM_CLASS_PRIMARY_SLUG_SET.has(slug)
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

export function buildSystemContentImagePath(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
}): string {
  return `assets/system/${input.imageSetId}/${input.contentType}/${input.assetRole}/${input.slug}.jpeg`
}

export function resolveSystemContentImage(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
  contentSource: ContentSource
}): string | undefined {
  if (input.contentSource !== 'system') return undefined
  if (!isRegisteredSystemImageSetId(input.imageSetId)) return undefined
  if (input.contentType !== 'classes') return undefined
  if (input.assetRole !== SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY) return undefined
  if (!isRegisteredSystemClassPrimarySlug(input.slug)) return undefined

  return buildSystemContentImagePath(input)
}

export function hasRegisteredSystemClassPrimary(input: {
  imageSetId: string
  slug: string
  contentSource: ContentSource
}): boolean {
  return (
    resolveSystemContentImage({
      imageSetId: input.imageSetId,
      contentType: 'classes',
      assetRole: SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY,
      slug: input.slug,
      contentSource: input.contentSource,
    }) !== undefined
  )
}

export function deriveSystemClassPrimarySource(input: { imageSetId: string; slug: string }):
  | {
      imageSetId: SystemImageSetId
      contentType: ContentTypeKey
      assetRole: SystemContentImageAssetRole
      slug: SystemClassPrimarySlug
    }
  | undefined {
  if (!isRegisteredSystemImageSetId(input.imageSetId)) return undefined
  if (!isRegisteredSystemClassPrimarySlug(input.slug)) return undefined

  return {
    imageSetId: input.imageSetId,
    contentType: 'classes',
    assetRole: SYSTEM_CONTENT_IMAGE_ASSET_ROLE_PRIMARY,
    slug: input.slug,
  }
}
