import type { GeneralTable } from '@rpg/contracts'

export function formatSpellTableMetadata(table: GeneralTable): string {
  const columnCount = table.columns.length
  const rowCount = table.rows.length
  return `${columnCount} column${columnCount === 1 ? '' : 's'} · ${rowCount} row${rowCount === 1 ? '' : 's'}`
}

/** Prune spell tables[] to ids still referenced in description HTML embeds. */
export function pruneSpellTablesToDescriptionEmbeds(
  _description: string | undefined,
  tables: GeneralTable[],
  referencedIds: readonly string[],
): GeneralTable[] {
  const referenced = new Set(referencedIds)
  return tables.filter((table) => referenced.has(table.id))
}
