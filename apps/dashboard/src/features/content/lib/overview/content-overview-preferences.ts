import type { ContentTypeKey } from '@rpg/contracts'
import type { ColumnChangeState } from '@rpg/ui'

import {
  createOverviewPreferences,
  type OverviewPreferencesColumnSchema,
} from '@/lib/overview-preferences'

export const CONTENT_OVERVIEW_PREFERENCES_VERSION = 2 as const
export const CONTENT_OVERVIEW_PREFERENCES_KEY_PREFIX = 'rpg:overview:v2:'

export const CONTENT_OVERVIEW_PAGE_SIZES = [10, 20, 50, 100] as const
export type ContentOverviewPageSize = (typeof CONTENT_OVERVIEW_PAGE_SIZES)[number]

export const DATA_TABLE_DENSITIES = ['comfortable', 'compact'] as const
export type DataTableDensity = (typeof DATA_TABLE_DENSITIES)[number]

export type ContentOverviewPreferences = {
  version: typeof CONTENT_OVERVIEW_PREFERENCES_VERSION
  columnVisibility?: ColumnChangeState['visibility']
  columnOrder?: string[]
  pageSize?: ContentOverviewPageSize
  density?: DataTableDensity
  advancedOpen?: boolean
}

export type ContentOverviewColumnSchema = OverviewPreferencesColumnSchema

export type ContentOverviewPreferencesDefaults = Omit<ContentOverviewPreferences, 'version'>

export const CONTENT_OVERVIEW_PREFERENCES_DEFAULTS: ContentOverviewPreferencesDefaults = {
  pageSize: 20,
  density: 'comfortable',
  advancedOpen: false,
}

/** Persisted column id for overview thumbnails (`buildContentColumns`). */
export const CONTENT_OVERVIEW_DISPLAY_IMAGE_COLUMN_ID = 'overview-display-image'

const LEGACY_CONTENT_OVERVIEW_IMAGE_COLUMN_ID = 'image'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeStoredContentOverviewPreferencesRaw(raw: unknown): unknown {
  if (!isRecord(raw)) return raw

  const next: Record<string, unknown> = { ...raw }

  if (Array.isArray(raw.columnOrder)) {
    next.columnOrder = raw.columnOrder.map((id) =>
      id === LEGACY_CONTENT_OVERVIEW_IMAGE_COLUMN_ID
        ? CONTENT_OVERVIEW_DISPLAY_IMAGE_COLUMN_ID
        : id,
    )
  }

  if (isRecord(raw.columnVisibility)) {
    const visibility = { ...raw.columnVisibility }
    if (
      LEGACY_CONTENT_OVERVIEW_IMAGE_COLUMN_ID in visibility &&
      !(CONTENT_OVERVIEW_DISPLAY_IMAGE_COLUMN_ID in visibility)
    ) {
      visibility[CONTENT_OVERVIEW_DISPLAY_IMAGE_COLUMN_ID] =
        visibility[LEGACY_CONTENT_OVERVIEW_IMAGE_COLUMN_ID]
    }
    delete visibility[LEGACY_CONTENT_OVERVIEW_IMAGE_COLUMN_ID]
    next.columnVisibility = visibility
  }

  return next
}

const contentOverviewPreferencesStore = createOverviewPreferences({
  keyPrefix: CONTENT_OVERVIEW_PREFERENCES_KEY_PREFIX,
  version: CONTENT_OVERVIEW_PREFERENCES_VERSION,
  defaults: CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
  pageSizes: CONTENT_OVERVIEW_PAGE_SIZES,
  parseExtras: (raw) => {
    const density =
      typeof raw.density === 'string' &&
      DATA_TABLE_DENSITIES.includes(raw.density as DataTableDensity)
        ? (raw.density as DataTableDensity)
        : undefined

    return { density }
  },
  validateExtras: (raw, parsed: Partial<Pick<ContentOverviewPreferences, 'density'>>) => {
    if (raw.density !== undefined && parsed.density === undefined) return false
    return true
  },
})

export function contentOverviewPreferencesKey(contentTypeKey: ContentTypeKey): string {
  return contentOverviewPreferencesStore.preferencesKey(contentTypeKey)
}

export function readStoredContentOverviewPreferences(
  contentTypeKey: ContentTypeKey,
): unknown | null {
  return contentOverviewPreferencesStore.readStored(contentTypeKey)
}

export function writeStoredContentOverviewPreferences(
  contentTypeKey: ContentTypeKey,
  preferences: ContentOverviewPreferences,
): void {
  contentOverviewPreferencesStore.writeStored(contentTypeKey, preferences)
}

/** Validates and sanitizes stored preferences. Returns `null` when the payload is invalid. */
export function validateContentOverviewPreferences(
  raw: unknown,
  columnSchema: ContentOverviewColumnSchema,
): ContentOverviewPreferences | null {
  return contentOverviewPreferencesStore.validate(
    normalizeStoredContentOverviewPreferencesRaw(raw),
    columnSchema,
  )
}

export function createDefaultContentOverviewPreferences(
  defaults: ContentOverviewPreferencesDefaults = CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
): ContentOverviewPreferences {
  return contentOverviewPreferencesStore.createDefault(defaults)
}

/** Reads and sanitizes stored preferences, falling back to defaults when invalid. */
export function hydrateContentOverviewPreferences(
  contentTypeKey: ContentTypeKey,
  columnSchema: ContentOverviewColumnSchema,
  defaults: ContentOverviewPreferencesDefaults = CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
): ContentOverviewPreferences {
  const stored = readStoredContentOverviewPreferences(contentTypeKey)
  if (stored === null) {
    return createDefaultContentOverviewPreferences(defaults)
  }

  const validated = validateContentOverviewPreferences(stored, columnSchema)
  if (!validated) {
    return createDefaultContentOverviewPreferences(defaults)
  }

  return {
    ...createDefaultContentOverviewPreferences(defaults),
    ...validated,
    version: CONTENT_OVERVIEW_PREFERENCES_VERSION,
  }
}

export function persistContentOverviewPreferences(
  contentTypeKey: ContentTypeKey,
  preferences: ContentOverviewPreferences,
): void {
  contentOverviewPreferencesStore.persist(contentTypeKey, preferences)
}
