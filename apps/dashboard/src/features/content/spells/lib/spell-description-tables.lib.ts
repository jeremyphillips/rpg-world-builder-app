import { formatGeneralTableMetadata, type GeneralTable } from '@rpg/contracts'
import { extractTableEmbedIds } from '@rpg/ui'

export function formatSpellTableMetadata(table: GeneralTable): string {
  return formatGeneralTableMetadata(table)
}

/** Prune spell tables[] to ids still referenced in description HTML embeds. */
export function pruneSpellTablesToDescriptionEmbeds(
  description: string | undefined,
  tables: GeneralTable[],
): GeneralTable[] {
  const referenced = new Set(extractTableEmbedIds(description ?? ''))
  return tables.filter((table) => referenced.has(table.id))
}
