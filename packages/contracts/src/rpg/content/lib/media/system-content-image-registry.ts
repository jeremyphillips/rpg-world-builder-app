import type { ContentSource } from '../envelope'
import type { ContentTypeKey } from '../../../primitives/content/content-type-keys'
import type { SourceDimensions } from '../../../primitives/media/geometry'
import {
  contentTypeSubject,
  systemImageEntryLookupKey,
  type SystemImageSubject,
  vocabularySetSubject,
} from '../../../primitives/media/system-image-subject'

export const SYSTEM_IMAGE_SET_IDS = ['srd-cc-5.2.1'] as const

export type SystemImageSetId = (typeof SYSTEM_IMAGE_SET_IDS)[number]

export const DEFAULT_SYSTEM_IMAGE_SET_ID: SystemImageSetId = 'srd-cc-5.2.1'

export const SYSTEM_CONTENT_IMAGE_ASSET_ROLES = ['primary', 'emblem'] as const

export type SystemContentImageAssetRole = (typeof SYSTEM_CONTENT_IMAGE_ASSET_ROLES)[number]

export const SYSTEM_CONTENT_IMAGE_EXTENSIONS = ['jpeg', 'png'] as const

export type SystemContentImageExtension = (typeof SYSTEM_CONTENT_IMAGE_EXTENSIONS)[number]

/** Shipped catalog artwork dimensions — 1200×896 JPEGs (four px short of 900). */
const STANDARD_SOURCE_DIMENSIONS: SourceDimensions = {
  width: 1200,
  height: 896,
}

/** Spell school emblem PNGs — square mono glyphs on alpha. */
const EMBLEM_SOURCE_DIMENSIONS: SourceDimensions = {
  width: 1254,
  height: 1254,
}

export const SYSTEM_CONTENT_IMAGE_PRESENTATION_TREATMENTS = [
  'default',
  'white-paper-knockout',
  'mono-glyph-invert',
] as const

export type SystemContentImagePresentationTreatment =
  (typeof SYSTEM_CONTENT_IMAGE_PRESENTATION_TREATMENTS)[number]

export type SystemContentImagePresentation = {
  treatment: SystemContentImagePresentationTreatment
}

export type SystemContentImageEntry = {
  imageSetId: SystemImageSetId
  subject: SystemImageSubject
  assetRole: SystemContentImageAssetRole
  slug: string
  extension: SystemContentImageExtension
  path: string
  sourceDimensions: SourceDimensions
  presentation: SystemContentImagePresentation
}

export type ResolvedSystemContentImage = {
  path: string
  sourceDimensions: SourceDimensions
  presentation: SystemContentImagePresentation
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

const SPELL_SCHOOL_EMBLEM_SLUGS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
] as const

const SYSTEM_IMAGE_SET_ID_SET = new Set<string>(SYSTEM_IMAGE_SET_IDS)

const WHITE_PAPER_KNOCKOUT_PRESENTATION: SystemContentImagePresentation = {
  treatment: 'white-paper-knockout',
}

const MONO_GLYPH_INVERT_PRESENTATION: SystemContentImagePresentation = {
  treatment: 'mono-glyph-invert',
}

export function buildSystemContentImagePath(input: {
  imageSetId: string
  subject: SystemImageSubject
  assetRole: string
  slug: string
  extension: SystemContentImageExtension
}): string {
  return `assets/system/${input.imageSetId}/${input.subject.key}/${input.assetRole}/${input.slug}.${input.extension}`
}

function buildPrimaryEntry(contentType: ContentTypeKey, slug: string): SystemContentImageEntry {
  const imageSetId = DEFAULT_SYSTEM_IMAGE_SET_ID
  const subject = contentTypeSubject(contentType)
  const assetRole = 'primary' as const
  const extension = 'jpeg' as const
  return {
    imageSetId,
    subject,
    assetRole,
    slug,
    extension,
    path: buildSystemContentImagePath({ imageSetId, subject, assetRole, slug, extension }),
    sourceDimensions: STANDARD_SOURCE_DIMENSIONS,
    presentation: WHITE_PAPER_KNOCKOUT_PRESENTATION,
  }
}

