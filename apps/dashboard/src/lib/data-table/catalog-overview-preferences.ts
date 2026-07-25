import type { ColumnChangeState } from '@rpg/ui'

export const CATALOG_OVERVIEW_PREFERENCES_VERSION = 1 as const
export const CATALOG_OVERVIEW_PREFERENCES_KEY_PREFIX = 'rpg:catalog-overview:v1:'

export const CATALOG_OVERVIEW_PAGE_SIZES = [10, 20, 50, 100] as const
export type CatalogOverviewPageSize = (typeof CATALOG_OVERVIEW_PAGE_SIZES)[number]

export type CatalogOverviewPreferences = {
  version: typeof CATALOG_OVERVIEW_PREFERENCES_VERSION
  columnVisibility?: ColumnChangeState['visibility']
  columnOrder?: string[]
  pageSize?: CatalogOverviewPageSize
  advancedOpen?: boolean
}

export type CatalogOverviewColumnSchema = {
  ids: readonly string[]
  lockedIds?: readonly string[]
}

export type CatalogOverviewPreferencesDefaults = Omit<CatalogOverviewPreferences, 'version'>

export const CATALOG_OVERVIEW_PREFERENCES_DEFAULTS: CatalogOverviewPreferencesDefaults = {
  pageSize: 20,
  advancedOpen: false,
}

export function catalogOverviewPreferencesKey(tableKey: string): string {
  return `${CATALOG_OVERVIEW_PREFERENCES_KEY_PREFIX}${tableKey}`
}

export function readStoredCatalogOverviewPreferences(tableKey: string): unknown | null {
  try {
    const raw = localStorage.getItem(catalogOverviewPreferencesKey(tableKey))
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export function writeStoredCatalogOverviewPreferences(
  tableKey: string,
  preferences: CatalogOverviewPreferences,
): void {
  try {
    localStorage.setItem(catalogOverviewPreferencesKey(tableKey), JSON.stringify(preferences))
  } catch {
    // Best-effort persistence — storage can fail in private mode.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePageSize(value: unknown): CatalogOverviewPageSize | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  return CATALOG_OVERVIEW_PAGE_SIZES.includes(value as CatalogOverviewPageSize)
    ? (value as CatalogOverviewPageSize)
    : undefined
}

function sanitizeColumnVisibility(
  visibility: unknown,
  columnSchema: CatalogOverviewColumnSchema,
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
  columnSchema: CatalogOverviewColumnSchema,
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
    pageSize: CatalogOverviewPageSize | undefined
  },
): boolean {
  if (raw.columnVisibility !== undefined && !isRecord(raw.columnVisibility)) return true
  if (raw.columnOrder !== undefined && !Array.isArray(raw.columnOrder)) return true
  if (raw.pageSize !== undefined && parsed.pageSize === undefined) return true
  return false
}

/** Validates and sanitizes stored preferences. Returns `null` when the payload is invalid. */
export function validateCatalogOverviewPreferences(
  raw: unknown,
  columnSchema: CatalogOverviewColumnSchema,
): CatalogOverviewPreferences | null {
  if (!isRecord(raw)) return null
  if (raw.version !== CATALOG_OVERVIEW_PREFERENCES_VERSION) return null

  const columnVisibility = sanitizeColumnVisibility(raw.columnVisibility, columnSchema)
  const columnOrder = sanitizeColumnOrder(raw.columnOrder, columnSchema)
  const pageSize = parsePageSize(raw.pageSize)
  const advancedOpen = typeof raw.advancedOpen === 'boolean' ? raw.advancedOpen : undefined

  if (hasInvalidPreferenceFieldShapes(raw, { pageSize })) return null

  return {
    version: CATALOG_OVERVIEW_PREFERENCES_VERSION,
    ...(columnVisibility ? { columnVisibility } : {}),
    ...(columnOrder ? { columnOrder } : {}),
    ...(pageSize ? { pageSize } : {}),
    ...(advancedOpen !== undefined ? { advancedOpen } : {}),
  }
}

export function createDefaultCatalogOverviewPreferences(
  defaults: CatalogOverviewPreferencesDefaults = CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
): CatalogOverviewPreferences {
  return {
    version: CATALOG_OVERVIEW_PREFERENCES_VERSION,
    ...defaults,
  }
}

export function hydrateCatalogOverviewPreferences(
  tableKey: string,
  columnSchema: CatalogOverviewColumnSchema,
  defaults: CatalogOverviewPreferencesDefaults = CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
): CatalogOverviewPreferences {
  const stored = readStoredCatalogOverviewPreferences(tableKey)
  if (stored === null) {
    return createDefaultCatalogOverviewPreferences(defaults)
  }

  const validated = validateCatalogOverviewPreferences(stored, columnSchema)
  if (!validated) {
    return createDefaultCatalogOverviewPreferences(defaults)
  }

  return {
    ...createDefaultCatalogOverviewPreferences(defaults),
    ...validated,
    version: CATALOG_OVERVIEW_PREFERENCES_VERSION,
  }
}

export function persistCatalogOverviewPreferences(
  tableKey: string,
  preferences: CatalogOverviewPreferences,
): void {
  writeStoredCatalogOverviewPreferences(tableKey, {
    ...preferences,
    version: CATALOG_OVERVIEW_PREFERENCES_VERSION,
  })
}
