import type { ContentTypeKey } from '@rpg/contracts'
import type { ColumnChangeState } from '@rpg/ui'

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

export type ContentOverviewColumnSchema = {
  /** User-facing column ids in schema definition order. */
  ids: readonly string[]
  /** Column ids that must remain visible. */
  lockedIds?: readonly string[]
}

export type ContentOverviewPreferencesDefaults = Omit<ContentOverviewPreferences, 'version'>

export const CONTENT_OVERVIEW_PREFERENCES_DEFAULTS: ContentOverviewPreferencesDefaults = {
  pageSize: 20,
  density: 'comfortable',
  advancedOpen: false,
}

export function contentOverviewPreferencesKey(contentTypeKey: ContentTypeKey): string {
  return `${CONTENT_OVERVIEW_PREFERENCES_KEY_PREFIX}${contentTypeKey}`
}

export function readStoredContentOverviewPreferences(
  contentTypeKey: ContentTypeKey,
): unknown | null {
  try {
    const raw = localStorage.getItem(contentOverviewPreferencesKey(contentTypeKey))
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export function writeStoredContentOverviewPreferences(
  contentTypeKey: ContentTypeKey,
  preferences: ContentOverviewPreferences,
): void {
  try {
    localStorage.setItem(contentOverviewPreferencesKey(contentTypeKey), JSON.stringify(preferences))
  } catch {
    // Best-effort persistence — storage can fail in private mode.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePageSize(value: unknown): ContentOverviewPageSize | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  return CONTENT_OVERVIEW_PAGE_SIZES.includes(value as ContentOverviewPageSize)
    ? (value as ContentOverviewPageSize)
    : undefined
}

function parseDensity(value: unknown): DataTableDensity | undefined {
  return typeof value === 'string' && DATA_TABLE_DENSITIES.includes(value as DataTableDensity)
    ? (value as DataTableDensity)
    : undefined
}

function sanitizeColumnVisibility(
  visibility: unknown,
  columnSchema: ContentOverviewColumnSchema,
): ColumnChangeState['visibility'] | undefined {
  if (!isRecord(visibility)) return undefined

  const allowedIds = new Set(columnSchema.ids)
  const lockedIds = new Set(columnSchema.lockedIds ?? [])
  const sanitized: ColumnChangeState['visibility'] = {}

  for (const [id, visible] of Object.entries(visibility)) {
    if (!allowedIds.has(id) || typeof visible !== 'boolean') continue
    sanitized[id] = lockedIds.has(id) ? true : visible
  }

  for (const id of lockedIds) {
    sanitized[id] = true
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

function sanitizeColumnOrder(
  order: unknown,
  columnSchema: ContentOverviewColumnSchema,
): string[] | undefined {
  if (!Array.isArray(order)) return undefined

  const allowedIds = new Set(columnSchema.ids)
  const known = order.filter((id): id is string => typeof id === 'string' && allowedIds.has(id))
  const missing = columnSchema.ids.filter((id) => !known.includes(id))
  const sanitized = [...known, ...missing]

  return sanitized.length > 0 ? sanitized : undefined
}

function hasInvalidPreferenceFieldShapes(
  raw: Record<string, unknown>,
  parsed: {
    pageSize: ContentOverviewPageSize | undefined
    density: DataTableDensity | undefined
  },
): boolean {
  if (raw.columnVisibility !== undefined && !isRecord(raw.columnVisibility)) return true
  if (raw.columnOrder !== undefined && !Array.isArray(raw.columnOrder)) return true
  if (raw.pageSize !== undefined && parsed.pageSize === undefined) return true
  if (raw.density !== undefined && parsed.density === undefined) return true
  return false
}

/** Validates and sanitizes stored preferences. Returns `null` when the payload is invalid. */
export function validateContentOverviewPreferences(
  raw: unknown,
  columnSchema: ContentOverviewColumnSchema,
): ContentOverviewPreferences | null {
  if (!isRecord(raw)) return null
  if (raw.version !== CONTENT_OVERVIEW_PREFERENCES_VERSION) return null

  const columnVisibility = sanitizeColumnVisibility(raw.columnVisibility, columnSchema)
  const columnOrder = sanitizeColumnOrder(raw.columnOrder, columnSchema)
  const pageSize = parsePageSize(raw.pageSize)
  const density = parseDensity(raw.density)
  const advancedOpen = typeof raw.advancedOpen === 'boolean' ? raw.advancedOpen : undefined

  if (hasInvalidPreferenceFieldShapes(raw, { pageSize, density })) return null

  return {
    version: CONTENT_OVERVIEW_PREFERENCES_VERSION,
    ...(columnVisibility ? { columnVisibility } : {}),
    ...(columnOrder ? { columnOrder } : {}),
    ...(pageSize ? { pageSize } : {}),
    ...(density ? { density } : {}),
    ...(advancedOpen !== undefined ? { advancedOpen } : {}),
  }
}

export function createDefaultContentOverviewPreferences(
  defaults: ContentOverviewPreferencesDefaults = CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
): ContentOverviewPreferences {
  return {
    version: CONTENT_OVERVIEW_PREFERENCES_VERSION,
    ...defaults,
  }
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
  writeStoredContentOverviewPreferences(contentTypeKey, {
    ...preferences,
    version: CONTENT_OVERVIEW_PREFERENCES_VERSION,
  })
}
