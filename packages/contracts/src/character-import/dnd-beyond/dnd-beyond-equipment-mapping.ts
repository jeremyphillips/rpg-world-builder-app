import type {
  DndBeyondCatalogNameEntry,
  DndBeyondCatalogNameIndex,
} from './dnd-beyond-catalog-resolution'
import {
  createDndBeyondCatalogNameIndex,
  dndBeyondCatalogLookupKeys,
  normalizeDndBeyondCatalogLookupKey,
  resolveLocalCatalogMatchFromName,
} from './dnd-beyond-catalog-resolution'

// ---------------------------------------------------------------------------
// D&D Beyond inventory item names → local catalog equipment slug/id.
// ---------------------------------------------------------------------------

export type DndBeyondEquipmentNameIndex = DndBeyondCatalogNameIndex
export type DndBeyondEquipmentCatalogEntry = DndBeyondCatalogNameEntry

export const normalizeDndBeyondEquipmentLookupKey = normalizeDndBeyondCatalogLookupKey
export const dndBeyondEquipmentLookupKeys = dndBeyondCatalogLookupKeys
export const createDndBeyondEquipmentNameIndex = createDndBeyondCatalogNameIndex
export const resolveLocalEquipmentFromName = resolveLocalCatalogMatchFromName
