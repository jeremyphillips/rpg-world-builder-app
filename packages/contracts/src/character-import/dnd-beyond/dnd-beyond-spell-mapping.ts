import type {
  DndBeyondCatalogNameEntry,
  DndBeyondCatalogNameIndex,
} from './dnd-beyond-catalog-resolution'
import {
  createDndBeyondCatalogNameIndex,
  resolveLocalCatalogMatchFromName,
} from './dnd-beyond-catalog-resolution'

// ---------------------------------------------------------------------------
// D&D Beyond spell names → local catalog spell slug/id.
// ---------------------------------------------------------------------------

export type DndBeyondSpellNameIndex = DndBeyondCatalogNameIndex
export type DndBeyondSpellCatalogEntry = DndBeyondCatalogNameEntry

export const createDndBeyondSpellNameIndex = createDndBeyondCatalogNameIndex
export const resolveLocalSpellFromName = resolveLocalCatalogMatchFromName