function buildSpellSchoolEmblemEntry(slug: string): SystemContentImageEntry {
  const imageSetId = DEFAULT_SYSTEM_IMAGE_SET_ID
  const subject = vocabularySetSubject('spell-schools')
  const assetRole = 'emblem' as const
  const extension = 'png' as const
  return {
    imageSetId,
    subject,
    assetRole,
    slug,
    extension,
    path: buildSystemContentImagePath({ imageSetId, subject, assetRole, slug, extension }),
    sourceDimensions: EMBLEM_SOURCE_DIMENSIONS,
    presentation: MONO_GLYPH_INVERT_PRESENTATION,
  }
}

const SYSTEM_CONTENT_IMAGE_ENTRIES: SystemContentImageEntry[] = [
  ...CLASS_PRIMARY_SLUGS.map((slug) => buildPrimaryEntry('classes', slug)),
  ...SPECIES_PRIMARY_SLUGS.map((slug) => buildPrimaryEntry('species', slug)),
  ...SPELL_SCHOOL_EMBLEM_SLUGS.map((slug) => buildSpellSchoolEmblemEntry(slug)),
]

const SYSTEM_CONTENT_IMAGE_ENTRY_LOOKUP = new Map<string, SystemContentImageEntry>(
  SYSTEM_CONTENT_IMAGE_ENTRIES.map((entry) => [
    systemImageEntryLookupKey({
      imageSetId: entry.imageSetId,
      subject: entry.subject,
      assetRole: entry.assetRole,
      slug: entry.slug,
    }),
    entry,
  ]),
)

export function isRegisteredSystemImageSetId(imageSetId: string): imageSetId is SystemImageSetId {
  return SYSTEM_IMAGE_SET_ID_SET.has(imageSetId)
}

export type SystemContentImageLookupInput = {
  imageSetId: string
  subject: SystemImageSubject
  assetRole: string
  slug: string
}

function lookupSystemContentImageEntry(
  input: SystemContentImageLookupInput,
): SystemContentImageEntry | undefined {
  if (!isRegisteredSystemImageSetId(input.imageSetId)) return undefined
  return SYSTEM_CONTENT_IMAGE_ENTRY_LOOKUP.get(
    systemImageEntryLookupKey({
      imageSetId: input.imageSetId,
      subject: input.subject,
      assetRole: input.assetRole,
      slug: input.slug,
    }),
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
  subject: SystemImageSubject
  assetRole: string
  slug: string
  contentSource: ContentSource
}): ResolvedSystemContentImage | undefined {
  if (input.contentSource !== 'system') return undefined
  const entry = lookupSystemContentImageEntry(input)
  if (!entry) return undefined
  return {
    path: entry.path,
    sourceDimensions: entry.sourceDimensions,
    presentation: entry.presentation,
  }
}

export function deriveSystemContentImage(
  input: SystemContentImageLookupInput,
): Pick<SystemContentImageEntry, 'imageSetId' | 'subject' | 'assetRole' | 'slug'> | undefined {
  const entry = lookupSystemContentImageEntry(input)
  if (!entry) return undefined
  return {
    imageSetId: entry.imageSetId,
    subject: entry.subject,
    assetRole: entry.assetRole,
    slug: entry.slug,
  }
}

export function resolveSystemContentImageSourceDimensions(
  input: SystemContentImageLookupInput,
): SourceDimensions | undefined {
  return lookupSystemContentImageEntry(input)?.sourceDimensions
}

export function resolveSystemContentImageSourceDimensionsFromPath(
  path: string,
): SourceDimensions | undefined {
  return SYSTEM_CONTENT_IMAGE_ENTRIES.find((entry) => entry.path === path)?.sourceDimensions
}

/** @deprecated Use {@link buildSystemContentImagePath} with a {@link SystemImageSubject}. */
export function buildLegacySystemContentImagePath(input: {
  imageSetId: string
  contentType: string
  assetRole: string
  slug: string
}): string {
  return buildSystemContentImagePath({
    imageSetId: input.imageSetId,
    subject: contentTypeSubject(input.contentType as ContentTypeKey),
    assetRole: input.assetRole,
    slug: input.slug,
    extension: 'jpeg',
  })
}
