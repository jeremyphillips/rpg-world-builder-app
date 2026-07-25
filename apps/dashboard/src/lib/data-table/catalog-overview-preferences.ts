import type { ColumnChangeState } from '@rpg/ui'

import {
  createOverviewPreferences,
  type OverviewPreferencesColumnSchema,
} from '@/lib/overview-preferences'

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

export type CatalogOverviewColumnSchema = OverviewPreferencesColumnSchema

export type CatalogOverviewPreferencesDefaults = Omit<CatalogOverviewPreferences, 'version'>

export const CATALOG_OVERVIEW_PREFERENCES_DEFAULTS: CatalogOverviewPreferencesDefaults = {
  pageSize: 20,
  advancedOpen: false,
}

const catalogOverviewPreferencesStore = createOverviewPreferences({
  keyPrefix: CATALOG_OVERVIEW_PREFERENCES_KEY_PREFIX,
  version: CATALOG_OVERVIEW_PREFERENCES_VERSION,
  defaults: CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
  pageSizes: CATALOG_OVERVIEW_PAGE_SIZES,
})

export function catalogOverviewPreferencesKey(tableKey: string): string {
  return catalogOverviewPreferencesStore.preferencesKey(tableKey)
}

export function readStoredCatalogOverviewPreferences(tableKey: string): unknown | null {
  return catalogOverviewPreferencesStore.readStored(tableKey)
}

export function writeStoredCatalogOverviewPreferences(
  tableKey: string,
  preferences: CatalogOverviewPreferences,
): void {
  catalogOverviewPreferencesStore.writeStored(tableKey, preferences)
}

export function validateCatalogOverviewPreferences(
  raw: unknown,
  columnSchema: CatalogOverviewColumnSchema,
): CatalogOverviewPreferences | null {
  return catalogOverviewPreferencesStore.validate(raw, columnSchema)
}

export function createDefaultCatalogOverviewPreferences(
  defaults: CatalogOverviewPreferencesDefaults = CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
): CatalogOverviewPreferences {
  return catalogOverviewPreferencesStore.createDefault(defaults)
}

export function hydrateCatalogOverviewPreferences(
  tableKey: string,
  columnSchema: CatalogOverviewColumnSchema,
  defaults: CatalogOverviewPreferencesDefaults = CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
): CatalogOverviewPreferences {
  return catalogOverviewPreferencesStore.hydrate(tableKey, columnSchema, defaults)
}

export function persistCatalogOverviewPreferences(
  tableKey: string,
  preferences: CatalogOverviewPreferences,
): void {
  catalogOverviewPreferencesStore.persist(tableKey, preferences)
}
